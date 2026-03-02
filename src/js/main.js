/**
 * ============================================
 * MAIN JAVASCRIPT - LANDING PAGE
 * Día de la Mujer
 * ============================================
 * 
 * Este archivo contiene funciones de SEGURIDAD:
 * 1. Sanitización de entrada de usuarios
 * 2. Validación de datos
 * 3. Protección contra XSS
 * 4. Validación de URLs
 * 5. Manejo seguro de eventos
 * 
 * NOTA: El sistema del carrito está en cart.js
 * 
 */

(function() {
    'use strict';

    // ============================================
    // SEGURIDAD - CONFIGURACIÓN GLOBAL
    // ============================================
    
    const SecurityConfig = {
        // Longitudes máximas para inputs
        maxInputLength: 1000,
        maxTextLength: 5000,
        
        // Patrones permitidos
        allowedProtocols: ['https:', 'mailto:'],
        allowedDomains: [],
        
        // Configuración de sanitización
        stripHTML: true,
        escapeHTML: true
    };

    // ============================================
    // SEGURIDAD - FUNCIONES DE SANITIZACIÓN
    // ============================================

    /**
     * Escapa caracteres HTML para prevenir XSS
     * @param {string} str - String a sanitizar
     * @returns {string} String sanitizado
     */
    function escapeHtml(str) {
        if (typeof str !== 'string') {
            return '';
        }
        
        const htmlEscapes = {
            '&': '&',
            '<': '<',
            '>': '>',
            '"': '"',
            "'": '&#x27;',
            '/': '&#x2F;'
        };
        
        return str.replace(/[&<>"'\/]/g, char => htmlEscapes[char] || char);
    }

    /**
     * Elimina todas las etiquetas HTML
     * @param {string} str - String a sanitizar
     * @returns {string} String sin HTML
     */
    function stripHtml(str) {
        if (typeof str !== 'string') {
            return '';
        }
        
        const tmp = document.createElement('div');
        tmp.textContent = str;
        return tmp.textContent || tmp.innerText || '';
    }

    /**
     * Sanitiza entrada de usuario de forma completa
     * @param {string} input - Input del usuario
     * @param {object} options - Opciones de sanitización
     * @returns {string} Input sanitizado
     */
    function sanitizeInput(input, options = {}) {
        if (typeof input !== 'string') {
            return '';
        }

        let sanitized = input;

        // Eliminar caracteres nulos
        sanitized = sanitized.replace(/\0/g, '');
        
        // Eliminar secuencias de bytes UTF-8 inválidas
        try {
            sanitized = new TextDecoder('utf-8', { fatal: true })
                .decode(new TextEncoder().encode(sanitized));
        } catch (e) {
            sanitized = stripHtml(sanitized);
        }

        // Opciones configurables
        if (options.stripHTML !== false) {
            sanitized = stripHtml(sanitized);
        }

        if (options.escapeHTML !== false) {
            sanitized = escapeHtml(sanitized);
        }

        // Recortar espacios en blanco
        sanitized = sanitized.trim();

        // Limitar longitud
        const maxLength = options.maxLength || SecurityConfig.maxInputLength;
        if (sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength);
        }

        return sanitized;
    }

    /**
     * Valida y sanitiza una URL
     * @param {string} url - URL a validar
     * @returns {string|null} URL válida o null
     */
    function sanitizeUrl(url) {
        if (typeof url !== 'string') {
            return null;
        }

        try {
            const urlObj = new URL(url, window.location.origin);
            
            // Verificar protocolo permitido
            if (!SecurityConfig.allowedProtocols.includes(urlObj.protocol)) {
                if (!urlObj.protocol.startsWith('http') && !url.startsWith('/')) {
                    return null;
                }
            }
            
            // Prevenir javascript: URLs
            if (urlObj.protocol === 'javascript:') {
                return null;
            }
            
            // Prevenir data: URLs
            if (urlObj.protocol === 'data:') {
                return null;
            }
            
            return urlObj.href;
        } catch (e) {
            if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
                return url;
            }
            return null;
        }
    }

    /**
     * Valida dirección de email
     * @param {string} email - Email a validar
     * @returns {boolean} True si es válido
     */
    function validateEmail(email) {
        if (typeof email !== 'string') {
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const sanitized = email.trim().toLowerCase();
        
        if (sanitized.length > 254) {
            return false;
        }
        
        return emailRegex.test(sanitized);
    }

    /**
     * Valida número de teléfono
     * @param {string} phone - Teléfono a validar
     * @returns {boolean} True si es válido
     */
    function validatePhone(phone) {
        if (typeof phone !== 'string') {
            return false;
        }
        
        const cleaned = phone.replace(/[^\d+]/g, '');
        return cleaned.length >= 7 && cleaned.length <= 15;
    }

    // ============================================
    // SEGURIDAD - MANEJO DE EVENTOS
    // ============================================

    /**
     * Crea un manejador de eventos seguro
     * @param {Function} handler - Función manejadora
     * @returns {Function} Manejador envuelto
     */
    function safeEventHandler(handler) {
        return function(event) {
            try {
                if (!event || typeof event.preventDefault !== 'function') {
                    console.warn('Evento inválido recibido');
                    return;
                }
                
                return handler.call(this, event);
            } catch (error) {
                console.error('Error en manejador de eventos:', error);
            }
        };
    }

    /**
     * Añade evento con protección
     * @param {Element} element - Elemento
     * @param {string} event - Nombre del evento
     * @param {Function} handler - Manejador
     * @param {object} options - Opciones
     */
    function safeAddEventListener(element, event, handler, options) {
        if (!element || typeof element.addEventListener !== 'function') {
            console.warn('Elemento inválido para addEventListener');
            return;
        }
        
        element.addEventListener(event, safeEventHandler(handler), options);
    }

    // ============================================
    // SEGURIDAD - FORMULARIOS
    // ============================================

    /**
     * Inicializa validación segura de formularios
     */
    function initSecureForms() {
        const forms = document.querySelectorAll('form[data-secure]');
        
        forms.forEach(function(form) {
            safeAddEventListener(form, 'submit', function(event) {
                const isValid = validateForm(this);
                
                if (!isValid) {
                    event.preventDefault();
                    return false;
                }
                
                sanitizeFormInputs(this);
            });
        });
    }

    /**
     * Valida un formulario completo
     * @param {HTMLFormElement} form - Formulario
     * @returns {boolean} True si es válido
     */
    function validateForm(form) {
        if (!form || form.tagName !== 'FORM') {
            return false;
        }

        const inputs = form.querySelectorAll('input, textarea, select');
        let isValid = true;

        inputs.forEach(function(input) {
            const type = input.type || 'text';
            const value = input.value;
            
            if (input.hasAttribute('required') && !value.trim()) {
                isValid = false;
                input.classList.add('form-error');
            } else if (type === 'email' && value && !validateEmail(value)) {
                isValid = false;
                input.classList.add('form-error');
            } else if (type === 'tel' && value && !validatePhone(value)) {
                isValid = false;
                input.classList.add('form-error');
            } else {
                input.classList.remove('form-error');
            }
        });

        return isValid;
    }

    /**
     * Sanitiza todos los inputs de un formulario
     * @param {HTMLFormElement} form - Formulario
     */
    function sanitizeFormInputs(form) {
        if (!form || form.tagName !== 'FORM') {
            return;
        }

        const inputs = form.querySelectorAll('input, textarea');
        
        inputs.forEach(function(input) {
            if (input.type === 'hidden' || input.type === 'submit') {
                return;
            }
            
            const sanitized = sanitizeInput(input.value, {
                stripHTML: true,
                escapeHTML: false
            });
            
            input.value = sanitized;
        });
    }

    // ============================================
    // SEGURIDAD - ENLACES EXTERNOS
    // ============================================

    /**
     * Protege enlaces externos
     */
    function secureExternalLinks() {
        const links = document.querySelectorAll('a[href^="http"]');
        
        links.forEach(function(link) {
            const href = link.getAttribute('href');
            
            try {
                const url = new URL(href);
                const currentHost = window.location.host;
                
                if (url.host !== currentHost) {
                    link.setAttribute('rel', 'noopener noreferrer');
                    link.setAttribute('target', '_blank');
                }
            } catch (e) {
                // URL inválida
            }
        });
    }

    /**
     * Valida y sanitiza un enlace antes de navegar
     * @param {HTMLAnchorElement} link - Elemento de enlace
     * @returns {boolean} True si es seguro navegar
     */
    function validateLink(link) {
        if (!link || link.tagName !== 'A') {
            return false;
        }

        const href = link.getAttribute('href');
        
        if (!href) {
            return false;
        }

        const safeUrl = sanitizeUrl(href);
        
        if (!safeUrl) {
            console.warn('URL bloqueada por seguridad:', href);
            return false;
        }

        return true;
    }

    // ============================================
    // SEGURIDAD - PROTECCIÓN ADICIONAL
    // ============================================

    /**
     * Deshabilita la selección de texto en elementos sensibles
     */
    function protectSensitiveContent() {
        const sensitiveElements = document.querySelectorAll('.no-copy, [data-nocopy]');
        
        sensitiveElements.forEach(function(element) {
            element.addEventListener('copy', function(event) {
                event.preventDefault();
                return false;
            });
            
            element.addEventListener('cut', function(event) {
                event.preventDefault();
                return false;
            });
            
            element.addEventListener('contextmenu', function(event) {
                event.preventDefault();
                return false;
            });
        });
    }

    /**
     * Detecta y previene modificaciones del DOM
     */
    function monitorDOMChanges() {
        // Solo en desarrollo
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return;
        }

        try {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeName === 'SCRIPT') {
                            const src = node.src || '';
                            if (src && !src.includes(window.location.hostname)) {
                                console.warn('Script externo detectado:', src);
                            }
                        }
                    });
                });
            });

            observer.observe(document.documentElement, {
                childList: true,
                subtree: true
            });
        } catch (e) {
            // MutationObserver no soportado
        }
    }

    // ============================================
    // SEGURIDAD - LOCALSTORAGE/SESSIONSTORAGE
    // ============================================

    /**
     * Wrapper seguro para localStorage
     */
    const SecureStorage = {
        set: function(key, value) {
            try {
                const serialized = JSON.stringify(value);
                localStorage.setItem(key, serialized);
                return true;
            } catch (e) {
                console.error('Error guardando en localStorage:', e);
                return false;
            }
        },

        get: function(key) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (e) {
                console.error('Error leyendo localStorage:', e);
                return null;
            }
        },

        remove: function(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.error('Error removiendo de localStorage:', e);
                return false;
            }
        },

        clear: function() {
            try {
                localStorage.clear();
                return true;
            } catch (e) {
                console.error('Error limpiando localStorage:', e);
                return false;
            }
        }
    };

    // ============================================
    // INICIALIZACIÓN
    // ============================================

    /**
     * Inicializa las funcionalidades del landing
     */
    function init() {
        console.log('Landing Page initialized');
        
        // Inicializar seguridad
        initSecureForms();
        secureExternalLinks();
        protectSensitiveContent();
        monitorDOMChanges();
    }

    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ============================================
    // EXPORTAR FUNCIONES PÚBLICAS
    // ============================================

    window.LandingPage = {
        // Utilidades de seguridad
        security: {
            sanitizeInput: sanitizeInput,
            sanitizeUrl: sanitizeUrl,
            validateEmail: validateEmail,
            validatePhone: validatePhone,
            escapeHtml: escapeHtml,
            stripHtml: stripHtml,
            validateLink: validateLink,
            SecureStorage: SecureStorage
        },
        
        // Utilidades de eventos
        events: {
            safeAddEventListener: safeAddEventListener,
            safeEventHandler: safeEventHandler
        },
        
        // Utilidades de formularios
        forms: {
            validateForm: validateForm,
            sanitizeFormInputs: sanitizeFormInputs
        }
    };

})();
