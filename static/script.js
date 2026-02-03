/**
 * FitMatch - Frontend Logic
 * Intelligent resume-to-job matching powered by AI
 * Handles user interactions and API communication
 */

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// DOM Elements
const jobDescriptionTextarea = document.getElementById('jobDescription');
const resumeTextarea = document.getElementById('resume');
const evaluateBtn = document.getElementById('evaluateBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessage = document.getElementById('errorMessage');
const resultsSection = document.getElementById('resultsSection');
const themeToggle = document.getElementById('themeToggle');

// Result elements
const scoreValue = document.getElementById('scoreValue');
const scoreCircle = document.getElementById('scoreCircle');
const verdictBadge = document.getElementById('verdictBadge');
const strengthsList = document.getElementById('strengthsList');
const gapsList = document.getElementById('gapsList');
const reasonsForList = document.getElementById('reasonsForList');
const reasonsAgainstList = document.getElementById('reasonsAgainstList');
const suggestionsList = document.getElementById('suggestionsList');

const THEME_STORAGE_KEY = 'rjd-theme';

function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark', isDark);
    if (themeToggle) {
        themeToggle.textContent = isDark ? 'Light mode' : 'Dark mode';
        themeToggle.setAttribute('aria-pressed', String(isDark));
    }
}

function initTheme() {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
    applyTheme(initialTheme);
}

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

const scrollRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            scrollRevealObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Initialize GSAP animations
function initGsapAnimations() {
    // Hero load sequence - chained animations with overlapping start times
    const heroTimeline = gsap.timeline();
    heroTimeline
        .fromTo('.hero-title', 
            { opacity: 0, y: 60, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out' },
            0
        )
        .fromTo('.hero-tagline',
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
            0.15
        )
        .fromTo('.hero-cta',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
            0.3
        );

    // Pin hero section while scrolling
    ScrollTrigger.create({
        trigger: '.hero',
        start: 'top top',
        end: '+=100%',
        pin: false,
        markers: false
    });

    // Input section - staggered reveal with parallax
    gsap.from('.input-group', {
        scrollTrigger: {
            trigger: '.input-section',
            start: 'top 75%',
            markers: false
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power2.out'
    });

    // Parallax for input section
    gsap.to('.input-section', {
        y: -80,
        scrollTrigger: {
            trigger: '.input-section',
            start: 'top 60%',
            end: 'bottom 0%',
            scrub: 1.2,
            ease: 'none',
            markers: false
        }
    });

    // Action button - bounce reveal
    gsap.from('.action-section', {
        scrollTrigger: {
            trigger: '.action-section',
            start: 'top 80%',
            markers: false
        },
        opacity: 0,
        scale: 0.9,
        duration: 0.6,
        ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
    });

    // Score container - pin while animating elements
    const scoreTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: '.score-container',
            start: 'top 70%',
            markers: false
        }
    });

    // Count-up animation for score value
    const scoreElement = document.getElementById('scoreValue');
    if (scoreElement && scoreElement.textContent !== '0') {
        const targetValue = parseInt(scoreElement.textContent);
        gsap.fromTo(scoreElement,
            { textContent: 0 },
            {
                textContent: targetValue,
                duration: 0.8,
                ease: 'power2.out',
                snap: { textContent: 1 },
                scrollTrigger: {
                    trigger: '.score-container',
                    start: 'top 70%',
                    markers: false
                }
            }
        );
    }

    // Score circle with parallax
    const scoreCircle = document.getElementById('scoreCircle');
    if (scoreCircle) {
        gsap.from(scoreCircle, {
            scrollTrigger: {
                trigger: '.score-container',
                start: 'top 75%',
                markers: false
            },
            opacity: 0,
            scale: 0.7,
            duration: 1,
            ease: 'power3.out'
        });

        gsap.to(scoreCircle, {
            y: -40,
            scrollTrigger: {
                trigger: '.score-container',
                start: 'top 50%',
                end: 'bottom 10%',
                scrub: 1.5,
                ease: 'none',
                markers: false
            }
        });
    }

    // Verdict badge with bounce
    const verdictBadge = document.getElementById('verdictBadge');
    if (verdictBadge) {
        gsap.from(verdictBadge, {
            scrollTrigger: {
                trigger: '.score-container',
                start: 'top 75%',
                markers: false
            },
            opacity: 0,
            scale: 0.5,
            duration: 0.8,
            delay: 0.3,
            ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        });

        gsap.to(verdictBadge, {
            y: -40,
            scrollTrigger: {
                trigger: '.score-container',
                start: 'top 50%',
                end: 'bottom 10%',
                scrub: 1.5,
                ease: 'none',
                markers: false
            }
        });
    }

    // Analysis cards - staggered reveal with parallax
    const analysisCards = document.querySelectorAll('.analysis-card');
    analysisCards.forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                markers: false
            },
            opacity: 0,
            y: 40,
            scale: 0.95,
            duration: 0.7,
            delay: index * 0.08,
            ease: 'power2.out'
        });

        // Different parallax speed for each card
        gsap.to(card, {
            y: -50 - (index * 10),
            scrollTrigger: {
                trigger: card,
                start: 'top 70%',
                end: 'bottom 20%',
                scrub: 0.8 + (index * 0.15),
                ease: 'none',
                markers: false
            }
        });
    });

    // Suggestions container - staggered reveal
    gsap.from('.suggestions-container', {
        scrollTrigger: {
            trigger: '.suggestions-container',
            start: 'top 80%',
            markers: false
        },
        opacity: 0,
        y: 40,
        scale: 0.95,
        duration: 0.8,
        ease: 'power2.out'
    });

    // Parallax for suggestions container
    gsap.to('.suggestions-container', {
        y: -60,
        scrollTrigger: {
            trigger: '.suggestions-container',
            start: 'top 65%',
            end: 'bottom 10%',
            scrub: 1.1,
            ease: 'none',
            markers: false
        }
    });

    // Suggestion items - staggered reveal with parallax
    const suggestionItems = document.querySelectorAll('.suggestion-item');
    suggestionItems.forEach((item, index) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top 85%',
                markers: false
            },
            opacity: 0,
            x: -30,
            duration: 0.6,
            delay: index * 0.05,
            ease: 'power2.out'
        });

        // Variable speed parallax for depth
        gsap.to(item, {
            y: -35 - (index * 8),
            x: 10,
            scrollTrigger: {
                trigger: item,
                start: 'top 70%',
                end: 'bottom 20%',
                scrub: 0.6 + (index * 0.1),
                ease: 'none',
                markers: false
            }
        });
    });

    // Results section heading with text reveal
    const resultsHeading = document.querySelector('.results-section h2');
    if (resultsHeading) {
        gsap.from(resultsHeading, {
            scrollTrigger: {
                trigger: '.results-section',
                start: 'top 75%',
                markers: false
            },
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: 'power3.out'
        });

        gsap.to(resultsHeading, {
            y: -50,
            scrollTrigger: {
                trigger: '.results-section',
                start: 'top 55%',
                end: 'bottom 15%',
                scrub: 1.3,
                ease: 'none',
                markers: false
            }
        });
    }
}

// Apply fade-in animations to elements
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.analysis-card, .suggestions-container');
    animatedElements.forEach((el, index) => {
        el.style.transitionDelay = `${index * 100}ms`;
        el.classList.add('fade-in-element');
        fadeInObserver.observe(el);
    });
    
    // Apply scroll reveal to scroll-reveal elements
    const scrollRevealElements = document.querySelectorAll('.scroll-reveal');
    scrollRevealElements.forEach(el => {
        scrollRevealObserver.observe(el);
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
    
    // Re-initialize GSAP animations for newly visible elements
    setTimeout(() => {
        ScrollTrigger.refresh();
        initGsapAnimations();
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

// Theme toggle
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const nextTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        applyTheme(nextTheme);
    });
}

// Allow Enter key in textareas (with Ctrl/Cmd for submission)
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        evaluateResume();
    }
});

// Hide error when user starts typing
jobDescriptionTextarea.addEventListener('input', hideError);
resumeTextarea.addEventListener('input', hideError);

// Initialize theme and default UI state
initTheme();

// Initialize GSAP animations on page load
window.addEventListener('load', () => {
    initGsapAnimations();
});

// Initialize - hide results on page load
resultsSection.classList.add('hidden');
loadingIndicator.classList.add('hidden');
errorMessage.classList.add('hidden');
