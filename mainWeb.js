/**
 * HO OH LABS - Main JavaScript
 * Handles animations, scroll effects, particles, and interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initParticles();
    initNavigation();
    initScrollReveal();
    initProjectCards();
    initContactForm();
    initSmoothScroll();
    initScrollProgress();
    initFloatingOrbs();
    init3DScrollEffects();
    initScrollGlow();
});

/**
 * Particle System
 * Creates floating particles in the background
 */
function initParticles() {
    const container = document.getElementById('particles-container');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        createParticle(container);
    }

    // Add mouse interaction
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const particles = container.querySelectorAll('.particle');
    particles.forEach((particle, index) => {
        const particleData = {
            element: particle,
            baseX: parseFloat(particle.dataset.x),
            baseY: parseFloat(particle.dataset.y),
            speed: 0.02 + Math.random() * 0.03
        };

        function animate() {
            const dx = mouseX - particleData.baseX;
            const dy = mouseY - particleData.baseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 300;

            if (distance < maxDistance) {
                const force = (maxDistance - distance) / maxDistance;
                const moveX = (dx / distance) * force * 50;
                const moveY = (dy / distance) * force * 50;

                particleData.element.style.transform = `translate(${moveX}px, ${moveY}px)`;
            } else {
                particleData.element.style.transform = 'translate(0, 0)';
            }

            requestAnimationFrame(animate);
        }

        setTimeout(() => animate(), index * 50);
    });
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.classList.add('particle');

    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = 2 + Math.random() * 4;
    const duration = 10 + Math.random() * 10;
    const delay = Math.random() * 5;

    particle.style.left = `${x}%`;
    particle.style.top = `${y}%`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;
    particle.dataset.x = x;
    particle.dataset.y = y;

    // Random color variation
    const colors = ['#f89f44', '#f15033', '#ffffff'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];

    container.appendChild(particle);
}

/**
 * Navigation
 * Handles scroll state and mobile toggle
 */
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    // Scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Mobile toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

/**
 * Scroll Reveal Animation
 * Reveals elements as they enter viewport
 */
function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.project-card, .mission-card, .founder-card, .section-header'
    );

    const revealOnScroll = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                revealOnScroll.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // Parallax effect for hero
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroContent = hero.querySelector('.hero-content');
            if (heroContent && scrolled < window.innerHeight) {
                heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
            }
        });
    }
}

/**
 * Project Cards
 * Enhanced hover effects and interactions
 */
function initProjectCards() {
    const cards = document.querySelectorAll('.project-card');

    cards.forEach(card => {
        // Tilt effect on mousemove
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
        });

        // Add ripple effect on click
        card.addEventListener('click', (e) => {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.left = `${e.clientX - card.getBoundingClientRect().left}px`;
            ripple.style.top = `${e.clientY - card.getBoundingClientRect().top}px`;
            card.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });
}

/**
 * Contact Form
 * Handles form submission
 */
