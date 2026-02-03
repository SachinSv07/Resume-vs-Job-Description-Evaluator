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

// Intersection Observer for scroll animations
const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');
        }
    });
}, observerOptions);

// Apply fade-in animations to elements
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.analysis-card, .suggestions-container');
    animatedElements.forEach((el, index) => {
        el.style.transitionDelay = `${index * 100}ms`;
        el.classList.add('fade-in-element');
        fadeInObserver.observe(el);
    });
}

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
 * Animate score counter with easing
 */
function animateScore(targetScore) {
    let currentScore = 0;
    const duration = 2000; // 2 seconds for smooth animation
    const startTime = performance.now();
    
    // Easing function (ease-out-cubic)
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    
    function updateScore(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);
        
        currentScore = easedProgress * targetScore;
        scoreValue.textContent = Math.round(currentScore);
        
        // Update color based on score with smooth transition
        if (currentScore >= 75) {
            scoreValue.style.color = '#10b981';
        } else if (currentScore >= 50) {
            scoreValue.style.color = '#f59e0b';
        } else {
            scoreValue.style.color = '#ef4444';
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateScore);
        }
    }
    
    requestAnimationFrame(updateScore);
}

/**
 * Display evaluation results
 */
function displayResults(data) {
    // Animate score with easing
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
    
    // Initialize scroll animations
    setTimeout(() => {
        initScrollAnimations();
    }, 100);
    
    // Smooth scroll to results with offset
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
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
