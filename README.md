# 🎯 Resume vs Job Description Evaluator

An AI-powered web application that evaluates how well a candidate's resume matches a job description using semantic similarity analysis. Built with Flask, Vanilla JavaScript, and Hugging Face Sentence Transformers.

---

## 📋 Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
- [Scoring & Verdict Logic](#scoring--verdict-logic)
- [Sample Input/Output](#sample-inputoutput)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Evaluation Guidelines](#evaluation-guidelines)
- [Limitations](#limitations)
- [Future Improvements](#future-improvements)

---

## 🔍 Overview

This web application helps recruiters and hiring managers quickly assess candidate-job fit by:
- Computing semantic similarity between job descriptions and resumes
- Generating structured evaluation reports
- Providing actionable insights and improvement suggestions
- Delivering bias-free, job-relevant assessments

**Key Principle:** The evaluation focuses ONLY on job-relevant skills, experience, and qualifications—ignoring personal attributes like name, age, gender, location, or educational institution names.

---

## 🧠 How It Works

### Architecture

```
User Input (Job Description + Resume)
         ↓
Frontend (HTML/CSS/JS)
         ↓
Flask REST API (/evaluate endpoint)
         ↓
Hugging Face API (sentence-transformers/all-MiniLM-L6-v2)
         ↓
Embedding Generation
         ↓
Cosine Similarity Calculation
         ↓
Score Conversion (0-100 scale)
         ↓
Analysis & Verdict Generation
         ↓
Structured JSON Response
         ↓
Display Results to User
```

### Evaluation Process

1. **Embedding Generation**: Both the job description and resume are converted into dense vector representations (embeddings) using the Hugging Face `sentence-transformers/all-MiniLM-L6-v2` model.

2. **Similarity Calculation**: Cosine similarity is computed between the two embedding vectors, producing a score between -1 and 1 (typically 0 to 1 for text).

3. **Score Normalization**: The similarity score is converted to a 0-100 scale for easier interpretation.

4. **Keyword Analysis**: The system extracts keywords from both texts to identify matching skills and gaps.

5. **Verdict Determination**: Based on the match score:
   - **≥75**: Hire (Strong match)
   - **50-74**: Hold (Moderate match, needs review)
   - **<50**: Reject (Weak match)

6. **Insight Generation**: The system generates:
   - 3 strengths
   - 3 gaps
   - 2 reasons supporting the verdict
   - 2 reasons against the verdict
   - 2 improvement suggestions

---

## ✨ Features

- **AI-Powered Analysis**: Uses state-of-the-art sentence transformers for semantic understanding
- **Structured Output**: Consistent, easy-to-read evaluation format
- **Bias-Free Evaluation**: Focuses only on job-relevant factors
- **Real-Time Processing**: Fast API responses with loading indicators
- **Responsive Design**: Works on desktop and mobile devices
- **No Database Required**: Stateless operation for simplicity
- **Free to Run**: Uses Hugging Face's free inference API

---

## 🛠️ Tech Stack

### Frontend
- **HTML5**: Structure and layout
- **CSS3**: Styling with gradients and animations
- **Vanilla JavaScript**: Client-side logic and API calls

### Backend
- **Python 3.8+**: Core programming language
- **Flask 3.0.0**: Lightweight web framework
- **NumPy 1.26.2**: Numerical computations (cosine similarity)
- **Requests 2.31.0**: HTTP client for API calls

### AI/NLP
- **Hugging Face Inference API**: Cloud-based model serving
- **Model**: `sentence-transformers/all-MiniLM-L6-v2`
  - Lightweight and fast
  - Optimized for semantic similarity tasks
  - 384-dimensional embeddings

---

## 🚀 Setup Instructions

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Internet connection (for Hugging Face API calls)

### Installation Steps

1. **Clone or Download the Project**
   ```bash
   cd "c:\Users\vinay\Resume vs Job Description Evaluator\Resume-vs-Job-Description-Evaluator"
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Application**
   ```bash
   python app.py
   ```

4. **Access the Web App**
   - Open your browser and navigate to: `http://localhost:5000`
   - You should see the Resume vs Job Description Evaluator interface

### Troubleshooting

- **Port Already in Use**: If port 5000 is occupied, modify the `app.run()` line in `app.py` to use a different port:
  ```python
  app.run(debug=True, host='0.0.0.0', port=5001)
  ```

- **API Rate Limits**: The free Hugging Face API has rate limits. If you encounter errors, wait a few seconds and try again. For production use, sign up for a Hugging Face account and get an API token.

- **Connection Errors**: Ensure you have a stable internet connection for API calls.

---

## 💻 Usage

### Step 1: Enter Job Description
Paste the complete job posting or requirements in the left textarea. Include:
- Job title
- Required skills and technologies
- Experience requirements
- Educational qualifications
- Responsibilities

**Example:**
```
Senior Python Developer

We are looking for an experienced Python developer with 5+ years of experience.

Required Skills:
- Strong proficiency in Python, Flask, and Django
- Experience with REST APIs and microservices
- Knowledge of SQL databases (PostgreSQL, MySQL)
- Familiarity with Docker and Kubernetes
- Experience with cloud platforms (AWS, Azure, or GCP)
- Version control with Git

Responsibilities:
- Design and develop scalable web applications
- Write clean, maintainable code
- Collaborate with cross-functional teams
```

### Step 2: Enter Resume
Paste the candidate's resume in the right textarea. Include:
- Professional experience
- Skills and technologies
- Education
- Certifications
- Projects

**Example:**
```
John Doe
Software Engineer

Experience:
- Senior Python Developer at TechCorp (2019-2024)
  - Built REST APIs using Flask and FastAPI
  - Developed microservices architecture
  - Worked with PostgreSQL and MongoDB
  - Deployed applications on AWS using Docker

Skills:
- Python, Flask, FastAPI, Django
- SQL (PostgreSQL, MySQL)
- Docker, Kubernetes
- AWS, Git, REST APIs

Education:
- Bachelor's in Computer Science
```

### Step 3: Click "Evaluate Fit"
The system will:
1. Show a loading indicator
2. Call the Hugging Face API
3. Compute similarity scores
4. Generate the evaluation report
5. Display results with animations

### Step 4: Review Results
The evaluation report includes:
- **Match Score**: 0-100 rating
- **Verdict**: Hire/Hold/Reject
- **Strengths**: What the candidate has going for them
- **Gaps**: What's missing from the resume
- **Reasons For**: Why the verdict makes sense
- **Reasons Against**: Counterpoints to consider
- **Suggestions**: How the candidate can improve

---

## 📊 Scoring & Verdict Logic

### Match Score Calculation

1. **Generate Embeddings**: 
   - Job description → 384-dimensional vector
   - Resume → 384-dimensional vector

2. **Compute Cosine Similarity**:
   ```
   similarity = (A · B) / (||A|| × ||B||)
   ```
   Where A and B are the embedding vectors

3. **Convert to 0-100 Scale**:
   ```
   match_score = similarity × 100
   ```

### Verdict Rules

| Score Range | Verdict | Meaning |
|-------------|---------|---------|
| 75-100 | **Hire** | Strong alignment with job requirements |
| 50-74 | **Hold** | Moderate fit, requires further evaluation |
| 0-49 | **Reject** | Significant gaps in qualifications |

### Interpretation Guidelines

- **85-100**: Exceptional match, candidate exceeds requirements
- **75-84**: Strong match, candidate meets all key requirements
- **60-74**: Good potential, but missing some desired skills
- **50-59**: Borderline fit, significant training required
- **Below 50**: Poor match, better suited for different role

---

## 📝 Sample Input/Output

### Sample Input

**Job Description:**
```
Data Scientist - Machine Learning Engineer

Requirements:
- 3+ years of experience in machine learning and data science
- Strong Python programming skills
- Experience with TensorFlow, PyTorch, or scikit-learn
- Knowledge of statistical analysis and data visualization
- SQL and database experience
- Excellent communication skills
```

**Resume:**
```
Sarah Johnson
Data Scientist

Experience:
- Data Scientist at Analytics Inc. (2020-2024)
  - Developed ML models using Python and scikit-learn
  - Created data visualizations with Matplotlib and Seaborn
  - Worked with SQL databases for data extraction
  - Collaborated with cross-functional teams

Skills:
- Python (pandas, numpy, scikit-learn)
- SQL (PostgreSQL)
- Data visualization (Matplotlib, Tableau)
- Statistical analysis
```

### Sample Output

```json
{
  "match_score": 78,
  "strengths": [
    "Strong alignment with required skills: python, experience, machine",
    "Overall semantic similarity score of 78% indicates good potential fit",
    "Resume demonstrates relevant experience matching job requirements"
  ],
  "gaps": [
    "Missing key skills or keywords: tensorflow, pytorch, communication",
    "Some job requirements may not be explicitly addressed in the resume",
    "Could benefit from more specific examples or quantifiable achievements"
  ],
  "verdict": "Hire",
  "reasons_for": [
    "High match score of 78% demonstrates strong alignment",
    "Candidate's qualifications closely match job requirements"
  ],
  "reasons_against": [
    "Some minor skill gaps that may require on-the-job training",
    "Consider conducting technical assessment to validate claimed skills"
  ],
  "improvement_suggestions": [
    "Add experience or certifications related to: tensorflow, pytorch, communication",
    "Include more quantifiable achievements and specific examples of relevant work"
  ]
}
```

---

## 📁 Project Structure

```
Resume-vs-Job-Description-Evaluator/
│
├── app.py                      # Flask backend with API logic
├── requirements.txt            # Python dependencies
├── README.md                   # This file
│
├── templates/
│   └── index.html             # Main HTML page
│
└── static/
    ├── style.css              # CSS styling
    └── script.js              # Frontend JavaScript logic
```

### File Descriptions

- **app.py**: Main Flask application containing:
  - `/` route for serving the web page
  - `/evaluate` POST endpoint for processing evaluations
  - Hugging Face API integration
  - Cosine similarity calculation
  - Analysis logic

- **index.html**: Frontend interface with:
  - Two textareas for input
  - Evaluate button
  - Results display sections
  - Loading indicators

- **style.css**: Professional styling with:
  - Gradient backgrounds
  - Responsive grid layout
  - Animations and transitions
  - Color-coded verdict badges

- **script.js**: Client-side logic for:
  - Form validation
  - API communication
  - Results rendering
  - Score animations

---

## 🔌 API Documentation

### Endpoint: `/evaluate`

**Method:** POST

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "job_description": "string (minimum 50 characters)",
  "resume": "string (minimum 50 characters)"
}
```

**Success Response (200):**
```json
{
  "match_score": 82,
  "strengths": ["...", "...", "..."],
  "gaps": ["...", "...", "..."],
  "verdict": "Hire",
  "reasons_for": ["...", "..."],
  "reasons_against": ["...", "..."],
  "improvement_suggestions": ["...", "..."]
}
```

**Error Response (400):**
```json
{
  "error": "Both job description and resume are required"
}
```

**Error Response (500):**
```json
{
  "error": "An error occurred: [error details]"
}
```

---

## ⚖️ Evaluation Guidelines

### What IS Evaluated
✅ Technical skills and proficiencies  
✅ Years and type of experience  
✅ Relevant certifications  
✅ Job-specific qualifications  
✅ Project experience  
✅ Tools and technologies used  

### What IS NOT Evaluated
❌ Candidate's name  
❌ Age or date of birth  
❌ Gender or pronouns  
❌ University or college name (prestige)  
❌ Geographic location  
❌ Personal characteristics  
❌ Hobbies (unless job-relevant)  

### Ethical Considerations
- The system is designed to minimize bias by focusing on objective job requirements
- All insights are derived from semantic similarity, not hard-coded rules
- Results should be used as ONE INPUT in hiring decisions, not the sole determinant
- Human review is essential for fair and comprehensive evaluation

---

## ⚠️ Limitations

1. **No Deep NLP Understanding**: The model uses embeddings but doesn't truly "understand" context like a human would

2. **Keyword Dependency**: May miss subtle qualifications if not explicitly stated

3. **Free API Constraints**: Hugging Face free tier has rate limits and potential latency

4. **No Historical Data**: Each evaluation is independent; no learning from past decisions

5. **Language Support**: Optimized for English text; other languages may have reduced accuracy

6. **No Document Parsing**: Requires plain text input; doesn't extract from PDFs or Word documents

7. **Simplistic Keyword Analysis**: Basic word-matching may not capture synonyms or related concepts

---

## 🚀 Future Improvements

### Potential Enhancements

1. **PDF/DOCX Upload**: Support file uploads instead of copy-paste
2. **Multi-Language Support**: Add support for non-English resumes
3. **Skill Extraction**: Use Named Entity Recognition (NER) for better skill identification
4. **Experience Weight**: Give more weight to recent and relevant experience
5. **Batch Processing**: Evaluate multiple resumes against one job description
6. **Export Reports**: Generate PDF reports of evaluations
7. **User Authentication**: Save evaluation history
8. **Customizable Scoring**: Allow users to adjust verdict thresholds
9. **Integration APIs**: Connect with ATS (Applicant Tracking Systems)
10. **Advanced Models**: Use larger models like BERT or GPT for deeper analysis

### Contributing

This is a demonstration project. For production use, consider:
- Adding authentication and authorization
- Implementing database storage for audit trails
- Using a paid API tier for better performance
- Adding comprehensive error handling
- Implementing logging and monitoring
- Adding unit and integration tests

---

## 📄 License

This project is provided as-is for educational and demonstration purposes.

---

## 🙏 Acknowledgments

- **Hugging Face**: For providing free access to state-of-the-art NLP models
- **sentence-transformers**: For excellent semantic similarity models
- **Flask**: For a simple yet powerful web framework

---

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section in Setup Instructions
2. Review the API Documentation
3. Ensure all dependencies are correctly installed

---

**Built with ❤️ for fair and efficient hiring processes**

---

## Quick Start Summary

```bash
# Navigate to project directory
cd "c:\Users\vinay\Resume vs Job Description Evaluator\Resume-vs-Job-Description-Evaluator"

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py

# Open browser to http://localhost:5000
```

**That's it! You're ready to start evaluating candidates.**
