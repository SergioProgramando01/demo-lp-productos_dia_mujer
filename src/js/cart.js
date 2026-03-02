/**
 * ============================================
 * SISTEMA DE CARRITO DE COMPRAS
 * Landing Page - Día de la Mujer
 * ============================================
 */

(function() {
    'use strict';

    var CartSystem = {
        cart: [],
        whatsappNumber: '573001234567',
        
        init: function() {
            this.loadCart();
            this.bindEvents();
            this.updateUI();
        },
        
        loadCart: function() {
            try {
                var saved = localStorage.getItem('shoppingCart');
                this.cart = saved ? JSON.parse(saved) : [];
            } catch (e) {
                this.cart = [];
            }
        },
        
        saveCart: function() {
            try {
                localStorage.setItem('shoppingCart', JSON.stringify(this.cart));
            } catch (e) {
                console.error('Error guardando carrito:', e);
            }
        },
        
        addItem: function(product) {
            var existing = null;
            for (var i = 0; i < this.cart.length; i++) {
                if (this.cart[i].id === product.id) {
                    existing = this.cart[i];
                    break;
                }
            }
            if (existing) {
                existing.quantity += 1;
            } else {
                this.cart.push({id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1});
            }
            this.saveCart();
            this.updateUI();
            this.showNotification();
        },
        
        removeItem: function(productId) {
            var newCart = [];
            for (var i = 0; i < this.cart.length; i++) {
                if (this.cart[i].id !== productId) {
                    newCart.push(this.cart[i]);
                }
            }
            this.cart = newCart;
            this.saveCart();
            this.updateUI();
        },
        
        updateQuantity: function(productId, delta) {
            for (var i = 0; i < this.cart.length; i++) {
                if (this.cart[i].id === productId) {
                    this.cart[i].quantity += delta;
                    if (this.cart[i].quantity <= 0) {
                        this.removeItem(productId);
                    } else {
                        this.saveCart();
                        this.updateUI();
                    }
                    return;
                }
            }
        },
        
        getTotal: function() {
            var sum = 0;
            for (var i = 0; i < this.cart.length; i++) {
                sum += this.cart[i].price * this.cart[i].quantity;
            }
            return sum;
        },
        
        getTotalItems: function() {
            var sum = 0;
            for (var i = 0; i < this.cart.length; i++) {
                sum += this.cart[i].quantity;
            }
            return sum;
        },
        
        updateUI: function() {
            var badge = document.getElementById('cartBadge');
            var totalItems = this.getTotalItems();
            
            if (badge) {
                badge.textContent = totalItems;
                if (totalItems > 0) {
                    badge.classList.add('active');
                } else {
                    badge.classList.remove('active');
                }
            }
            
            this.renderCartItems();
            this.updateCheckoutLink();
        },
        
        renderCartItems: function() {
            var container = document.getElementById('cartItems');
            if (!container) return;
            
            if (this.cart.length === 0) {
                container.innerHTML = '<p class="cart-empty">Tu carrito est\u00e1 vac\u00edo</p>';
                return;
            }
            
            var html = '';
            for (var i = 0; i < this.cart.length; i++) {
                var item = this.cart[i];
                var imgSrc = item.image ? item.image : 'src/assets/images/placeholder.jpg';
                html += '<div class="cart-item">' +
                    '<img src="' + imgSrc + '" alt="' + item.name + '" class="cart-item-image">' +
                    '<div class="cart-item-details">' +
                        '<div class="cart-item-name">' + item.name + '</div>' +
                        '<div class="cart-item-price">$' + item.price.toLocaleString() + '</div>' +
                        '<div class="cart-item-controls">' +
                            '<div class="cart-item-qty">' +
                                '<button class="cart-qty-btn" onclick="CartSystem.updateQuantity(\'' + item.id + '\', -1)">-</button>' +
                                '<span class="cart-qty-value">' + item.quantity + '</span>' +
                                '<button class="cart-qty-btn" onclick="CartSystem.updateQuantity(\'' + item.id + '\', 1)">+</button>' +
                            '</div>' +
                            '<button class="cart-item-remove" onclick="CartSystem.removeItem(\'' + item.id + '\')">Eliminar</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            }
            container.innerHTML = html;
            
            var totalEl = document.getElementById('cartTotal');
            if (totalEl) {
                totalEl.textContent = '$' + this.getTotal().toLocaleString();
            }
        },
        
        updateCheckoutLink: function() {
            var link = document.getElementById('checkoutWhatsApp');
            if (!link) return;
            
            if (this.cart.length === 0) {
                link.style.pointerEvents = 'none';
                link.style.opacity = '0.5';
                return;
            }
            
            var message = 'Hola, quiero hacer el siguiente pedido:%0A';
            for (var i = 0; i < this.cart.length; i++) {
                var item = this.cart[i];
                message += '%0A- ' + item.name + ' x' + item.quantity + ' = $' + (item.price * item.quantity).toLocaleString();
            }
            message += '%0A%0ATotal: $' + this.getTotal().toLocaleString();
            
            link.href = 'https://wa.me/' + this.whatsappNumber + '?text=' + message;
            link.style.pointerEvents = 'auto';
            link.style.opacity = '1';
        },
        
        showNotification: function() {
            var badge = document.getElementById('cartBadge');
            if (badge) {
                badge.style.transform = 'scale(1.3)';
                setTimeout(function() {
                    badge.style.transform = 'scale(1)';
                }, 200);
            }
        },
        
        openModal: function() {
            var modal = document.getElementById('cartModal');
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        },
        
        closeModal: function() {
            var modal = document.getElementById('cartModal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        },
        
        bindEvents: function() {
            var self = this;
            var cartBtn = document.getElementById('headerCartBtn');
            var cartClose = document.getElementById('cartClose');
            var cartBackdrop = document.getElementById('cartBackdrop');
            var continueShopping = document.getElementById('continueShopping');
            
            if (cartBtn) {
                cartBtn.addEventListener('click', function() { self.openModal(); });
            }
            
            if (cartClose) {
                cartClose.addEventListener('click', function() { self.closeModal(); });
            }
            
            if (cartBackdrop) {
                cartBackdrop.addEventListener('click', function() { self.closeModal(); });
            }
            
            if (continueShopping) {
                continueShopping.addEventListener('click', function() { self.closeModal(); });
            }
            
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    self.closeModal();
                }
            });
        }
    };

    // Hacer accesible globalmente
    window.CartSystem = CartSystem;

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            CartSystem.init();
        });
    } else {
        CartSystem.init();
    }

})();