function initContactForm() {
    const form = document.getElementById('contact-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Get form values
        const name = data.name;
        const email = data.email;
        const subject = data.subject;
        const message = data.message;

        // Create mailto link
        const mailtoLink = `mailto:contact@ho-oh-lab.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;

        // Open email client
        window.location.href = mailtoLink;

        // Show success message
        showNotification('Opening your email client...');

        // Reset form
        form.reset();
    });

    // Input focus effects
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
        });
    });
}

/**
 * Smooth Scroll
 * For anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');

            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Notification System
 * Shows toast notifications
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.textContent = message;

    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Cursor Trail Effect
 * Adds a subtle glow following the cursor
 */
function initCursorTrail() {
    const trail = document.createElement('div');
    trail.classList.add('cursor-trail');
    document.body.appendChild(trail);

    let cursorX = 0;
    let cursorY = 0;
    let trailX = 0;
    let trailY = 0;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
    });

    function animateTrail() {
        const speed = 0.15;
        trailX += (cursorX - trailX) * speed;
        trailY += (cursorY - trailY) * speed;

        trail.style.left = `${trailX}px`;
        trail.style.top = `${trailY}px`;

        requestAnimationFrame(animateTrail);
    }

    animateTrail();
}

/**
 * Text Scramble Effect
 * For dynamic text animations
 */
function initTextScramble() {
    const elements = document.querySelectorAll('[data-scramble]');

    elements.forEach(el => {
        const text = el.textContent;
        el.dataset.original = text;
        el.textContent = '';

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

        let iterations = 0;
        const interval = setInterval(() => {
            el.textContent = text
                .split('')
                .map((char, index) => {
                    if (index < iterations) {
                        return char;
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');

            if (iterations >= text.length) {
                clearInterval(interval);
            }

            iterations += 1/3;
        }, 30);
    });
}

/**
 * Counter Animation
 * Animates numbers counting up
 */
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

/**
 * Typing Effect
 * For typewriter-style text animations
 */
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

/**
 * Add notification styles dynamically
 */
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        bottom: 30px;
        right: 30px;
        padding: 16px 24px;
        background: linear-gradient(135deg, #f89f44 0%, #f15033 100%);
        color: #0a0a0a;
        border-radius: 12px;
        font-weight: 600;
        box-shadow: 0 10px 40px rgba(248, 159, 68, 0.4);
        z-index: 9999;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
    }

    .notification.show {
        opacity: 1;
        transform: translateY(0);
    }

    .cursor-trail {
        position: fixed;
        width: 20px;
        height: 20px;
        border: 2px solid rgba(248, 159, 68, 0.3);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9998;
        transform: translate(-50%, -50%);
        transition: width 0.2s, height 0.2s;
    }

    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(248, 159, 68, 0.4);
        transform: scale(0);
        animation: ripple-effect 0.6s ease-out;
        pointer-events: none;
    }

    @keyframes ripple-effect {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Initialize cursor trail on desktop
if (window.innerWidth > 768) {
    initCursorTrail();
}

/**
 * Scroll Progress Bar
 * Shows reading progress at top of page
 */
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.classList.add('scroll-progress');
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        progressBar.style.width = `${scrolled}%`;
    });
}

/**
 * Floating Orbs Background
 * Creates ambient floating background orbs
 */
function initFloatingOrbs() {
    const orbs = [
        { class: 'orb-1', element: null },
        { class: 'orb-2', element: null },
        { class: 'orb-3', element: null }
    ];

    orbs.forEach(orbData => {
        const orb = document.createElement('div');
        orb.classList.add('floating-orb', orbData.class);
        document.body.appendChild(orb);
        orbData.element = orb;
    });
}

/**
 * 3D Scroll Effects
 * Adds depth and dimension to scrolling
 */
function init3DScrollEffects() {
    // Add fade-scale effect to sections
    const sections = document.querySelectorAll('.about, .projects, .founders, .contact');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-scale', 'active');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Stagger animation for cards
    const cardContainers = document.querySelectorAll('.mission-cards, .founders-grid, .projects-grid');

    cardContainers.forEach(container => {
        const cards = container.querySelectorAll('.mission-card, .founder-card, .project-card');
        cards.forEach((card, index) => {
            card.classList.add('stagger-item');
            card.style.transitionDelay = `${index * 100}ms`;
        });

        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });

        cards.forEach(card => cardObserver.observe(card));
    });

    // Subtle skew effect on fast scroll
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        scrollVelocity = currentScrollY - lastScrollY;
        lastScrollY = currentScrollY;

        if (Math.abs(scrollVelocity) > 10) {
            const skewAmount = Math.max(-2, Math.min(2, scrollVelocity * 0.02));
            document.body.style.transform = `skewY(${skewAmount}deg)`;
            setTimeout(() => {
                document.body.style.transform = 'skewY(0deg)';
            }, 100);
        }
    }, { passive: true });
}

/**
 * Scroll Glow Effect
 * Creates a subtle glow that follows scroll position
 */
function initScrollGlow() {
    const glow = document.createElement('div');
    glow.classList.add('scroll-glow');
    document.body.appendChild(glow);

    let glowX = 0;
    let glowY = 0;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener('scroll', () => {
        targetX = window.innerWidth / 2;
        targetY = window.scrollY + window.innerHeight / 2;
    });

    function animateGlow() {
        glowX += (targetX - glowX) * 0.05;
        glowY += (targetY - glowY) * 0.05;

        glow.style.left = `${glowX}px`;
        glow.style.top = `${glowY}px`;

        requestAnimationFrame(animateGlow);
    }

    animateGlow();
}

/**
 * Mouse Move Parallax
 * Subtle parallax effect based on mouse position
 */
function initMouseParallax() {
    const parallaxElements = document.querySelectorAll('.hero-logo, .floating-orb');

    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;

        parallaxElements.forEach((el, index) => {
            const speed = (index + 1) * 10;
            const x = mouseX * speed;
            const y = mouseY * speed;
            el.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
}

// Initialize mouse parallax on desktop
if (window.innerWidth > 768) {
    initMouseParallax();
}

// Log initialization
console.log('%c HO OH LABS ', 'background: linear-gradient(135deg, #f89f44, #f15033); color: #0a0a0a; font-size: 20px; font-weight: bold; padding: 10px 20px; border-radius: 5px;');
console.log('%c Building apps that transform lives ', 'color: #888; font-size: 12px;');
