# FitMatch AI - Resume and Job Description Evaluator

A professional AI-powered web application that evaluates candidate-job fit through semantic similarity analysis. FitMatch AI provides objective, bias-free hiring assessments using advanced natural language processing and interactive animations.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technical Architecture](#technical-architecture)
- [Installation and Setup](#installation-and-setup)
- [Usage Guide](#usage-guide)
- [Evaluation Methodology](#evaluation-methodology)
- [Scoring System](#scoring-system)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Limitations and Considerations](#limitations-and-considerations)
- [Roadmap](#roadmap)

## Overview

FitMatch AI streamlines the recruitment process by providing intelligent analysis of resume-to-job-description alignment. The application combines cutting-edge AI models with a polished user interface to deliver professional hiring assessments within seconds.

### Purpose

- Reduce hiring bias by focusing exclusively on job-relevant qualifications
- Accelerate initial resume screening with data-driven insights
- Provide structured evaluation reports for hiring teams
- Deliver actionable improvement suggestions to candidates

### Core Principle

Evaluation focuses exclusively on job-relevant qualifications including skills, experience, education, and certifications. Personal attributes (name, age, gender, location, institution prestige) are deliberately excluded to ensure fair and objective assessment.

## Key Features

- AI-Powered Semantic Analysis: Uses state-of-the-art Hugging Face sentence transformers
- Structured Evaluation Reports: Comprehensive analysis with strengths, gaps, and recommendations
- Bias-Free Assessment: Designed to minimize hiring discrimination through objective criteria
- Interactive User Interface: Smooth animations with GSAP and ScrollTrigger
- Professional Design: Dark mode support, responsive layout, production-ready styling
- Real-Time Processing: Fast API responses with intuitive loading indicators
- No External Database: Stateless operation requiring no storage infrastructure
- Cost-Effective: Uses free Hugging Face inference API

## Technical Architecture

### System Components

```
User Interface (HTML5/CSS3/JavaScript)
         |
         v
Flask Web Application
         |
         v
Hugging Face Inference API
         |
         v
Sentence Transformer Model
(all-MiniLM-L6-v2)
         |
         v
Embedding Generation & Similarity Calculation
         |
         v
Analysis Report Generation
         |
         v
JSON Response
```

### Technology Stack

**Frontend:**
- HTML5: Document structure and semantics
- CSS3: Professional styling with gradients and responsive design
- GSAP 3.12.2: Animation library for scroll-triggered effects
- Vanilla JavaScript: Client-side logic and API integration

**Backend:**
- Python 3.8+: Core programming language
- Flask 3.0.0: Lightweight web framework
- NumPy: Numerical computations for similarity calculations

**AI/NLP:**
- Hugging Face Inference API: Cloud-based model hosting
- Model: sentence-transformers/all-MiniLM-L6-v2
  - 384-dimensional embeddings
- Optimized for semantic similarity tasks
  - Lightweight and fast inference

## Installation and Setup

### Prerequisites

- Python 3.8 or higher
- pip package manager
- Internet connection for Hugging Face API
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation Steps

1. Clone or download the project
```bash
cd "Resume vs Job Description Evaluator\Resume-vs-Job-Description-Evaluator"
```

2. Install Python dependencies
```bash
pip install -r requirements.txt
```

3. Launch the application
```bash
python app.py
```

4. Access the web interface
```
Open http://localhost:5000 in your web browser
```

### Configuration

The application runs on port 5000 by default. To use a different port, edit app.py:

```python
app.run(debug=True, host='0.0.0.0', port=5001)
```

### Troubleshooting

**Port Already in Use**
- Change the port number in app.py to an available port
- Verify no other applications are using port 5000

**API Rate Limits**
- The free Hugging Face tier has rate limits
- Wait a few seconds between requests
- For production use, obtain a Hugging Face API token

**Connection Issues**
- Verify stable internet connection
- Check firewall and proxy settings
- Ensure Hugging Face API endpoint is accessible

## Usage Guide

### Step 1: Enter Job Description

Paste the complete job posting in the left input field. Include relevant details:

- Job title and level
- Required technical skills and technologies
- Years of experience needed
- Educational requirements
- Key responsibilities
- Preferred qualifications

### Step 2: Enter Candidate Resume

Paste the candidate's resume in the right input field. Include:

- Professional experience with dates
- Technical skills and proficiencies
- Educational background
- Relevant certifications
- Project experience
- Quantifiable achievements

### Step 3: Initiate Evaluation

Click the "Evaluate Fit" button to begin analysis. The system will:

- Display loading indicator
- Call Hugging Face API for embeddings
- Compute similarity metrics
- Generate comprehensive analysis
- Display results with animations

### Step 4: Review Results

The evaluation report provides:

- Match Score: 0-100 quantitative assessment
- Verdict: Hire, Hold, or Reject classification
- Strengths: Candidate qualities aligned with requirements
- Gaps: Missing skills or experience
- Reasons Supporting Verdict: Evidence supporting decision
- Reasons Against Verdict: Potential counterpoints
- Improvement Suggestions: Recommendations for candidate

## Evaluation Methodology

### Embedding Generation

Both job description and resume are converted to 384-dimensional vector representations using the sentence-transformers/all-MiniLM-L6-v2 model. This captures semantic meaning rather than relying on keyword matching.

### Similarity Calculation

Cosine similarity is computed between embeddings:

```
similarity = (A . B) / (||A|| x ||B||)
```

This produces a normalized score between -1 and 1, typically 0 to 1 for text.

### Score Normalization

The similarity score is converted to 0-100 scale:

```
match_score = similarity x 100
```

### Analysis Generation

- Keyword extraction identifies key technical skills
- Strengths are skills present in both job and resume
- Gaps are required skills missing from resume
- Verdict determined by score thresholds
- Recommendations suggest development areas

## Scoring System

### Match Score Interpretation

| Score Range | Verdict | Interpretation |
|------------|---------|-----------------|
| 85-100 | Hire | Exceptional alignment, candidate exceeds requirements |
| 75-84 | Hire | Strong match, all key requirements met |
| 60-74 | Hold | Moderate fit, some key skills missing |
| 50-59 | Hold | Borderline fit, significant gaps present |
| Below 50 | Reject | Poor alignment, significant mismatch |

### Score Components

- Technical Skills Match: Programming languages, frameworks, tools
- Experience Alignment: Years of relevant domain experience
- Responsibility Coverage: Candidate's past roles match job duties
- Education and Certifications: Formal qualifications

## API Reference

### Endpoint: /evaluate

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

**Success Response (HTTP 200):**
```json
{
  "match_score": 82,
  "verdict": "Hire",
  "strengths": [
    "Strong Python and Flask experience",
    "AWS cloud platform expertise",
    "Database optimization background"
  ],
  "gaps": [
    "Limited Kubernetes experience",
    "Apache Kafka implementation not mentioned",
    "Docker experience not explicitly stated"
  ],
  "reasons_for": [
    "Match score of 82 indicates strong alignment",
    "Candidate demonstrates core technical requirements"
  ],
  "reasons_against": [
    "Some DevOps tools require further verification",
    "Years of experience slightly below preferred level"
  ],
  "improvement_suggestions": [
    "Gain practical Kubernetes deployment experience",
    "Develop expertise in message queue systems"
  ]
}
```

**Error Response (HTTP 400):**
```json
{
  "error": "Both job description and resume are required"
}
```

**Error Response (HTTP 500):**
```json
{
  "error": "Evaluation failed: [error details]"
}
```

## Project Structure

```
Resume-vs-Job-Description-Evaluator/
├── app.py                 # Flask application and API logic
├── requirements.txt       # Python dependencies
├── README.md              # Documentation
│
├── templates/
│   └── index.html         # Frontend HTML interface
│
└── static/
    ├── style.css          # Styling and GSAP animations
    └── script.js          # Client-side JavaScript logic
```

### Component Responsibilities

**app.py**
- Flask application initialization
- HTTP endpoint routing
- Hugging Face API integration
- Embedding generation and similarity calculations
- Analysis report generation
- Error handling and input validation

**index.html**
- Page structure and layout
- Input textareas for job and resume
- Evaluation button and results sections
- Loading indicators
- Results display with animations

**style.css**
- Professional UI styling
- Gradient backgrounds
- Responsive grid layouts
- GSAP scroll animations
- Dark mode support
- Interactive hover effects

**script.js**
- Form validation
- API communication
- Results rendering
- GSAP animation initialization
- Theme toggle functionality
- Responsive design handling

## Limitations and Considerations

### Technical Limitations

- Model Understanding: Embeddings capture semantic meaning but lack full contextual comprehension
- Keyword Dependency: Quality depends on explicit text presence in documents
- Language Support: Optimized for English; other languages have reduced accuracy
- Document Format: Requires plain text input; does not parse PDFs or Word files
- API Constraints: Free tier has rate limits and latency considerations
- Historical Context: Each evaluation is independent; no learning from past outcomes
- Ambiguity Resolution: May not handle context-dependent meanings effectively

### Assessment Recommendations

- Use as Initial Screening: Valuable for initial screening, not final hiring decisions
- Human Review Essential: Always conduct human review before hiring decisions
- Multiple Inputs: Consider as one factor among many in hiring process
- Technical Verification: Validate technical skills through assessments
- Cultural Fit: Tool focuses on qualifications, not cultural alignment
- Bias Awareness: While designed to minimize bias, no algorithm is perfectly objective

### Best Practices

1. Provide detailed job descriptions with specific requirements
2. Ensure resume content is complete and professionally formatted
3. Use consistent terminology across documents
4. Cross-reference results with interviews and assessments
5. Regularly validate evaluation accuracy against hire success

## Roadmap

### Planned Enhancements

- Document Upload: Support PDF and DOCX file uploads
- Multi-Language: Add support for non-English documents
- Skill Extraction: Named Entity Recognition for structured skills
- Batch Processing: Evaluate multiple resumes against one job
- Export Functionality: Generate PDF evaluation reports
- Analytics Dashboard: Track evaluation patterns and outcomes
- Custom Scoring: Allow users to adjust verdict thresholds
- ATS Integration: Connect with Applicant Tracking Systems

### Production Considerations

For production deployment, implement:

- User Authentication: Secure access and user management
- Database Storage: Persistent storage for audit trails
- Enhanced Security: Input validation, rate limiting, encryption
- Comprehensive Logging: System monitoring and performance tracking
- Error Handling: Robust error management
- Unit Testing: Automated test coverage
- API Rate Limiting: Protection against abuse
- Load Balancing: Handle concurrent users

## Dependencies

**Backend:**
- Flask 3.0.0
- Requests 2.31.0
- NumPy 1.26.2
- python-dotenv

**Frontend:**
- HTML5
- CSS3
- GSAP 3.12.2
- Vanilla JavaScript

**AI/NLP:**
- Hugging Face Inference API
- sentence-transformers/all-MiniLM-L6-v2

## Support

### Getting Help

1. Review the Troubleshooting section
2. Consult the API Reference
3. Check error messages for specific issues
4. Verify all dependencies are correctly installed

## License

This project is provided for educational and demonstration purposes.

## Acknowledgments

- Hugging Face: For accessible NLP model infrastructure
- Sentence-Transformers: For semantic similarity models
- Flask: For the web framework
- GSAP: For animation library

## Quick Start

```bash
# Navigate to project directory
cd "Resume vs Job Description Evaluator\Resume-vs-Job-Description-Evaluator"

# Install dependencies
pip install -r requirements.txt

# Run application
python app.py

# Access at http://localhost:5000
```

The application is ready for use. Navigate to the web interface and begin evaluating candidate-job fit.
