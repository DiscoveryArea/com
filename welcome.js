
// Welcome Page JavaScript
class WelcomePageController {
    constructor() {
        this.particles = [];
        this.animationId = null;
        this.init();
    }

    init() {
        // Only create particles on larger screens
        if (window.innerWidth >= 768) {
            this.createParticles();
            this.animateParticles();
        }
        
        this.setupWordAnimations();
        this.setupFeatureAnimations();
        this.setupCounters();
        this.setupStartButton();
        
        // Only enable custom cursor and orbs on desktop
        if (window.innerWidth >= 768 && window.matchMedia('(hover: hover)').matches) {
            this.updateCursor();
            this.createFloatingOrbs();
        }
        
        this.preloadMainPage();
    }

    // Preload main page resources
    preloadMainPage() {
        // Preload main page
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'prefetch';
        preloadLink.href = 'index.html';
        document.head.appendChild(preloadLink);

        // Preload critical CSS
        const preloadCSS = document.createElement('link');
        preloadCSS.rel = 'prefetch';
        preloadCSS.href = 'style.css';
        document.head.appendChild(preloadCSS);

        // Preload JavaScript
        const preloadJS = document.createElement('link');
        preloadJS.rel = 'prefetch';
        preloadJS.href = 'script.js';
        document.head.appendChild(preloadJS);
    }

    // Create floating color orbs - Desktop only
    createFloatingOrbs() {
        // Skip orbs on mobile for performance
        if (window.innerWidth < 768) return;
        
        const welcomeScreen = document.querySelector('.welcome-screen');
        const orbCount = 3; // Reduced count
        
        for (let i = 0; i < orbCount; i++) {
            setTimeout(() => {
                this.createOrb(welcomeScreen, i);
            }, i * 2000); // Slower creation
        }
    }

    createOrb(container, index) {
        const orb = document.createElement('div');
        orb.className = 'floating-orb';
        
        const colors = [
            'radial-gradient(circle, rgba(255,99,71,0.3), rgba(255,215,0,0.1))',
            'radial-gradient(circle, rgba(50,205,50,0.3), rgba(127,255,212,0.1))',
            'radial-gradient(circle, rgba(0,191,255,0.3), rgba(147,50,204,0.1))',
            'radial-gradient(circle, rgba(255,105,180,0.3), rgba(221,160,221,0.1))',
            'radial-gradient(circle, rgba(0,255,255,0.3), rgba(50,205,50,0.1))'
        ];
        
        orb.style.cssText = `
            position: fixed;
            width: ${Math.random() * 80 + 60}px;
            height: ${Math.random() * 80 + 60}px;
            background: ${colors[index % colors.length]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 1;
            opacity: 0.6;
            filter: blur(2px);
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: orbFloat ${Math.random() * 20 + 15}s ease-in-out infinite,
                       orbGlow ${Math.random() * 8 + 5}s ease-in-out infinite;
        `;
        
        container.appendChild(orb);
        
        // Remove orb after some time and create a new one
        setTimeout(() => {
            if (orb.parentNode) {
                orb.parentNode.removeChild(orb);
                this.createOrb(container, index);
            }
        }, 25000);
    }

