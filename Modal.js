// Modal funkcionalita s košíkem
class AttractionModal {
    constructor() {
        this.modal = document.getElementById('attractionModal');
        if (!this.modal) {
            console.error('Modal nebyl nalezen!');
            return;
        }
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.currentAttraction = null;
        this.currentImages = [];
        this.currentImageIndex = 0;
        
        this.init();
        this.updateCartCount();
    }

    init() {
        this.setupEventListeners();
        this.setMinDate();
        this.setupCatalogClicks();
    }

    setupEventListeners() {
        // Zavření modalu - BEZPEČNĚ
        const closeBtn = this.modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        const overlay = this.modal.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.closeModal());
        }

        // ESC klávesa
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });

        // Navigace obrázků - BEZPEČNĚ
        const prevBtn = this.modal.querySelector('.prev-btn');
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevImage());

        const nextBtn = this.modal.querySelector('.next-btn');
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextImage());

        // Tabs - querySelectorAll je bezpečný
        this.modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        this.setupFormListeners();

        // Akční tlačítka - BEZPEČNĚ
        const checkBtn = document.getElementById('checkAvailability');
        if (checkBtn) checkBtn.addEventListener('click', () => this.checkAvailability());

        const addToCartBtn = document.getElementById('addToCart');
        if (addToCartBtn) addToCartBtn.addEventListener('click', () => this.addToCart());
    }

    setupFormListeners() {
        const rentalDays = document.getElementById('rentalDays');
        if (rentalDays) {
            rentalDays.addEventListener('change', () => this.calculatePrice());
        }

        const serviceCheckboxes = this.modal.querySelectorAll('.service-option input[type="checkbox"]');
        serviceCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.calculatePrice());
        });

        const eventDate = document.getElementById('eventDate');
        if (eventDate) {
            eventDate.addEventListener('change', () => {
                const calendar = document.getElementById('availabilityCalendar');
                if (calendar) {
                    calendar.style.display = 'block';
                    this.generateCalendar();
                }
            });
        }
    }

    setupCatalogClicks() {
        // Připojení na existující catalog karty
        document.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const card = e.target.closest('.catalog-card');
                if (card) {
                    this.openModal(this.getAttractionData(card));
                }
            });
        });
    }

    getAttractionData(card) {
        const titleElement = card.querySelector('h3');
        const priceElement = card.querySelector('.price');
        const imageElement = card.querySelector('img');
        
        const title = titleElement ? titleElement.textContent : 'Neznámá atrakce';
        const price = priceElement ? priceElement.textContent.replace(/[^\d]/g, '') : '1500';
        const image = imageElement ? imageElement.src : '';
        
        // Simulace databáze atrakcí
        const attractions = {
            'BAGR SE SKLUZAVKOU': {
                title: 'Bagr se skluzavkou',
                price: 8900,
                dimensions: '8 x 3 x 4,5 m',
                capacity: '8-12 dětí',
                age: '3-12 let',
                weight: '120 kg',
                description: 'Skákací hrad se skluzavkou. Do dojezdové části skluzavky je možné umístit plastové míčky.',
                images: [image || 'Image/placeholder.jpg']
            }
            // Přidej další atrakce podle potřeby
        };

        return attractions[title] || {
            title: title,
            price: parseInt(price) || 1500,
            dimensions: '5×3×3 m',
            capacity: '6-8 dětí',
            age: '3-10 let',
            weight: '60 kg',
            description: 'Kvalitní nafukovací atrakce pro dětské akce.',
            images: [image || 'Image/placeholder.jpg']
        };
    }

    openModal(attractionData) {
        this.currentAttraction = attractionData;
        this.currentImages = attractionData.images;
        this.currentImageIndex = 0;

        this.populateModal(attractionData);
        
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        this.resetForm();
        this.calculatePrice();
    }

    populateModal(data) {
        // Bezpečné naplnění dat
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) modalTitle.textContent = data.title;

        const modalPrice = document.getElementById('modalPrice');
        if (modalPrice) modalPrice.textContent = data.price.toLocaleString();

        const modalDimensions = document.getElementById('modalDimensions');
        if (modalDimensions) modalDimensions.textContent = data.dimensions;

        const modalCapacity = document.getElementById('modalCapacity');
        if (modalCapacity) modalCapacity.textContent = data.capacity;

        const modalAge = document.getElementById('modalAge');
        if (modalAge) modalAge.textContent = data.age;

        const modalWeight = document.getElementById('modalWeight');
        if (modalWeight) modalWeight.textContent = data.weight;

        const modalDescription = document.getElementById('modalDescription');
        if (modalDescription) modalDescription.textContent = data.description;

        this.setupImages();
    }

    setupImages() {
        const mainImage = document.getElementById('modalMainImage');
        const thumbnailGallery = this.modal.querySelector('.thumbnail-gallery');
        
        if (mainImage && this.currentImages.length > 0) {
            mainImage.src = this.currentImages[0];
        }
        
        if (thumbnailGallery) {
            thumbnailGallery.innerHTML = '';
            this.currentImages.forEach((image, index) => {
                const thumbnail = document.createElement('div');
                thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
                thumbnail.innerHTML = `<img src="${image}" alt="Thumbnail ${index + 1}">`;
                thumbnail.addEventListener('click', () => this.selectImage(index));
                thumbnailGallery.appendChild(thumbnail);
            });
        }
    }

    selectImage(index) {
        this.currentImageIndex = index;
        const mainImage = document.getElementById('modalMainImage');
        if (mainImage) {
            mainImage.src = this.currentImages[index];
        }
        
        // Update active thumbnail
        this.modal.querySelectorAll('.thumbnail').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }

    prevImage() {
        const newIndex = this.currentImageIndex > 0 
            ? this.currentImageIndex - 1 
            : this.currentImages.length - 1;
        this.selectImage(newIndex);
    }

    nextImage() {
        const newIndex = this.currentImageIndex < this.currentImages.length - 1 
            ? this.currentImageIndex + 1 
            : 0;
        this.selectImage(newIndex);
    }

    switchTab(tabName) {
        this.modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        this.modal.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });

        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) activeTab.classList.add('active');
        
        const activePanel = document.getElementById(tabName);
        if (activePanel) activePanel.classList.add('active');
    }

    setMinDate() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dateInput = document.getElementById('eventDate');
        if (dateInput) {
            dateInput.min = tomorrow.toISOString().split('T')[0];
        }
    }

    calculatePrice() {
        if (!this.currentAttraction) return;

        const basePrice = this.currentAttraction.price;
        const rentalDaysElement = document.getElementById('rentalDays');
        const days = rentalDaysElement ? parseInt(rentalDaysElement.value) || 1 : 1;
        
        const serviceCheckboxes = this.modal.querySelectorAll('.service-option input[type="checkbox"]:checked');
        
        let servicesPrice = 0;
        serviceCheckboxes.forEach(checkbox => {
            servicesPrice += parseInt(checkbox.dataset.price) || 0;
        });

        const totalBasePrice = basePrice * days;
        const totalServicesPrice = servicesPrice * days;
        const totalPrice = totalBasePrice + totalServicesPrice;

        // Bezpečné update UI
        const basePriceElement = document.getElementById('basePrice');
        if (basePriceElement) basePriceElement.textContent = `${totalBasePrice.toLocaleString()} Kč`;

        const servicesPriceElement = document.getElementById('servicesPrice');
        if (servicesPriceElement) servicesPriceElement.textContent = `${totalServicesPrice.toLocaleString()} Kč`;

        const totalPriceElement = document.getElementById('totalPrice');
        if (totalPriceElement) totalPriceElement.textContent = `${totalPrice.toLocaleString()} Kč`;

        const servicesRow = this.modal.querySelector('.services-price');
        if (servicesRow) {
            servicesRow.style.display = totalServicesPrice > 0 ? 'flex' : 'none';
        }
    }

    checkAvailability() {
        const selectedDate = document.getElementById('eventDate');
        if (!selectedDate || !selectedDate.value) {
            alert('Prosím vyberte datum akce');
            return;
        }

        const calendar = document.getElementById('availabilityCalendar');
        if (calendar) {
            calendar.style.display = 'block';
            this.generateCalendar();
        }
        
        const checkBtn = document.getElementById('checkAvailability');
        if (checkBtn) {
            checkBtn.textContent = '✓ Volné';
            checkBtn.style.background = 'var(--primary-green)';
            checkBtn.style.color = 'white';
            
            setTimeout(() => {
                checkBtn.innerHTML = '<span>Zkontrolovat dostupnost</span>';
                checkBtn.style.background = '';
                checkBtn.style.color = '';
            }, 2000);
        }
    }

    generateCalendar() {
        const calendarMini = this.modal.querySelector('.calendar-mini');
        if (calendarMini) {
            calendarMini.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--primary-green); font-weight: 600;">
                    ✓ Vybrané datum je volné
                </div>
            `;
        }
    }

    addToCart() {
        const formData = this.getFormData();
        if (!this.validateForm(formData)) return;

        const cartItem = {
            id: Date.now(),
            attraction: this.currentAttraction,
            ...formData,
            totalPrice: this.calculateTotalPrice()
        };

        this.cart.push(cartItem);
        this.saveCart();
        this.updateCartCount();
        
        this.showSuccessAnimation();
        
        setTimeout(() => {
            this.closeModal();
        }, 1500);
    }

    getFormData() {
        const selectedServices = Array.from(
            this.modal.querySelectorAll('.service-option input[type="checkbox"]:checked')
        ).map(cb => ({
            name: cb.nextElementSibling?.nextElementSibling?.textContent || 'Služba',
            price: parseInt(cb.dataset.price) || 0
        }));

        const eventDate = document.getElementById('eventDate');
        const eventTime = document.getElementById('eventTime');
        const rentalDays = document.getElementById('rentalDays');
        const participants = document.getElementById('participants');

        return {
            eventDate: eventDate ? eventDate.value : '',
            eventTime: eventTime ? eventTime.value : '',
            rentalDays: rentalDays ? parseInt(rentalDays.value) || 1 : 1,
            participants: participants ? participants.value : '',
            services: selectedServices
        };
    }

    validateForm(formData) {
        if (!formData.eventDate) {
            alert('Prosím vyberte datum akce');
            return false;
        }
        if (!formData.eventTime) {
            alert('Prosím vyberte čas akce');
            return false;
        }
        return true;
    }

    calculateTotalPrice() {
        if (!this.currentAttraction) return 0;

        const basePrice = this.currentAttraction.price;
        const rentalDaysElement = document.getElementById('rentalDays');
        const days = rentalDaysElement ? parseInt(rentalDaysElement.value) || 1 : 1;
        
        const serviceCheckboxes = this.modal.querySelectorAll('.service-option input[type="checkbox"]:checked');
        
        let servicesPrice = 0;
        serviceCheckboxes.forEach(checkbox => {
            servicesPrice += parseInt(checkbox.dataset.price) || 0;
        });

        return (basePrice * days) + (servicesPrice * days);
    }

    showSuccessAnimation() {
        const addBtn = document.getElementById('addToCart');
        if (addBtn) {
            addBtn.innerHTML = '✓ Přidáno do košíku';
            addBtn.style.background = 'var(--primary-green)';
            addBtn.style.transform = 'scale(1.05)';
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    updateCartCount() {
        const cartCount = document.querySelector
