/**
 * ============================================
 * HERO SLIDER
 * Landing Page - Día de la Mujer
 * ============================================
 */

(function() {
    'use strict';

    var HeroSlider = {
        currentSlide: 0,
        slides: [],
        autoPlayInterval: null,
        autoPlayDelay: 1500,
        
        init: function() {
            var slider = document.getElementById('heroSlider');
            if (!slider) return;
            
            this.slides = document.querySelectorAll('.hero-slide');
            if (this.slides.length === 0) return;
            
            this.createNavDots();
            this.bindEvents();
            this.startAutoPlay();
        },
        
        createNavDots: function() {
            var nav = document.getElementById('sliderNav');
            if (!nav) return;
            
            for (var i = 0; i < this.slides.length; i++) {
                var dot = document.createElement('button');
                dot.className = 'hero-slider-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', 'Ir a slide ' + (i + 1));
                dot.addEventListener('click', (function(index) {
                    return function() {
                        HeroSlider.goToSlide(index);
                    };
                })(i));
                nav.appendChild(dot);
            }
        },
        
        bindEvents: function() {
            var prevBtn = document.getElementById('sliderPrev');
            var nextBtn = document.getElementById('sliderNext');
            
            if (prevBtn) {
                prevBtn.addEventListener('click', function() {
                    HeroSlider.prevSlide();
                });
            }
            
            if (nextBtn) {
                nextBtn.addEventListener('click', function() {
                    HeroSlider.nextSlide();
                });
            }
            
            // Pause on hover
            var slider = document.getElementById('heroSlider');
            if (slider) {
                slider.addEventListener('mouseenter', function() {
                    HeroSlider.stopAutoPlay();
                });
                slider.addEventListener('mouseleave', function() {
                    HeroSlider.startAutoPlay();
                });
            }
        },
        
        goToSlide: function(index) {
            if (index < 0) index = this.slides.length - 1;
            if (index >= this.slides.length) index = 0;
            
            this.currentSlide = index;
            
            // Update slides
            for (var i = 0; i < this.slides.length; i++) {
                if (i === index) {
                    this.slides[i].classList.add('active');
                } else {
                    this.slides[i].classList.remove('active');
                }
            }
            
            // Update dots
            var dots = document.querySelectorAll('.hero-slider-dot');
            for (var j = 0; j < dots.length; j++) {
                if (j === index) {
                    dots[j].classList.add('active');
                } else {
                    dots[j].classList.remove('active');
                }
            }
        },
        
        nextSlide: function() {
            this.goToSlide(this.currentSlide + 1);
        },
        
        prevSlide: function() {
            this.goToSlide(this.currentSlide - 1);
        },
        
        startAutoPlay: function() {
            var self = this;
            this.stopAutoPlay();
            this.autoPlayInterval = setInterval(function() {
                self.nextSlide();
            }, this.autoPlayDelay);
        },
        
        stopAutoPlay: function() {
            if (this.autoPlayInterval) {
                clearInterval(this.autoPlayInterval);
                this.autoPlayInterval = null;
            }
        }
    };

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            HeroSlider.init();
        });
    } else {
        HeroSlider.init();
    }

})();