    // Create floating particles - Mobile optimized
    createParticles() {
        const particlesContainer = document.getElementById('particles');
        // Reduce particles significantly on mobile
        const particleCount = window.innerWidth < 768 ? 5 : 15;

        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                this.createParticle(particlesContainer);
            }, i * 200);
        }

        // Add new particles less frequently on mobile
        const interval = window.innerWidth < 768 ? 5000 : 3000;
        setInterval(() => {
            if (this.particles.length < particleCount) {
                this.createParticle(particlesContainer);
            }
        }, interval);
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random positioning and timing
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 12 + 6) + 's';
        particle.style.animationDelay = Math.random() * 3 + 's';
        
        // Enhanced rainbow colors
        const colors = [
            'radial-gradient(circle, #ff6347, #ffd700)',
            'radial-gradient(circle, #32cd32, #7fffd4)',
            'radial-gradient(circle, #00bfff, #9932cc)',
            'radial-gradient(circle, #ff69b4, #dda0dd)',
            'radial-gradient(circle, #00ffff, #32cd32)',
            'radial-gradient(circle, #ffd700, #ff7f50)',
            'conic-gradient(from 0deg, #ff6347, #ffd700, #32cd32, #00bfff, #9932cc, #ff69b4)'
        ];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        // Add glow effect
        particle.style.boxShadow = `0 0 ${Math.random() * 20 + 10}px rgba(255, 255, 255, 0.6)`;
        particle.style.filter = `blur(${Math.random() * 2}px)`;
        
        // Random size variation
        const size = Math.random() * 4 + 4;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        container.appendChild(particle);
        this.particles.push(particle);

        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
                this.particles = this.particles.filter(p => p !== particle);
            }
        }, 15000);
    }

    // Animate particles
    animateParticles() {
        // Particles are animated via CSS, this method can be used for additional effects
        this.animationId = requestAnimationFrame(() => this.animateParticles());
    }

    // Setup word-by-word title animation
    setupWordAnimations() {
        const words = document.querySelectorAll('.word');
        words.forEach((word, index) => {
            const delay = parseInt(word.dataset.delay) || 0;
            word.style.animationDelay = delay + 'ms';
        });
    }

    // Setup feature card animations
    setupFeatureAnimations() {
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach((card, index) => {
            const delay = parseInt(card.dataset.delay) || 0;
            card.style.animationDelay = delay + 'ms';
        });
    }

    // Animated counters for stats
    setupCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        const animateCounter = (counter) => {
            const target = parseInt(counter.dataset.count);
            const duration = 2000; // 2 seconds
            const steps = 60;
            const stepValue = target / steps;
            let current = 0;
            
            const timer = setInterval(() => {
                current += stepValue;
                if (current >= target) {
                    counter.textContent = target + '+';
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current);
                }
            }, duration / steps);
        };

        // Start counters after page loads
        setTimeout(() => {
            counters.forEach(animateCounter);
        }, 2500);
    }

    // Setup start button interactions
    setupStartButton() {
        const startButton = document.getElementById('startButton');
        const loadingOverlay = document.getElementById('loadingOverlay');
        
        // Add click effect
        startButton.addEventListener('click', (e) => {
            this.handleStartClick(e);
        });

        // Add hover effects
        startButton.addEventListener('mouseenter', () => {
            this.addButtonParticles(startButton);
        });

        // Add touch support for mobile
        startButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleStartClick(e);
        });
    }

    // Handle start button click
    async handleStartClick(e) {
        console.log('Start button clicked!');
        const button = e.currentTarget;
        const loadingOverlay = document.getElementById('loadingOverlay');
        
        // Set session storage IMMEDIATELY when button is clicked
        sessionStorage.setItem('welcomed', 'true');
        sessionStorage.setItem('welcomeTimestamp', Date.now().toString());
        console.log('Session storage set:', sessionStorage.getItem('welcomed'));
        
        // Add click animation
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);

        // Show loading overlay
        loadingOverlay.classList.add('show');
        
        // Simulate loading time and redirect
        await this.simulateLoading();
        
        // Redirect to main page
        console.log('Redirecting to index.html...');
        window.location.href = 'index.html';
    }

    // Simulate loading with progress
    async simulateLoading() {
        return new Promise((resolve) => {
            const progressBar = document.querySelector('.progress-bar');
            const loadingText = document.querySelector('.loading-text span');
            
            const messages = [
                'Connecting to nature...',
                'Loading scenic locations...',
                'Preparing your adventure...',
                'Ready to explore!'
            ];
            
            let progress = 0;
            let messageIndex = 0;
            
            const updateProgress = () => {
                progress += Math.random() * 20 + 10;
                if (progress > 100) progress = 100;
                
                progressBar.style.width = progress + '%';
                
                // Update message
                if (messageIndex < messages.length - 1 && progress > (messageIndex + 1) * 25) {
                    messageIndex++;
                    loadingText.textContent = messages[messageIndex];
                }
                
                if (progress >= 100) {
                    setTimeout(resolve, 300);
                } else {
                    setTimeout(updateProgress, 80 + Math.random() * 120);
                }
            };
            
            loadingText.textContent = messages[0];
            updateProgress();
        });
    }

    // Add particle effect to button on hover
    addButtonParticles(button) {
        const particleContainer = button.querySelector('.button-particles');
        if (!particleContainer) {
            const container = document.createElement('div');
            container.className = 'button-particles';
            container.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                overflow: hidden;
            `;
            button.appendChild(container);
        }

        // Create small particles around button
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.createButtonParticle(button.querySelector('.button-particles'));
            }, i * 100);
        }
    }

    createButtonParticle(container) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: white;
            border-radius: 50%;
            pointer-events: none;
            opacity: 0.8;
        `;
        
        // Random position around button
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        container.appendChild(particle);
        
        // Animate particle
        particle.animate([
            { 
                transform: 'scale(0) translateY(0px)',
                opacity: 0.8
            },
            { 
                transform: 'scale(1) translateY(-20px)',
                opacity: 0
            }
        ], {
            duration: 1000,
            easing: 'ease-out'
        }).onfinish = () => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        };
    }

    // Custom cursor tracking
    updateCursor() {
        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const animateCursor = () => {
            cursorX += (mouseX - cursorX) * 0.1;
            cursorY += (mouseY - cursorY) * 0.1;
            
            document.body.style.setProperty('--cursor-x', cursorX + 'px');
            document.body.style.setProperty('--cursor-y', cursorY + 'px');
            
            requestAnimationFrame(animateCursor);
        };
        
        animateCursor();
        
        // Update cursor position via CSS custom properties
        document.documentElement.style.setProperty('--cursor-x', '0px');
        document.documentElement.style.setProperty('--cursor-y', '0px');
    }

    // Add intersection observer for scroll animations
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                }
            });
        }, observerOptions);

        // Observe all animated elements
        const animatedElements = document.querySelectorAll('.feature-card, .stat-item');
        animatedElements.forEach(el => observer.observe(el));
    }

    // Cleanup method
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Clean up particles
        this.particles.forEach(particle => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        });
        this.particles = [];
    }
}

