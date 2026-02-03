/**
 * Resume vs Job Description Evaluator - Frontend Logic
 * Handles user interactions and API communication
 */

// DOM Elements
const jobDescriptionTextarea = document.getElementById('jobDescription');
const resumeTextarea = document.getElementById('resume');
const evaluateBtn = document.getElementById('evaluateBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessage = document.getElementById('errorMessage');
const resultsSection = document.getElementById('resultsSection');

// Result elements
const scoreValue = document.getElementById('scoreValue');
const scoreCircle = document.getElementById('scoreCircle');
const verdictBadge = document.getElementById('verdictBadge');
const strengthsList = document.getElementById('strengthsList');
const gapsList = document.getElementById('gapsList');
const reasonsForList = document.getElementById('reasonsForList');
const reasonsAgainstList = document.getElementById('reasonsAgainstList');
const suggestionsList = document.getElementById('suggestionsList');

/**
 * Show error message to user
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    loadingIndicator.classList.add('hidden');
    resultsSection.classList.add('hidden');
}

/**
 * Hide error message
 */
function hideError() {
    errorMessage.classList.add('hidden');
}

/**
 * Show loading indicator
 */
function showLoading() {
    loadingIndicator.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    hideError();
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

/**
 * Validate inputs before sending to API
 */
function validateInputs(jobDesc, resume) {
    if (!jobDesc || jobDesc.trim().length === 0) {
        return { valid: false, message: 'Please enter a job description' };
    }
    
    if (!resume || resume.trim().length === 0) {
        return { valid: false, message: 'Please enter a resume' };
    }
    
    if (jobDesc.trim().length < 50) {
        return { valid: false, message: 'Job description is too short. Please provide at least 50 characters.' };
    }
    
    if (resume.trim().length < 50) {
        return { valid: false, message: 'Resume is too short. Please provide at least 50 characters.' };
    }
    
    return { valid: true };
}

/**
 * Create list items for array of strings
 */
function createListItems(items, parentElement) {
    parentElement.innerHTML = '';
    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        parentElement.appendChild(li);
    });
}

/**
 * Create suggestion items
 */
function createSuggestionItems(suggestions, parentElement) {
    parentElement.innerHTML = '';
    suggestions.forEach(suggestion => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = suggestion;
        parentElement.appendChild(div);
    });
}

/**
 * Animate score counter
 */
function animateScore(targetScore) {
    let currentScore = 0;
    const increment = targetScore / 50; // Will take 50 steps
    const duration = 1500; // 1.5 seconds
    const stepTime = duration / 50;
    
    const timer = setInterval(() => {
        currentScore += increment;
        if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(timer);
        }
        scoreValue.textContent = Math.round(currentScore);
        
        // Update color based on score
        if (currentScore >= 75) {
            scoreValue.style.color = '#34c759';
        } else if (currentScore >= 50) {
            scoreValue.style.color = '#ffc107';
        } else {
            scoreValue.style.color = '#dc3545';
        }
    }, stepTime);
}

/**
 * Display evaluation results
 */
function displayResults(data) {
    // Animate score
    animateScore(data.match_score);
    
    // Display verdict with appropriate styling
    verdictBadge.textContent = data.verdict;
    verdictBadge.className = 'verdict-badge';
    
    if (data.verdict === 'Hire') {
        verdictBadge.classList.add('hire');
    } else if (data.verdict === 'Hold') {
        verdictBadge.classList.add('hold');
    } else if (data.verdict === 'Reject') {
        verdictBadge.classList.add('reject');
    }
    
    // Display strengths
    createListItems(data.strengths, strengthsList);
    
    // Display gaps
    createListItems(data.gaps, gapsList);
    
    // Display reasons for verdict
    createListItems(data.reasons_for, reasonsForList);
    
    // Display reasons against verdict
    createListItems(data.reasons_against, reasonsAgainstList);
    
    // Display improvement suggestions
    createSuggestionItems(data.improvement_suggestions, suggestionsList);
    
    // Show results section
    hideLoading();
    resultsSection.classList.remove('hidden');
    
    // Smooth scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Call the evaluation API
 */
async function evaluateResume() {
    const jobDescription = jobDescriptionTextarea.value;
    const resume = resumeTextarea.value;
    
    // Validate inputs
    const validation = validateInputs(jobDescription, resume);
    if (!validation.valid) {
        showError(validation.message);
        return;
    }
    
    // Show loading
    showLoading();
    evaluateBtn.disabled = true;
    
    try {
        // Call API
        const response = await fetch('/evaluate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                job_description: jobDescription,
                resume: resume
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'An error occurred during evaluation');
        }
        
        // Display results
        displayResults(data);
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Failed to evaluate. Please check your connection and try again.');
    } finally {
        evaluateBtn.disabled = false;
    }
}

/**
 * Event Listeners
 */

// Evaluate button click
evaluateBtn.addEventListener('click', evaluateResume);

// Allow Enter key in textareas (with Ctrl/Cmd for submission)
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        evaluateResume();
    }
});

// Hide error when user starts typing
jobDescriptionTextarea.addEventListener('input', hideError);
resumeTextarea.addEventListener('input', hideError);

// Initialize - hide results on page load
resultsSection.classList.add('hidden');
loadingIndicator.classList.add('hidden');
errorMessage.classList.add('hidden');
