/**
 * Modern Slider Animation
 * Handles the progress bar animation and other interactive elements
 * for the hero image slider on the homepage
 */

document.addEventListener('DOMContentLoaded', function() {
    const heroSlider = document.getElementById('heroImageSlider');
    
    if (!heroSlider) return;
    
    const progressIndicator = heroSlider.querySelector('.progress-indicator');
    const carousel = new bootstrap.Carousel(heroSlider);
    const slideDuration = 5000; // Default carousel interval in ms
    let animationInterval;
    
    // Set the carousel interval
    heroSlider.setAttribute('data-bs-interval', slideDuration);
    
    // Initialize progress bar
    function startProgressAnimation() {
        let progress = 0;
        const increment = 100 / (slideDuration / 100); // Calculate increment based on duration
        
        clearInterval(animationInterval);
        
        animationInterval = setInterval(() => {
            progress += increment;
            
            if (progress >= 100) {
                progress = 0;
            }
            
            if (progressIndicator) {
                progressIndicator.style.width = `${progress}%`;
            }
        }, 100);
    }
    
    // Reset progress bar when slide changes
    heroSlider.addEventListener('slide.bs.carousel', function() {
        if (progressIndicator) {
            progressIndicator.style.width = '0%';
        }
        startProgressAnimation();
    });
    
    // Start the progress animation
    startProgressAnimation();
    
    // Pause carousel and progress on hover
    heroSlider.addEventListener('mouseenter', function() {
        carousel.pause();
        clearInterval(animationInterval);
    });
    
    // Resume carousel and progress when mouse leaves
    heroSlider.addEventListener('mouseleave', function() {
        carousel.cycle();
        startProgressAnimation();
    });
    
    // Add enhanced animation effects on slide change
    heroSlider.addEventListener('slid.bs.carousel', function(event) {
        const activeSlide = event.relatedTarget;
        const slideImage = activeSlide.querySelector('.modern-slide-image');
        const imageContainer = activeSlide.querySelector('.image-container');
        
        if (slideImage) {
            // Reset effects for all images
            const allImages = heroSlider.querySelectorAll('.modern-slide-image');
            const allContainers = heroSlider.querySelectorAll('.image-container');
            
            allImages.forEach(img => {
                img.style.transform = 'scale(1)';
                img.style.filter = 'brightness(1) contrast(1) saturate(1)';
            });
            
            // Apply enhanced effects to active slide with staggered timing
            setTimeout(() => {
                slideImage.style.transform = 'scale(1.08)';
                slideImage.style.filter = 'brightness(1.05) contrast(1.05) saturate(1.1)';
                
                if (imageContainer) {
                    // Add a subtle pulsing shadow effect
                    imageContainer.classList.add('active-container');
                }
            }, 50);
        }
    });
    
    // Add custom CSS for the pulsing shadow effect
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse-shadow {
            0% { box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15); }
            50% { box-shadow: 0 12px 28px rgba(255, 172, 0, 0.2); }
            100% { box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15); }
        }
        
        .active-container {
            animation: pulse-shadow 3s infinite ease-in-out;
        }
    `;
    document.head.appendChild(style);
});