// Enhanced cursor effect
document.addEventListener('DOMContentLoaded', () => {
    // Custom cursor
    const cursor = document.createElement('div');
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: linear-gradient(45deg, #68b684, #a8e6cf);
        border-radius: 50%;
        pointer-events: none;
        z-index: 10000;
        transition: all 0.08s ease;
        opacity: 0.9;
        mix-blend-mode: difference;
        box-shadow: 0 0 15px rgba(104, 182, 132, 0.4);
    `;
    document.body.appendChild(cursor);

    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = (mouseX - 10) + 'px';
        cursor.style.top = (mouseY - 10) + 'px';
    });

    // Hide default cursor
    document.body.style.cursor = 'none';
    
    // Show cursor on mouse enter
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '0.8';
    });
    
    // Hide cursor on mouse leave
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });

    // Scale cursor on hover over interactive elements
    const interactiveElements = document.querySelectorAll('button, a, .feature-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(1.5)';
            cursor.style.background = 'linear-gradient(45deg, #ff8c42, #ffd23f)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            cursor.style.background = 'linear-gradient(45deg, #68b684, #a8e6cf)';
        });
    });
});

// Initialize welcome page controller
let welcomeController;

document.addEventListener('DOMContentLoaded', () => {
    welcomeController = new WelcomePageController();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (welcomeController) {
        welcomeController.destroy();
    }
});

// Handle mobile orientation changes
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        if (welcomeController) {
            welcomeController.createParticles();
        }
    }, 500);
});

// Add keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        const startButton = document.getElementById('startButton');
        if (startButton && document.activeElement === startButton) {
            e.preventDefault();
            startButton.click();
        }
    }
});

// Preload main page for faster transition
const preloadLink = document.createElement('link');
preloadLink.rel = 'prefetch';
preloadLink.href = 'index.html';
document.head.appendChild(preloadLink);
