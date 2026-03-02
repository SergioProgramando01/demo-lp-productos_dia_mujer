/**
 * ============================================
 * PRODUCTOS Y FILTROS
 * Landing Page - Día de la Mujer
 * ============================================
 */

(function() {
    'use strict';

    // Función global para agregar productos al carrito
    // NOTA: Usa el nombre del producto como ID para que cuando agregues el mismo
    // producto múltiples veces, en lugar de crear entradas duplicadas, aumente la cantidad
    window.addProductToCart = function(name, price) {
        // Convertir nombre a ID válido (reemplazar espacios y caracteres especiales)
        var productId = 'product_' + name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        
        if (window.CartSystem) {
            window.CartSystem.addItem({
                id: productId,
                name: name,
                price: price,
                image: 'src/assets/images/hero-img1.svg'
            });
        } else {
            console.error('CartSystem no está disponible. Asegúrate de que cart.js está cargado.');
        }
    };

    // Inicializar filtros de categorías
    function initCategoryFilter() {
        var categoryButtons = document.querySelectorAll('.category-btn');
        var productCards = document.querySelectorAll('.product-card');

        if (categoryButtons.length === 0) return;

        categoryButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var category = this.getAttribute('data-category');
                
                // Update active button
                categoryButtons.forEach(function(b) {
                    b.classList.remove('active');
                });
                this.classList.add('active');
                
                // Filter products
                filterProducts(category);
            });
        });
    }

    // Función para filtrar productos por categoría
    function filterProducts(category) {
        var productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(function(card) {
            var cardCategory = card.getAttribute('data-category');
            var searchTerm = document.getElementById('productsSearchInput').value.toLowerCase();
            var cardName = card.querySelector('.product-name').textContent.toLowerCase();
            var cardDescription = card.querySelector('.product-description').textContent.toLowerCase();
            
            var matchesCategory = category === 'all' || cardCategory === category;
            var matchesSearch = searchTerm === '' || cardName.includes(searchTerm) || cardDescription.includes(searchTerm);
            
            if (matchesCategory && matchesSearch) {
                card.style.display = 'block';
                setTimeout(function() {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 10);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(function() {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }

    // Inicializar buscador de productos
    function initProductSearch() {
        var searchInput = document.getElementById('productsSearchInput');
        
        if (!searchInput) return;
        
        searchInput.addEventListener('input', function() {
            var activeCategory = document.querySelector('.category-btn.active');
            var category = activeCategory ? activeCategory.getAttribute('data-category') : 'all';
            filterProducts(category);
        });
    }

    // Inicializar galería de productos (cambiar imagen al hacer click en thumbnail)
    function initProductGallery() {
        var galleryThumbs = document.querySelectorAll('.product-gallery-thumb');
        
        galleryThumbs.forEach(function(thumb) {
            thumb.addEventListener('click', function() {
                var productCard = this.closest('.product-card');
                var mainImage = productCard.querySelector('.product-image > img');
                var clickedImage = this.querySelector('img');
                
                // Update main image
                if (mainImage && clickedImage) {
                    mainImage.src = clickedImage.src;
                }
                
                // Update active thumb
                var allThumbs = productCard.querySelectorAll('.product-gallery-thumb');
                allThumbs.forEach(function(t) {
                    t.classList.remove('active');
                });
                this.classList.add('active');
            });
        });
    }

    // Inicializar cuando el DOM esté listo
    function init() {
        initCategoryFilter();
        initProductGallery();
        initProductSearch();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
