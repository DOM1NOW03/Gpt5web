// ===== BEZVA PARTA KOŠÍK SYSTÉM S POKROČILÝMI ANIMACEMI =====
console.log('Cart.js načten');

// Inicializace košíku
const cart = {
    items: [],
    count: 0,
    
    updateDisplay() {
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = this.count;
        }
    }
};

// Export pro použití v jiných souborech
window.cart = cart;
class BezvaPartaCartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('bezva_parta_cart')) || [];
        this.isOpen = false;
        this.animationDuration = 300;
        this.currency = 'Kč';
        this.deliveryFee = 500;
        this.freeDeliveryThreshold = 5000;
        
        // Particle system pro animace
        this.particles = [];
        
        this.init();
        this.createCartHTML();
        this.updateCartDisplay();
        this.setupAnimations();
    }

    init() {
        this.setupEventListeners();
        this.createToastContainer();
        this.initParticleSystem();
        this.watchCartChanges();
        this.setupKeyboardShortcuts();
    }

    // ===== VYTVOŘENÍ HTML STRUKTURY =====
    createCartHTML() {
        const cartHTML = `
            <!-- Košík Sidebar -->
            <div class="cart-sidebar" id="cartSidebar">
                <div class="cart-backdrop"></div>
                <div class="cart-container">
                    <!-- Header -->
                    <div class="cart-header">
                        <div class="cart-title">
                            <div class="cart-icon-wrapper">
                                <svg class="cart-icon" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                </svg>
                                <span class="cart-count-badge" id="cartCountBadge">0</span>
                            </div>
                            <div class="cart-title-text">
                                <h3>Váš košík</h3>
                                <small>Bezva parta rezervace</small>
                            </div>
                        </div>
                        <button class="cart-close" id="cartClose">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Progress bar -->
                    <div class="cart-progress">
                        <div class="progress-step active">
                            <div class="step-icon">1</div>
                            <span>Košík</span>
                        </div>
                        <div class="progress-line"></div>
                        <div class="progress-step">
                            <div class="step-icon">2</div>
                            <span>Údaje</span>
                        </div>
                        <div class="progress-line"></div>
                        <div class="progress-step">
                            <div class="step-icon">3</div>
                            <span>Potvrzení</span>
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="cart-content">
                        <div class="cart-items" id="cartItems">
                            <!-- Dynamické položky -->
                        </div>

                        <!-- Empty state -->
                        <div class="cart-empty" id="cartEmpty" style="display: none;">
                            <div class="empty-animation">
                                <div class="empty-icon">🎈</div>
                                <div class="floating-balloons">
                                    <div class="balloon balloon-1">🎈</div>
                                    <div class="balloon balloon-2">🎊</div>
                                    <div class="balloon balloon-3">🎉</div>
                                </div>
                            </div>
                            <h4>Košík je prázdný</h4>
                            <p>Přidejte si nějaké atrakce k rezervaci</p>
                            <button class="btn-browse" onclick="document.querySelector('#catalog')?.scrollIntoView({behavior: 'smooth'}); cartManager.closeCart();">
                                Prohlédnout atrakce
                            </button>
                        </div>
                    </div>

                    <!-- Summary -->
                    <div class="cart-summary" id="cartSummary">
                        <!-- Promo kódy -->
                        <div class="promo-section">
                            <div class="promo-input-wrapper">
                                <input type="text" id="promoCode" placeholder="Slevový kód" class="promo-input">
                                <button class="promo-apply" id="applyPromo">Použít</button>
                            </div>
                            <div class="applied-promos" id="appliedPromos"></div>
                        </div>

                        <!-- Ceny -->
                        <div class="price-breakdown">
                            <div class="price-row">
                                <span>Atrakce:</span>
                                <span id="subtotalPrice">0 ${this.currency}</span>
                            </div>
                            <div class="price-row">
                                <span>Doprava a instalace:</span>
                                <span id="deliveryPrice">0 ${this.currency}</span>
                            </div>
                            <div class="price-row discount-row" id="discountRow" style="display: none;">
                                <span>Sleva:</span>
                                <span id="discountPrice" class="discount-amount">-0 ${this.currency}</span>
                            </div>
                            <div class="price-row total-row">
                                <strong>Celkem:</strong>
                                <strong id="totalPrice" class="total-amount">0 ${this.currency}</strong>
                            </div>
                        </div>

                        <!-- Tlačítka -->
                        <div class="cart-actions">
                            <button class="btn-continue" id="continueShopping">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                                </svg>
                                Pokračovat v nákupu
                            </button>
                            <button class="btn-checkout" id="checkoutBtn">
                                <span>Přejít k objednávce</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Loading overlay -->
                    <div class="cart-loading" id="cartLoading" style="display: none;">
                        <div class="loading-spinner"></div>
                        <p>Zpracovávám...</p>
                    </div>
                </div>
            </div>

            <!-- Floating cart button -->
            <div class="floating-cart" id="floatingCart">
                <button class="floating-cart-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                    <span class="floating-count" id="floatingCount">0</span>
                </button>
                <div class="floating-total" id="floatingTotal">0 ${this.currency}</div>
            </div>

            <!-- Success Modal -->
            <div class="success-modal" id="successModal">
                <div class="success-content">
                    <div class="success-animation">
                        <div class="checkmark">✓</div>
                        <div class="confetti"></div>
                    </div>
                    <h3 id="successTitle">Přidáno do košíku!</h3>
                    <div class="success-item" id="successItem"></div>
                    <div class="success-actions">
                        <button class="btn-continue-modal" id="successContinue">Pokračovat</button>
                        <button class="btn-view-cart" id="successViewCart">Zobrazit košík</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', cartHTML);
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Hlavní košík tlačítko
        document.addEventListener('click', (e) => {
            if (e.target.closest('.cart-btn')) {
                e.preventDefault();
                this.toggleCart();
            }
        });

        // Floating cart
        document.addEventListener('click', (e) => {
            if (e.target.closest('.floating-cart-btn')) {
                this.toggleCart();
            }
        });

        // Zavření košíku
        document.addEventListener('click', (e) => {
            if (e.target.closest('.cart-close, .cart-backdrop')) {
                this.closeCart();
            }
        });

        // Košík události
        document.addEventListener('click', (e) => {
            const cartSidebar = document.getElementById('cartSidebar');
            if (!cartSidebar || !cartSidebar.contains(e.target)) return;

            // Odebrání položky
            if (e.target.closest('.remove-item')) {
                const itemId = e.target.closest('.cart-item').dataset.id;
                this.removeFromCart(parseInt(itemId));
            }

            // Změna množství
            if (e.target.closest('.quantity-btn')) {
                const itemId = e.target.closest('.cart-item').dataset.id;
                const action = e.target.dataset.action;
                this.updateQuantity(parseInt(itemId), action);
            }

            // Checkout
            if (e.target.closest('#checkoutBtn')) {
                this.proceedToCheckout();
            }

            // Pokračovat v nákupu
            if (e.target.closest('#continueShopping')) {
                this.closeCart();
                this.scrollToProducts();
            }

            // Promo kód
            if (e.target.closest('#applyPromo')) {
                this.applyPromoCode();
            }
        });

        // Success modal události
        this.setupSuccessModalListeners();
    }

    setupSuccessModalListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('#successContinue')) {
                this.closeSuccessModal();
            }
            if (e.target.closest('#successViewCart')) {
                this.closeSuccessModal();
                setTimeout(() => this.openCart(), 200);
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ESC zavře košík
            if (e.key === 'Escape' && this.isOpen) {
                this.closeCart();
            }
            
            // Ctrl+K otevře košík
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.toggleCart();
            }
        });
    }

    // ===== KOŠÍK OPERACE =====
    addToCart(item, showAnimation = true) {
        // Kontrola duplicity
        const existingItem = this.cart.find(cartItem => 
            cartItem.attraction?.title === item.attraction?.title && 
            cartItem.eventDate === item.eventDate &&
            cartItem.eventTime === item.eventTime
        );

        if (existingItem) {
            this.showToast('Tato atrakce je již v košíku pro vybrané datum a čas', 'warning');
            this.shakeCartIcon();
            return false;
        }

        // Přidání nové položky
        const newItem = {
            id: Date.now() + Math.random(),
            addedAt: new Date().toISOString(),
            ...item
        };

        this.cart.push(newItem);
        this.saveCart();
        
        if (showAnimation) {
            this.animateAddToCart(newItem);
            this.showSuccessModal(newItem);
        }

        this.updateCartDisplay();
        this.showToast(`${item.attraction?.title || 'Atrakce'} přidána do košíku`, 'success');
        
        return true;
    }

    removeFromCart(itemId) {
        const itemIndex = this.cart.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;

        const removedItem = this.cart[itemIndex];
        
        // Animace odebrání
        this.animateRemoveFromCart(itemId, () => {
            this.cart.splice(itemIndex, 1);
            this.saveCart();
            this.updateCartDisplay();
        });

        this.showToast(`${removedItem.attraction?.title || 'Atrakce'} odebrána z košíku`, 'info');
    }

    updateQuantity(itemId, action) {
        const item = this.cart.find(item => item.id === itemId);
        if (!item) return;

        const oldQuantity = item.rentalDays || 1;
        
        if (action === 'increase') {
            if (oldQuantity < 7) { // Max 7 dní
                item.rentalDays = oldQuantity + 1;
                item.totalPrice = this.calculateItemPrice(item);
            } else {
                this.showToast('Maximální doba pronájmu je 7 dní', 'warning');
                return;
            }
        } else if (action === 'decrease') {
            if (oldQuantity > 1) {
                item.rentalDays = oldQuantity - 1;
                item.totalPrice = this.calculateItemPrice(item);
            } else {
                this.removeFromCart(itemId);
                return;
            }
        }

        // Animace změny
        this.animateQuantityChange(itemId, oldQuantity, item.rentalDays);
        
        this.saveCart();
        this.updateCartDisplay();
    }

    calculateItemPrice(item) {
        const basePrice = (item.attraction?.price || 0) * (item.rentalDays || 1);
        const servicesPrice = item.services ? 
            item.services.reduce((sum, service) => sum + (service.price * (item.rentalDays || 1)), 0) : 0;
        return basePrice + servicesPrice;
    }

    // ===== DISPLAY AKTUALIZACE =====
    updateCartDisplay() {
        this.updateCartCount();
        this.updateCartItems();
        this.updateCartSummary();
        this.updateCartState();
        this.updateFloatingCart();
    }

    updateCartCount() {
        const count = this.cart.length;
        const badges = document.querySelectorAll('.cart-count, #cartCountBadge, #floatingCount');
        
        badges.forEach(badge => {
            if (badge) {
                badge.textContent = count;
                badge.style.display = count > 0 ? 'flex' : 'none';
                
                if (count > 0) {
                    badge.classList.add('bounce');
                    setTimeout(() => badge.classList.remove('bounce'), 600);
                }
            }
        });
    }

    updateCartItems() {
        const container = document.getElementById('cartItems');
        if (!container) return;

        container.innerHTML = '';

        this.cart.forEach((item, index) => {
            const cartItemHTML = this.createCartItemHTML(item, index);
            container.insertAdjacentHTML('beforeend', cartItemHTML);
        });

        // Stagger animace
        setTimeout(() => this.staggerItemsAnimation(), 50);
    }

    createCartItemHTML(item, index) {
        const itemTotal = (item.totalPrice || 0);
        const formattedDate = new Date(item.eventDate).toLocaleDateString('cs-CZ', {
            day: 'numeric',
            month: 'long'
        });
        
        return `
            <div class="cart-item" data-id="${item.id}" style="animation-delay: ${index * 0.1}s">
                <div class="cart-item-image">
                    <img src="${item.attraction?.images?.[0] || '/placeholder.jpg'}" 
                         alt="${item.attraction?.title || 'Atrakce'}" 
                         loading="lazy">
                    <div class="item-badge">${item.rentalDays || 1}d</div>
                </div>
                
                <div class="cart-item-details">
                    <div class="item-header">
                        <h4 class="item-title">${item.attraction?.title || 'Atrakce'}</h4>
                        <button class="remove-item" aria-label="Odebrat">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="item-meta">
                        <div class="item-date">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                            </svg>
                            ${formattedDate}
                            ${item.eventTime ? `• ${item.eventTime}` : ''}
                        </div>
                        ${item.services?.length > 0 ? `
                            <div class="item-services">
                                ${item.services.map(service => `
                                    <span class="service-tag">${service.name}</span>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="item-footer">
                        <div class="quantity-controls">
                            <button class="quantity-btn" data-action="decrease" aria-label="Snížit">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 13H5v-2h14v2z"/>
                                </svg>
                            </button>
                            <span class="quantity-display">${item.rentalDays || 1} dní</span>
                            <button class="quantity-btn" data-action="increase" aria-label="Zvýšit">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                </svg>
                            </button>
                        </div>
                        
                        <div class="item-price">
                            <span class="price-amount">${itemTotal.toLocaleString()} ${this.currency}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    updateCartSummary() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
        const delivery = subtotal >= this.freeDeliveryThreshold ? 0 : this.deliveryFee;
        const discount = this.calculateDiscount(subtotal);
        const total = subtotal + delivery - discount;

        // Aktualizace UI
        const subtotalEl = document.getElementById('subtotalPrice');
        const deliveryEl = document.getElementById('deliveryPrice');
        const totalEl = document.getElementById('totalPrice');
        const floatingTotalEl = document.getElementById('floatingTotal');

        if (subtotalEl) this.animateNumberChange(subtotalEl, subtotal);
        if (deliveryEl) {
            deliveryEl.textContent = delivery === 0 ? 'Zdarma' : `${delivery.toLocaleString()} ${this.currency}`;
        }
        if (totalEl) this.animateNumberChange(totalEl, total);
        if (floatingTotalEl) floatingTotalEl.textContent = `${total.toLocaleString()} ${this.currency}`;

        // Zobrazení slevy
        const discountRow = document.getElementById('discountRow');
        const discountPriceEl = document.getElementById('discountPrice');
        if (discount > 0) {
            discountPriceEl.textContent = `-${discount.toLocaleString()} ${this.currency}`;
            discountRow.style.display = 'flex';
        } else {
            discountRow.style.display = 'none';
        }
    }

    updateCartState() {
        const isEmpty = this.cart.length === 0;
        const emptyState = document.getElementById('cartEmpty');
        const summary = document.getElementById('cartSummary');
        const itemsContainer = document.getElementById('cartItems');

        if (emptyState) emptyState.style.display = isEmpty ? 'flex' : 'none';
        if (summary) summary.style.display = isEmpty ? 'none' : 'block';
        if (itemsContainer) itemsContainer.style.display = isEmpty ? 'none' : 'block';
    }

    updateFloatingCart() {
        const floatingCart = document.getElementById('floatingCart');
        const hasItems = this.cart.length > 0;
        
        if (floatingCart) {
            floatingCart.classList.toggle('visible', hasItems);
        }
    }

    // ===== ANIMACE =====
    setupAnimations() {
        // CSS animace
        const animationCSS = `
            <style id="cart-animations">
                .cart-item-enter {
                    animation: itemSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                
                .cart-item-exit {
                    animation: itemSlideOut 0.3s ease-out forwards;
                }
                
                @keyframes itemSlideIn {
                    from {
                        opacity: 0;
                        transform: translateX(50px) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0) scale(1);
                    }
                }
                
                @keyframes itemSlideOut {
                    to {
                        opacity: 0;
                        transform: translateX(-50px) scale(0.8);
                        max-height: 0;
                        padding: 0;
                        margin: 0;
                    }
                }
                
                .bounce {
                    animation: bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }
                
                @keyframes bounce {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.3); }
                    100% { transform: scale(1); }
                }
                
                .number-change {
                    animation: numberPulse 0.4s ease-out;
                }
                
                @keyframes numberPulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); color: var(--primary-green); }
                    100% { transform: scale(1); }
                }
                
                .shake {
                    animation: shake 0.5s ease-in-out;
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
            </style>
        `;
        
        if (!document.getElementById('cart-animations')) {
            document.head.insertAdjacentHTML('beforeend', animationCSS);
        }
    }

    // Pokračování všech animačních metod ze vašeho kódu...
    animateAddToCart(item) {
        // Najít source element
        const addButton = document.querySelector('#addToCart, .btn-primary:focus');
        
        if (addButton) {
            this.createFlyingAnimation(addButton, item);
        }

        // Pulse animace pro košík
        const cartButton = document.querySelector('.cart-btn');
        if (cartButton) {
            cartButton.classList.add('cart-pulse');
            setTimeout(() => cartButton.classList.remove('cart-pulse'), 600);
        }
    }

    createFlyingAnimation(sourceElement, item) {
        const sourceRect = sourceElement.getBoundingClientRect();
        const cartButton = document.querySelector('.cart-btn') || 
                          document.querySelector('.floating-cart-btn');
        
        if (!cartButton) return;
        
        const cartRect = cartButton.getBoundingClientRect();
        
        // Vytvoření létající ikony
        const flyingElement = document.createElement('div');
        flyingElement.className = 'flying-cart-item';
        flyingElement.innerHTML = `
            <img src="${item.attraction?.images?.[0] || '/placeholder.jpg'}" alt="${item.attraction?.title}">
        `;
        flyingElement.style.cssText = `
            position: fixed;
            left: ${sourceRect.left + sourceRect.width / 2}px;
            top: ${sourceRect.top + sourceRect.height / 2}px;
            width: 60px;
            height: 60px;
            z-index: 9999;
            pointer-events: none;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 8px 25px rgba(164, 214, 94, 0.4);
            transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        `;
        
        flyingElement.querySelector('img').style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
        `;
        
        document.body.appendChild(flyingElement);
        
        // Animace letu
        requestAnimationFrame(() => {
            flyingElement.style.left = `${cartRect.left + cartRect.width / 2}px`;
            flyingElement.style.top = `${cartRect.top + cartRect.height / 2}px`;
            flyingElement.style.transform = 'scale(0.3)';
            flyingElement.style.opacity = '0';
        });
        
        // Odstranění po animaci
        setTimeout(() => {
            if (flyingElement.parentNode) {
                flyingElement.remove();
            }
        }, 800);
    }

    animateRemoveFromCart(itemId, callback) {
        const itemElement = document.querySelector(`[data-id="${itemId}"]`);
        if (!itemElement) {
            callback();
            return;
        }

        itemElement.classList.add('cart-item-exit');
        setTimeout(callback, 300);
    }

    animateQuantityChange(itemId, oldQuantity, newQuantity) {
        const quantityDisplay = document.querySelector(`[data-id="${itemId}"] .quantity-display`);
        const priceElement = document.querySelector(`[data-id="${itemId}"] .price-amount`);
        
        if (quantityDisplay) {
            quantityDisplay.classList.add('bounce');
            setTimeout(() => quantityDisplay.classList.remove('bounce'), 600);
        }
        
        if (priceElement) {
            priceElement.classList.add('number-change');
            setTimeout(() => priceElement.classList.remove('number-change'), 400);
        }
    }

    animateNumberChange(element, newValue) {
        if (!element) return;
        
        const formattedValue = `${newValue.toLocaleString()} ${this.currency}`;
        
        if (element.textContent !== formattedValue) {
            element.classList.add('number-change');
            element.textContent = formattedValue;
            
            setTimeout(() => {
                element.classList.remove('number-change');
            }, 400);
        }
    }

    staggerItemsAnimation() {
        const items = document.querySelectorAll('.cart-item');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('cart-item-enter');
            }, index * 100);
        });
    }

    shakeCartIcon() {
        const cartButton = document.querySelector('.cart-btn');
        if (cartButton) {
            cartButton.classList.add('shake');
            setTimeout(() => cartButton.classList.remove('shake'), 500);
        }
    }

    // ===== CART UI CONTROLS =====
    toggleCart() {
        if (this.isOpen) {
            this.closeCart();
        } else {
            this.openCart();
        }
    }

    openCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        if (!cartSidebar) return;

        this.isOpen = true;
        cartSidebar.classList.add('active');
        document.body.classList.add('cart-open');
        
        // Animace načítání
        if (this.cart.length === 0) {
            setTimeout(() => this.updateCartState(), 200);
        }
    }

    closeCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        if (!cartSidebar) return;

        this.isOpen = false;
        cartSidebar.classList.remove('active');
        document.body.classList.remove('cart-open');
    }

    // ===== SUCCESS MODAL =====
    showSuccessModal(item) {
        const modal = document.getElementById('successModal');
        const itemContainer = document.getElementById('successItem');
        
        if (!modal || !itemContainer) return;

        itemContainer.innerHTML = `
            <div class="success-product">
                <img src="${item.attraction?.images?.[0] || '/placeholder.jpg'}" 
                     alt="${item.attraction?.title}">
                <div class="success-details">
                    <h5>${item.attraction?.title || 'Atrakce'}</h5>
                    <p>${new Date(item.eventDate).toLocaleDateString('cs-CZ')} • ${item.rentalDays || 1} dní</p>
                    <p class="success-price">${(item.totalPrice || 0).toLocaleString()} ${this.currency}</p>
                </div>
            </div>
        `;

        modal.classList.add('active');
        
        // Auto zavření po 4 sekundách
        setTimeout(() => {
            if (modal.classList.contains('active')) {
                this.closeSuccessModal();
            }
        }, 4000);
    }

    closeSuccessModal() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // ===== PROMO CODES =====
    applyPromoCode() {
        const promoInput = document.getElementById('promoCode');
        const code = promoInput?.value.trim().toUpperCase();
        
        if (!code) {
            this.showToast('Zadejte slevový kód', 'warning');
            return;
        }

        const validCodes = {
            'LETO2025': { discount: 0.10, description: 'Letní sleva 10%' },
            'RODINA': { discount: 300, description: 'Rodinná sleva 300 Kč' },
            'PRVNI': { discount: 0.15, description: 'Sleva pro nové zákazníky 15%' }
        };

        if (validCodes[code]) {
            if (!this.appliedPromoCodes) this.appliedPromoCodes = [];
            
            // Kontrola duplicity
            if (this.appliedPromoCodes.some(promo => promo.code === code)) {
                this.showToast('Tento kód již byl použit', 'warning');
                return;
            }

            this.appliedPromoCodes.push({ code, ...validCodes[code] });
            promoInput.value = '';
            this.updatePromoDisplay();
            this.updateCartSummary();
            this.showToast(`Slevový kód "${code}" byl aplikován`, 'success');
        } else {
            this.showToast('Neplatný slevový kód', 'error');
            promoInput.classList.add('shake');
            setTimeout(() => promoInput.classList.remove('shake'), 500);
        }
    }

    updatePromoDisplay() {
        const container = document.getElementById('appliedPromos');
        if (!container || !this.appliedPromoCodes?.length) return;

        container.innerHTML = this.appliedPromoCodes.map(promo => `
            <div class="applied-promo">
                <span class="promo-code">${promo.code}</span>
                <span class="promo-description">${promo.description}</span>
                <button class="remove-promo" onclick="cartManager.removePromoCode('${promo.code}')">×</button>
            </div>
        `).join('');
    }

    removePromoCode(code) {
        if (!this.appliedPromoCodes) return;
        
        this.appliedPromoCodes = this.appliedPromoCodes.filter(promo => promo.code !== code);
        this.updatePromoDisplay();
        this.updateCartSummary();
        this.showToast(`Slevový kód "${code}" byl odebrán`, 'info');
    }

    calculateDiscount(subtotal) {
        if (!this.appliedPromoCodes?.length) return 0;

        return this.appliedPromoCodes.reduce((total, promo) => {
            if (promo.discount < 1) {
                // Procentuální sleva
                return total + (subtotal * promo.discount);
            } else {
                // Pevná sleva
                return total + promo.discount;
            }
        }, 0);
    }

    // ===== CHECKOUT =====
    proceedToCheckout() {
        if (this.cart.length === 0) {
            this.showToast('Košík je prázdný', 'warning');
            return;
        }

        this.showLoading(true);

        // Příprava dat pro checkout
        const checkoutData = {
            items: this.cart,
            subtotal: this.cart.reduce((sum, item) => sum + (item.totalPrice || 0), 0),
            delivery: this.cart.reduce((sum, item) => sum + (item.totalPrice || 0), 0) >= this.freeDeliveryThreshold ? 0 : this.deliveryFee,
            discount: this.calculateDiscount(this.cart.reduce((sum, item) => sum + (item.totalPrice || 0), 0)),
            promoCodes: this.appliedPromoCodes || []
        };

        setTimeout(() => {
            this.showLoading(false);
            localStorage.setItem('bezva_checkout_data', JSON.stringify(checkoutData));
            this.showToast('Přesměrování na objednávku...', 'success');
            // Zde by byla implementace přesměrování na checkout stránku
        }, 1000);
    }

    showLoading(show) {
        const loading = document.getElementById('cartLoading');
        if (loading) {
            loading.style.display = show ? 'flex' : 'none';
        }
    }

    // ===== UTILITY FUNCTIONS =====
    saveCart() {
        localStorage.setItem('bezva_parta_cart', JSON.stringify(this.cart));
        this.triggerCartChange();
    }

    triggerCartChange() {
        window.dispatchEvent(new CustomEvent('cartChanged', {
            detail: {
                cart: this.cart,
                itemCount: this.cart.length,
                total: this.cart.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
            }
        }));
    }

    watchCartChanges() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'bezva_parta_cart') {
                this.cart = JSON.parse(e.newValue || '[]');
                this.updateCartDisplay();
            }
        });
    }

    scrollToProducts() {
        const catalogSection = document.querySelector('#catalog');
        if (catalogSection) {
            catalogSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    createToastContainer() {
        if (document.getElementById('toastContainer')) return;

        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${icons[type] || icons.info}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close">&times;</button>
            </div>
        `;

        container.appendChild(toast);
        
        // Animace zobrazení
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto remove
        const autoRemove = setTimeout(() => {
            this.removeToast(toast);
        }, 4000);

        // Kliknutí pro zavření
        toast.querySelector('.toast-close').addEventListener('click', () => {
            clearTimeout(autoRemove);
            this.removeToast(toast);
        });
    }

    removeToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }

    initParticleSystem() {
        // Systém pro konfetky a particle efekty
        this.particleSystem = {
            create: (x, y, count = 10) => {
                const colors = ['#A4D65E', '#7CB342', '#9CCC65', '#C5E1A5'];
                
                for (let i = 0; i < count; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    particle.style.cssText = `
                        position: fixed;
                        left: ${x}px;
                        top: ${y}px;
                        width: 8px;
                        height: 8px;
                        background: ${colors[Math.floor(Math.random() * colors.length)]};
                        border-radius: 50%;
                        pointer-events: none;
                        z-index: 9999;
                    `;
                    
                    document.body.appendChild(particle);
                    
                    const angle = (i / count) * Math.PI * 2;
                    const velocity = 80 + Math.random() * 40;
                    const vx = Math.cos(angle) * velocity;
                    const vy = Math.sin(angle) * velocity;
                    
                    particle.animate([
                        { 
                            transform: 'translate(0, 0) scale(1) rotate(0deg)', 
                            opacity: 1 
                        },
                        { 
                            transform: `translate(${vx}px, ${vy + 100}px) scale(0) rotate(360deg)`, 
                            opacity: 0 
                        }
                    ], {
                        duration: 1500,
                        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                    }).onfinish = () => particle.remove();
                }
            }
        };
    }

    // ===== INTEGRACE S MODAL SYSTÉMEM =====
    static integrate() {
        if (window.attractionModal) {
            // Přepsat metodu modal systému pro integraci s košíkem
            const originalAddToCart = window.attractionModal.addToCart;
            if (originalAddToCart) {
                window.attractionModal.addToCart = function() {
                    // Implementace přidání do košíku
                    if (window.cartManager) {
                        const item = this.getCurrentItem();
                        window.cartManager.addToCart(item);
                    }
                };
            }
        }
    }

    getCurrentItem() {
        // Pomocná metoda pro získání aktuální položky z modalu
        return {
            attraction: {
                title: document.getElementById('modalTitle')?.textContent,
                price: parseInt(document.getElementById('modalPrice')?.textContent) || 0,
                images: [document.getElementById('modalMainImage')?.src]
            },
            eventDate: document.getElementById('eventDate')?.value,
            eventTime: document.getElementById('eventTime')?.value,
            rentalDays: parseInt(document.getElementById('rentalDays')?.value) || 1,
            totalPrice: this.calculateModalPrice()
        };
    }

    calculateModalPrice() {
        const basePrice = parseInt(document.getElementById('modalPrice')?.textContent) || 0;
        const days = parseInt(document.getElementById('rentalDays')?.value) || 1;
        return basePrice * days;
    }
}

// ===== INICIALIZACE =====
document.addEventListener('DOMContentLoaded', () => {
    window.cartManager = new BezvaPartaCartManager();
    BezvaPartaCartManager.integrate();
    console.log('🛒 Bezva Parta Cart Manager inicializován úspěšně');
});

// Export pro použití v jiných modulech
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BezvaPartaCartManager;
}
