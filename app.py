"""
Resume vs Job Description Evaluator
A Flask web application that evaluates candidate resumes against job descriptions
using Hugging Face sentence-transformers for semantic similarity analysis.
"""

from flask import Flask, render_template, request, jsonify
import requests
import numpy as np
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Hugging Face API configuration
HF_API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
HF_API_TOKEN = os.getenv('HUGGINGFACE_API_TOKEN', '')

if not HF_API_TOKEN:
    print("\n" + "="*60)
    print("WARNING: No Hugging Face API token found!")
    print("Please add your token to the .env file.")
    print("Get your token from: https://huggingface.co/settings/tokens")
    print("="*60 + "\n")

HF_HEADERS = {"Authorization": f"Bearer {HF_API_TOKEN}"}


def get_embeddings(text):
    """
    Get sentence embeddings from Hugging Face API
    
    Args:
        text: Input text to embed
        
    Returns:
        numpy array of embeddings
    """
    if not HF_API_TOKEN:
        raise Exception("Hugging Face API token is required. Please add your token to the .env file. Get it from https://huggingface.co/settings/tokens")
    
    response = requests.post(
        HF_API_URL,
        headers=HF_HEADERS,
        json={"inputs": text, "options": {"wait_for_model": True}}
    )
    
    if response.status_code == 200:
        result = response.json()
        return np.array(result)
    elif response.status_code == 503:
        raise Exception("Model is loading, please wait a moment and try again")
    else:
        raise Exception(f"Hugging Face API error: {response.status_code} - {response.text}")


def cosine_similarity(vec1, vec2):
    """
    Calculate cosine similarity between two vectors
    
    Args:
        vec1, vec2: numpy arrays
        
    Returns:
        float: similarity score between -1 and 1
    """
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    return dot_product / (norm1 * norm2)


def extract_keywords(text):
    """
    Extract important keywords from text (simple word-based extraction)
    
    Args:
        text: Input text
        
    Returns:
        set of keywords
    """
    # Remove common words and extract meaningful terms
    common_words = {'the', 'a', 'an', 'in', 'on', 'at', 'for', 'to', 'of', 'and', 'or', 'with', 'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must'}
    words = text.lower().replace('\n', ' ').replace(',', ' ').replace('.', ' ').split()
    keywords = {word for word in words if len(word) > 3 and word not in common_words}
    return keywords


def analyze_match(job_desc, resume, similarity_score):
    """
    Analyze the match between job description and resume
    
    Args:
        job_desc: Job description text
        resume: Resume text
        similarity_score: Computed similarity score (0-100)
        
    Returns:
        dict with strengths, gaps, verdict, and suggestions
    """
    job_keywords = extract_keywords(job_desc)
    resume_keywords = extract_keywords(resume)
    
    # Find matching and missing keywords
    matching_keywords = job_keywords.intersection(resume_keywords)
    missing_keywords = job_keywords - resume_keywords
    
    # Determine verdict based on score
    if similarity_score >= 75:
        verdict = "Hire"
    elif similarity_score >= 50:
        verdict = "Hold"
    else:
        verdict = "Reject"
    
    # Generate strengths (focus on matches)
    strengths = []
    if matching_keywords:
        sample_matches = list(matching_keywords)[:5]
        strengths.append(f"Strong alignment with required skills: {', '.join(list(sample_matches)[:3])}")
    strengths.append(f"Overall semantic similarity score of {similarity_score}% indicates good potential fit")
    strengths.append("Resume demonstrates relevant experience matching job requirements")
    
    # Ensure exactly 3 strengths
    strengths = strengths[:3]
    
    # Generate gaps (focus on missing elements)
    gaps = []
    if missing_keywords:
        sample_missing = list(missing_keywords)[:5]
        gaps.append(f"Missing key skills or keywords: {', '.join(list(sample_missing)[:3])}")
    gaps.append("Some job requirements may not be explicitly addressed in the resume")
    gaps.append("Could benefit from more specific examples or quantifiable achievements")
    
    # Ensure exactly 3 gaps
    gaps = gaps[:3]
    
    # Reasons for verdict
    if verdict == "Hire":
        reasons_for = [
            f"High match score of {similarity_score}% demonstrates strong alignment",
            "Candidate's qualifications closely match job requirements"
        ]
        reasons_against = [
            "Some minor skill gaps that may require on-the-job training",
            "Consider conducting technical assessment to validate claimed skills"
        ]
    elif verdict == "Hold":
        reasons_for = [
            f"Moderate match score of {similarity_score}% shows potential fit",
            "Candidate has some relevant experience worth exploring further"
        ]
        reasons_against = [
            "Several key requirements are not clearly demonstrated",
            "May require significant training or skill development"
        ]
    else:  # Reject
        reasons_for = [
            "Candidate may have transferable skills not immediately obvious",
            "Could be suitable for a different role with modified requirements"
        ]
        reasons_against = [
            f"Low match score of {similarity_score}% indicates significant gaps",
            "Resume does not demonstrate required qualifications for this position"
        ]
    
    # Improvement suggestions
    improvement_suggestions = []
    if missing_keywords:
        sample_missing = list(missing_keywords)[:3]
        improvement_suggestions.append(f"Add experience or certifications related to: {', '.join(sample_missing)}")
    improvement_suggestions.append("Include more quantifiable achievements and specific examples of relevant work")
    
    # Ensure exactly 2 suggestions
    improvement_suggestions = improvement_suggestions[:2]
    
    return {
        "strengths": strengths,
        "gaps": gaps,
        "verdict": verdict,
        "reasons_for": reasons_for,
        "reasons_against": reasons_against,
        "improvement_suggestions": improvement_suggestions
    }


@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html')


@app.route('/evaluate', methods=['POST'])
def evaluate():
    """
    API endpoint to evaluate resume against job description
    
    Expected JSON:
    {
        "job_description": "string",
        "resume": "string"
    }
    
    Returns JSON with match score, strengths, gaps, verdict, etc.
    """
    try:
        # Get input data
        data = request.get_json()
        job_description = data.get('job_description', '').strip()
        resume = data.get('resume', '').strip()
        
        # Validate inputs
        if not job_description or not resume:
            return jsonify({
                "error": "Both job description and resume are required"
            }), 400
        
        if len(job_description) < 50:
            return jsonify({
                "error": "Job description is too short. Please provide more details."
            }), 400
            
        if len(resume) < 50:
            return jsonify({
                "error": "Resume is too short. Please provide more details."
            }), 400
        
        # Get embeddings from Hugging Face
        job_embedding = get_embeddings(job_description)
        resume_embedding = get_embeddings(resume)
        
        # Calculate similarity
        similarity = cosine_similarity(job_embedding, resume_embedding)
        
        # Convert to 0-100 scale
        # Cosine similarity ranges from -1 to 1, but in practice it's usually 0 to 1 for text
        match_score = int(max(0, min(100, similarity * 100)))
        
        # Analyze the match and get detailed insights
        analysis = analyze_match(job_description, resume, match_score)
        
        # Prepare response
        response = {
            "match_score": match_score,
            "strengths": analysis["strengths"],
            "gaps": analysis["gaps"],
            "verdict": analysis["verdict"],
            "reasons_for": analysis["reasons_for"],
            "reasons_against": analysis["reasons_against"],
            "improvement_suggestions": analysis["improvement_suggestions"]
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            "error": f"An error occurred: {str(e)}"
        }), 500


if __name__ == '__main__':
    print("=" * 60)
    print("Resume vs Job Description Evaluator")
    print("=" * 60)
    print("Starting Flask server...")
    print("Open your browser and navigate to: http://localhost:5000")
    print("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)
