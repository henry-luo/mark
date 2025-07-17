// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    
    // Tab functionality
    function initTabs() {
        const tabGroups = document.querySelectorAll('.tabs');
        
        tabGroups.forEach(tabGroup => {
            const tabs = tabGroup.querySelectorAll('.tab');
            const tabContent = tabGroup.closest('.comparison-tabs, .installation-tabs').querySelector('.tab-content');
            const tabPanes = tabContent.querySelectorAll('.tab-pane');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const targetId = tab.getAttribute('data-tab');
                    
                    // Remove active class from all tabs and panes
                    tabs.forEach(t => t.classList.remove('tab--active'));
                    tabPanes.forEach(pane => pane.classList.remove('tab-pane--active'));
                    
                    // Add active class to clicked tab and corresponding pane
                    tab.classList.add('tab--active');
                    const targetPane = tabContent.querySelector(`#${targetId}`);
                    if (targetPane) {
                        targetPane.classList.add('tab-pane--active');
                    }
                });
            });
        });
    }
    
    // Copy to clipboard functionality
    function initCopyButtons() {
        const copyButtons = document.querySelectorAll('.code-block__copy');
        
        copyButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const codeBlock = button.closest('.code-block');
                const code = codeBlock.querySelector('.code-block__content code, .code-block__content').textContent;
                
                try {
                    await navigator.clipboard.writeText(code);
                    
                    // Visual feedback
                    const originalText = button.textContent;
                    button.textContent = 'Copied!';
                    button.style.color = 'var(--color-success)';
                    
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.style.color = '';
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                    
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = code;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    
                    const originalText = button.textContent;
                    button.textContent = 'Copied!';
                    setTimeout(() => {
                        button.textContent = originalText;
                    }, 2000);
                }
            });
        });
    }
    
    // Smooth scrolling for anchor links
    function initSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                if (href === '#') return;
                
                e.preventDefault();
                
                const target = document.querySelector(href);
                if (target) {
                    const navHeight = document.querySelector('.nav').offsetHeight;
                    const targetPosition = target.offsetTop - navHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // Navigation scroll effect
    function initNavScrollEffect() {
        const nav = document.querySelector('.nav');
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                nav.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
                nav.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1)';
            } else {
                nav.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                nav.style.boxShadow = 'none';
            }
            
            lastScrollY = currentScrollY;
        });
    }
    
    // Intersection Observer for animations
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe elements that should animate on scroll
        const animatedElements = document.querySelectorAll('.feature-card, .doc-card, .section-header');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
    
    // Code syntax highlighting simulation
    function initCodeHighlighting() {
        const codeBlocks = document.querySelectorAll('code');
        
        codeBlocks.forEach(block => {
            let html = block.innerHTML;
            
            // Simple syntax highlighting for Mark notation
            html = html.replace(/\{(\w+)/g, '<span style="color: #60a5fa;">{$1</span>');
            html = html.replace(/(\w+):/g, '<span style="color: #34d399;">$1</span><span style="color: #f59e0b;">:</span>');
            html = html.replace(/"([^"]*)"/g, '<span style="color: #fbbf24;">"$1"</span>');
            html = html.replace(/'([^']*)'/g, '<span style="color: #fbbf24;">\'$1\'</span>');
            html = html.replace(/\}/g, '<span style="color: #60a5fa;">}</span>');
            
            block.innerHTML = html;
        });
    }
    
    // Initialize all functionality
    initTabs();
    initCopyButtons();
    initSmoothScrolling();
    initNavScrollEffect();
    initScrollAnimations();
    initCodeHighlighting();
    
    // Add loading complete class to body
    document.body.classList.add('loaded');
});

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle resize events
window.addEventListener('resize', debounce(() => {
    // Recalculate any size-dependent functionality here
}, 250));
