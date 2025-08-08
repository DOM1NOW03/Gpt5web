// JavaScript pro menu a animace
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    // Toggle mobile menu
    menuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });
    
    // Smooth scroll pro navigační odkazy
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            // Zavřít mobilní menu
            mobileMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });
    
            // Parallax efekt pro hero sekci
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.hero-particles');
        if (parallax) {
            const speed = scrolled * 0.5;
            parallax.style.transform = `translateY(${speed}px)`;
        }
    });
    
    // Intersection Observer pro animace při scrollování
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    // Sledovat elementy pro animace
    document.querySelectorAll('[class*="animate-"]').forEach(el => {
        observer.observe(el);
    });
    
    // === SLIDESHOW FUNKCIONALITA ===
let currentSlideIndex = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
let slideInterval;

// Inicializace slideshow
function initSlideshow() {
    if (slides.length === 0) return;
    
    startAutoSlide();
    
    const heroImage = document.querySelector('.hero-image');
    if (heroImage) {
        heroImage.addEventListener('mouseenter', stopAutoSlide);
        heroImage.addEventListener('mouseleave', startAutoSlide);
    }
}

// Zobrazení slide
function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.remove('active', 'slide-in');
        if (i === index) {
            slide.classList.add('active', 'slide-in');
        }
    });
    
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
    
    currentSlideIndex = index;
}

// Změna slide
function changeSlide(direction) {
    currentSlideIndex += direction;
    
    if (currentSlideIndex >= slides.length) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = slides.length - 1;
    }
    
    showSlide(currentSlideIndex);
}

// Přechod na konkrétní slide
function currentSlide(index) {
    showSlide(index - 1);
}

// Automatické přepínání
function startAutoSlide() {
    slideInterval = setInterval(() => {
        changeSlide(1);
    }, 4000); // 4 sekund
}

function stopAutoSlide() {
    clearInterval(slideInterval);
}

// Spuštění při načtení
document.addEventListener('DOMContentLoaded', function() {
    initSlideshow();
    
    // Tvůj stávající kód...
});

    
    // Hero CTA button click
    const heroCta = document.querySelector('.hero-cta');
    if (heroCta) {
    heroCta.addEventListener('click', function() {
        document.querySelector('#catalog').scrollIntoView({
            behavior: 'smooth'
        });
    }); // ← Přidat uzavírací závorku            });

/// === TOUCH/SWIPE SLIDESHOW === 
class TouchSlideshow {
    constructor() {
        this.currentSlideIndex = 0;
        this.slides = document.querySelectorAll('.slide');
        this.dots = document.querySelectorAll('.dot');
        this.slider = document.querySelector('.image-slider');
        this.slideInterval = null;
        
        // Touch properties
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.isDragging = false;
        this.minSwipeDistance = 50; // Minimální vzdálenost pro swipe
        
        this.init();
    }
    
    init() {
        if (!this.slider || this.slides.length === 0) return;
        
        this.setupTouchEvents();
        this.setupClickEvents();
        this.startAutoSlide();
        this.setupHoverEvents();
    }
    
    // === TOUCH EVENTS ===
    setupTouchEvents() {
        // Touch events
        this.slider.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.slider.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.slider.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
        
        // Mouse events pro desktop
        this.slider.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.slider.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.slider.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.slider.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));
        
        // Zabránit context menu
        this.slider.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    handleTouchStart(e) {
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
        this.isDragging = true;
        this.stopAutoSlide();
    }
    
    handleTouchMove(e) {
        if (!this.isDragging) return;
        
        this.currentX = e.touches[0].clientX;
        this.currentY = e.touches[0].clientY;
        
        const deltaX = Math.abs(this.currentX - this.startX);
        const deltaY = Math.abs(this.currentY - this.startY);
        
        // Pokud je horizontální pohyb větší než vertikální, zabránit scrollování
        if (deltaX > deltaY && deltaX > 10) {
            e.preventDefault();
        }
    }
    
    handleTouchEnd(e) {
        if (!this.isDragging) return;
        
        const deltaX = this.currentX - this.startX;
        const deltaY = this.currentY - this.startY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        
        // Kontrola, zda je to horizontální swipe
        if (absDeltaX > this.minSwipeDistance && absDeltaX > absDeltaY) {
            if (deltaX > 0) {
                // Swipe doprava = předchozí slide
                this.changeSlide(-1);
            } else {
                // Swipe doleva = další slide
                this.changeSlide(1);
            }
        }
        
        this.isDragging = false;
        this.startAutoSlide();
    }
    
    // === MOUSE EVENTS (pro desktop) ===
    handleMouseDown(e) {
        e.preventDefault();
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.isDragging = true;
        this.stopAutoSlide();
    }
    
    handleMouseMove(e) {
        if (!this.isDragging) return;
        this.currentX = e.clientX;
        this.currentY = e.clientY;
    }
    
    handleMouseUp(e) {
        if (!this.isDragging) return;
        
        const deltaX = this.currentX - this.startX;
        const absDeltaX = Math.abs(deltaX);
        
        if (absDeltaX > this.minSwipeDistance) {
            if (deltaX > 0) {
                this.changeSlide(-1);
            } else {
                this.changeSlide(1);
            }
        }
        
        this.isDragging = false;
        this.startAutoSlide();
    }
    
    handleMouseLeave(e) {
        this.isDragging = false;
        this.startAutoSlide();
    }
    
    // === CLICK EVENTS ===
    setupClickEvents() {
        // Navigační tlačítka (pokud existují)
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.changeSlide(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => this.changeSlide(1));
        
        // Indikátory (tečky)
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
    }
    
    // === HOVER EVENTS ===
    setupHoverEvents() {
        const heroImage = document.querySelector('.hero-image');
        if (heroImage) {
            heroImage.addEventListener('mouseenter', () => this.stopAutoSlide());
            heroImage.addEventListener('mouseleave', () => this.startAutoSlide());
        }
    }
    
    // === SLIDE MANAGEMENT ===
    // Uvnitř třídy TouchSlideshow
// Nahraďte celou metodu showSlide

showSlide(index) {
    const totalSlides = this.slides.length;

    this.slides.forEach((slide, i) => {
        // Nejprve odstraníme všechny stavové třídy
        slide.classList.remove('active', 'prev', 'next', 'hidden');

        // Výpočet pozic pro předchozí a následující slide
        const prevIndex = (index - 1 + totalSlides) % totalSlides;
        const nextIndex = (index + 1) % totalSlides;

        if (i === index) {
            // Toto je nový aktivní slide
            slide.classList.add('active');
        } else if (i === prevIndex) {
            // Toto je slide nalevo
            slide.classList.add('prev');
        } else if (i === nextIndex) {
            // Toto je slide napravo
            slide.classList.add('next');
        } else {
            // Všechny ostatní jsou skryté
            slide.classList.add('hidden');
        }
    });

    // Aktualizujeme aktivní tečku
    this.dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });

    // Uložíme si nový aktuální index
    this.currentSlideIndex = index;
}

    // === AUTO SLIDE ===
    startAutoSlide() {
        this.stopAutoSlide();
        this.slideInterval = setInterval(() => {
            this.changeSlide(1);
        }, 5000);
    }
    
    stopAutoSlide() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    }
}

// === INICIALIZACE ===
document.addEventListener('DOMContentLoaded', function() {
    // Inicializace touch slideshow
    const slideshow = new TouchSlideshow();
    
    // Keyboard support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            slideshow.changeSlide(-1);
        } else if (e.key === 'ArrowRight') {
            slideshow.changeSlide(1);
        }
    });
    
    // Tvůj stávající kód...
});

// === GLOBAL FUNCTIONS (pro HTML onclick atributy) ===
function changeSlide(direction) {
    if (window.slideshow) {
        window.slideshow.changeSlide(direction);
    }
}

function currentSlide(index) {
    if (window.slideshow) {
        window.slideshow.goToSlide(index - 1);
    }
}
 /* Zabránit výběru textu při swipe */
}

.slide.active {
    opacity: 1;
}

.slide img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none; /* Zabránit drag & drop obrázků */
    user-select: none;
}

/* Skrýt navigační tlačítka na touch zařízeních */
@media (hover: none) and (pointer: coarse) {
    .slider-controls {
        display: none;
    }
    
    /* Větší indikátory pro snadnější touch */
    .dot {
        width: 16px;
        height: 16px;
        margin: 0 8px;
    }
}

/* Touch feedback pro indikátory */
.dot:active {
    transform: scale(0.9);
    transition: transform 0.1s ease;
}

/* Swipe indikátor (volitelný vizuální hint) */
.swipe-hint {
    position: absolute;
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    z-index: 5;
    animation: fadeInOut 3s ease-in-out infinite;
    pointer-events: none;
}

@keyframes fadeInOut {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
}

/* Animace pro swipe přechody */
.slide.swipe-left {
    transform: translateX(-100%);
}

.slide.swipe-right {
    transform: translateX(100%);
}

@media (max-width: 768px) {
    .image-slider {
        height: 300px;
        touch-action: pan-y;
    }
    
    .swipe-hint {
        bottom: 50px;
        font-size: 0.8rem;
    }
}

// Rezervační systém - rozšíření pro Bezva webovka
class ReservationSystem {
    constructor() {
        this.currentDate = new Date();
        this.selectedStartDate = null;
        this.selectedEndDate = null;
        this.currentProduct = null;
        this.unavailableDates = [
            '2025-08-15', '2025-08-16', '2025-08-22', 
            '2025-08-30', '2025-09-05', '2025-09-12'
        ];
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // Otevření rezervačního modalu z hero sekce
        const reservationBtn = document.querySelector('.btn--primary');
        if (reservationBtn) {
            reservationBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showReservationModal();
            });
        }
        
        // Navigace kalendáře
        document.getElementById('prevMonth')?.addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextMonth')?.addEventListener('click', () => this.changeMonth(1));
        
        // Potvrzení rezervace
        document.getElementById('confirmReservation')?.addEventListener('click', () => this.confirmReservation());
        
        // Zavření modalu
        document.getElementById('reservationModalClose')?.addEventListener('click', () => this.closeModal());
    }
    
    showReservationModal() {
        const modal = document.getElementById('reservationModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.generateCalendar();
        }
    }
    
    closeModal() {
        const modal = document.getElementById('reservationModal');
        if (modal) {
            modal.classList.add('hidden');
            this.resetSelection();
        }
    }
    
    generateCalendar() {
        const monthNames = [
            'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
            'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
        ];
        
        const currentMonthEl = document.getElementById('currentMonth');
        const calendarGrid = document.getElementById('calendarGrid');
        
        if (!currentMonthEl || !calendarGrid) return;
        
        currentMonthEl.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Vyčistit grid
        calendarGrid.innerHTML = '';
        
        // Přidat názvy dnů
        const dayNames = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
        dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            dayHeader.style.cssText = `
                font-weight: bold; 
                text-align: center; 
                padding: 8px; 
                color: var(--primary-color);
                font-size: 0.8rem;
            `;
            calendarGrid.appendChild(dayHeader);
        });
        
        // První den měsíce a počet dní
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = (firstDay.getDay() + 6) % 7; // Pondělí = 0
        
        // Prázdné buňky na začátku
        for (let i = 0; i < startDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }
        
        // Dny měsíce
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElement = document.createElement('div');
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isPast = new Date(dateStr) < new Date().setHours(0,0,0,0);
            const isUnavailable = this.unavailableDates.includes(dateStr);
            
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            dayElement.dataset.date = dateStr;
            
            if (isPast) {
                dayElement.classList.add('past');
            } else if (isUnavailable) {
                dayElement.classList.add('unavailable');
            } else {
                dayElement.classList.add('available');
                dayElement.addEventListener('click', () => this.selectDate(dateStr));
            }
            
            calendarGrid.appendChild(dayElement);
        }
        
        this.updateSelectedDates();
    }
    
    selectDate(dateStr) {
        if (!this.selectedStartDate || (this.selectedStartDate && this.selectedEndDate)) {
            // Výběr nového období
            this.selectedStartDate = dateStr;
            this.selectedEndDate = null;
        } else {
            // Výběr konce období
            const start = new Date(this.selectedStartDate);
            const end = new Date(dateStr);
            
            if (end > start) {
                this.selectedEndDate = dateStr;
            } else {
                this.selectedStartDate = dateStr;
                this.selectedEndDate = null;
            }
        }
        
        this.updateSelectedDates();
        this.calculatePrice();
    }
    
    updateSelectedDates() {
        const allDays = document.querySelectorAll('.calendar-day[data-date]');
        
        allDays.forEach(day => {
            day.classList.remove('selected', 'start-date', 'end-date', 'in-range');
            
            if (this.selectedStartDate && day.dataset.date === this.selectedStartDate) {
                day.classList.add('selected', 'start-date');
            }
            
            if (this.selectedEndDate && day.dataset.date === this.selectedEndDate) {
                day.classList.add('selected', 'end-date');
            }
            
            if (this.selectedStartDate && this.selectedEndDate) {
                const dayDate = new Date(day.dataset.date);
                const start = new Date(this.selectedStartDate);
                const end = new Date(this.selectedEndDate);
                
                if (dayDate > start && dayDate < end) {
                    day.classList.add('in-range');
                }
            }
        });
    }
    
    calculatePrice() {
        if (!this.selectedStartDate) return;
        
        const basePriceEl = document.getElementById('baseDayPrice');
        const totalDaysEl = document.getElementById('totalDays');
        const deliveryPriceEl = document.getElementById('deliveryPrice');
        const totalPriceEl = document.getElementById('totalPrice');
        
        const basePrice = 1500; // Základní cena za den
        const deliveryPrice = 500;
        
        let days = 1;
        if (this.selectedEndDate) {
            const start = new Date(this.selectedStartDate);
            const end = new Date(this.selectedEndDate);
            days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        }
        
        const totalPrice = (basePrice * days) + deliveryPrice;
        
        if (basePriceEl) basePriceEl.textContent = `${basePrice} Kč`;
        if (totalDaysEl) totalDaysEl.textContent = days;
        if (deliveryPriceEl) deliveryPriceEl.textContent = `${deliveryPrice} Kč`;
        if (totalPriceEl) totalPriceEl.textContent = `${totalPrice} Kč`;
    }
    
    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.generateCalendar();
    }
    
    confirmReservation() {
        if (!this.selectedStartDate) {
            this.showToast('Prosím vyberte datum rezervace', 'error');
            return;
        }
        
        // Přidat do košíku nebo přesměrovat na objednávku
        const reservationData = {
            startDate: this.selectedStartDate,
            endDate: this.selectedEndDate || this.selectedStartDate,
            days: this.selectedEndDate ? 
                Math.ceil((new Date(this.selectedEndDate) - new Date(this.selectedStartDate)) / (1000 * 60 * 60 * 24)) + 1 : 1,
            totalPrice: document.getElementById('totalPrice')?.textContent || '0 Kč'
        };
        
        // Uložit do localStorage
        localStorage.setItem('pendingReservation', JSON.stringify(reservationData));
        
        this.showToast('Rezervace byla uložena! Pokračujte k výběru produktů.', 'success');
        this.closeModal();
        
        // Scroll k produktům
        setTimeout(() => {
            document.querySelector('.top-products')?.scrollIntoView({ behavior: 'smooth' });
        }, 1000);
    }
    
    resetSelection() {
        this.selectedStartDate = null;
        this.selectedEndDate = null;
        this.updateSelectedDates();
        this.calculatePrice();
    }
    
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            const container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Animace zobrazení
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
        
        // Kliknutí pro zavření
        toast.addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        });
    }
}

// Inicializace rezervačního systému po načtení DOM
document.addEventListener('DOMContentLoaded', function() {
    window.reservationSystem = new ReservationSystem();
});

// Rozšíření stávající TouchSlideshow třídy o rezervační funkcionalnost
if (typeof TouchSlideshow !== 'undefined') {
    TouchSlideshow.prototype.addReservationButton = function() {
        const reserveBtn = document.createElement('button');
        reserveBtn.className = 'btn btn--primary reservation-cta';
        reserveBtn.innerHTML = '📅 Rezervovat nyní';
        reserveBtn.style.cssText = `
            position: absolute;
            bottom: 20px;
            right: 20px;
            z-index: 10;
            box-shadow: var(--hover-shadow);
        `;
        
        reserveBtn.addEventListener('click', () => {
            if (window.reservationSystem) {
                window.reservationSystem.showReservationModal();
            }
        });
        
        this.container.style.position = 'relative';
        this.container.appendChild(reserveBtn);
    };
}

// Rezervační systém - rozšíření pro Bezva webovka
class ReservationSystem {
    constructor() {
        this.currentDate = new Date();
        this.selectedStartDate = null;
        this.selectedEndDate = null;
        this.currentProduct = null;
        this.unavailableDates = [
            '2025-08-15', '2025-08-16', '2025-08-22', 
            '2025-08-30', '2025-09-05', '2025-09-12'
        ];
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // Otevření rezervačního modalu z hero sekce
        const reservationBtn = document.querySelector('.btn--primary');
        if (reservationBtn) {
            reservationBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showReservationModal();
            });
        }
        
        // Navigace kalendáře
        document.getElementById('prevMonth')?.addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextMonth')?.addEventListener('click', () => this.changeMonth(1));
        
        // Potvrzení rezervace
        document.getElementById('confirmReservation')?.addEventListener('click', () => this.confirmReservation());
        
        // Zavření modalu
        document.getElementById('reservationModalClose')?.addEventListener('click', () => this.closeModal());
    }
    
    showReservationModal() {
        const modal = document.getElementById('reservationModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.generateCalendar();
        }
    }
    
    closeModal() {
        const modal = document.getElementById('reservationModal');
        if (modal) {
            modal.classList.add('hidden');
            this.resetSelection();
        }
    }
    
    generateCalendar() {
        const monthNames = [
            'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
            'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
        ];
        
        const currentMonthEl = document.getElementById('currentMonth');
        const calendarGrid = document.getElementById('calendarGrid');
        
        if (!currentMonthEl || !calendarGrid) return;
        
        currentMonthEl.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Vyčistit grid
        calendarGrid.innerHTML = '';
        
        // Přidat názvy dnů
        const dayNames = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
        dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            dayHeader.style.cssText = `
                font-weight: bold; 
                text-align: center; 
                padding: 8px; 
                color: var(--primary-color);
                font-size: 0.8rem;
            `;
            calendarGrid.appendChild(dayHeader);
        });
        
        // První den měsíce a počet dní
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = (firstDay.getDay() + 6) % 7; // Pondělí = 0
        
        // Prázdné buňky na začátku
        for (let i = 0; i < startDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }
        
        // Dny měsíce
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElement = document.createElement('div');
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isPast = new Date(dateStr) < new Date().setHours(0,0,0,0);
            const isUnavailable = this.unavailableDates.includes(dateStr);
            
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            dayElement.dataset.date = dateStr;
            
            if (isPast) {
                dayElement.classList.add('past');
            } else if (isUnavailable) {
                dayElement.classList.add('unavailable');
            } else {
                dayElement.classList.add('available');
                dayElement.addEventListener('click', () => this.selectDate(dateStr));
            }
            
            calendarGrid.appendChild(dayElement);
        }
        
        this.updateSelectedDates();
    }
    
    selectDate(dateStr) {
        if (!this.selectedStartDate || (this.selectedStartDate && this.selectedEndDate)) {
            // Výběr nového období
            this.selectedStartDate = dateStr;
            this.selectedEndDate = null;
        } else {
            // Výběr konce období
            const start = new Date(this.selectedStartDate);
            const end = new Date(dateStr);
            
            if (end > start) {
                this.selectedEndDate = dateStr;
            } else {
                this.selectedStartDate = dateStr;
                this.selectedEndDate = null;
            }
        }
        
        this.updateSelectedDates();
        this.calculatePrice();
    }
    
    updateSelectedDates() {
        const allDays = document.querySelectorAll('.calendar-day[data-date]');
        
        allDays.forEach(day => {
            day.classList.remove('selected', 'start-date', 'end-date', 'in-range');
            
            if (this.selectedStartDate && day.dataset.date === this.selectedStartDate) {
                day.classList.add('selected', 'start-date');
            }
            
            if (this.selectedEndDate && day.dataset.date === this.selectedEndDate) {
                day.classList.add('selected', 'end-date');
            }
            
            if (this.selectedStartDate && this.selectedEndDate) {
                const dayDate = new Date(day.dataset.date);
                const start = new Date(this.selectedStartDate);
                const end = new Date(this.selectedEndDate);
                
                if (dayDate > start && dayDate < end) {
                    day.classList.add('in-range');
                }
            }
        });
    }
    
    calculatePrice() {
        if (!this.selectedStartDate) return;
        
        const basePriceEl = document.getElementById('baseDayPrice');
        const totalDaysEl = document.getElementById('totalDays');
        const deliveryPriceEl = document.getElementById('deliveryPrice');
        const totalPriceEl = document.getElementById('totalPrice');
        
        const basePrice = 1500; // Základní cena za den
        const deliveryPrice = 500;
        
        let days = 1;
        if (this.selectedEndDate) {
            const start = new Date(this.selectedStartDate);
            const end = new Date(this.selectedEndDate);
            days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        }
        
        const totalPrice = (basePrice * days) + deliveryPrice;
        
        if (basePriceEl) basePriceEl.textContent = `${basePrice} Kč`;
        if (totalDaysEl) totalDaysEl.textContent = days;
        if (deliveryPriceEl) deliveryPriceEl.textContent = `${deliveryPrice} Kč`;
        if (totalPriceEl) totalPriceEl.textContent = `${totalPrice} Kč`;
    }
    
    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.generateCalendar();
    }
    
    confirmReservation() {
        if (!this.selectedStartDate) {
            this.showToast('Prosím vyberte datum rezervace', 'error');
            return;
        }
        
        // Přidat do košíku nebo přesměrovat na objednávku
        const reservationData = {
            startDate: this.selectedStartDate,
            endDate: this.selectedEndDate || this.selectedStartDate,
            days: this.selectedEndDate ? 
                Math.ceil((new Date(this.selectedEndDate) - new Date(this.selectedStartDate)) / (1000 * 60 * 60 * 24)) + 1 : 1,
            totalPrice: document.getElementById('totalPrice')?.textContent || '0 Kč'
        };
        
        // Uložit do localStorage
        localStorage.setItem('pendingReservation', JSON.stringify(reservationData));
        
        this.showToast('Rezervace byla uložena! Pokračujte k výběru produktů.', 'success');
        this.closeModal();
        
        // Scroll k produktům
        setTimeout(() => {
            document.querySelector('.top-products')?.scrollIntoView({ behavior: 'smooth' });
        }, 1000);
    }
    
    resetSelection() {
        this.selectedStartDate = null;
        this.selectedEndDate = null;
        this.updateSelectedDates();
        this.calculatePrice();
    }
    
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            const container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Animace zobrazení
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
        
        // Kliknutí pro zavření
        toast.addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        });
    }
}

// Inicializace rezervačního systému po načtení DOM
document.addEventListener('DOMContentLoaded', function() {
    window.reservationSystem = new ReservationSystem();
});

// Rozšíření stávající TouchSlideshow třídy o rezervační funkcionalnost
if (typeof TouchSlideshow !== 'undefined') {
    TouchSlideshow.prototype.addReservationButton = function() {
        const reserveBtn = document.createElement('button');
        reserveBtn.className = 'btn btn--primary reservation-cta';
        reserveBtn.innerHTML = '📅 Rezervovat nyní';
        reserveBtn.style.cssText = `
            position: absolute;
            bottom: 20px;
            right: 20px;
            z-index: 10;
            box-shadow: var(--hover-shadow);
        `;
        
        reserveBtn.addEventListener('click', () => {
            if (window.reservationSystem) {
                window.reservationSystem.showReservationModal();
            }
        });
        
        this.container.style.position = 'relative';
        this.container.appendChild(reserveBtn);
    };
}

// Aktivace rezervačního systému po inicializaci slideshow
document.addEventListener('DOMContentLoaded', function() {
    // Inicializace stávající slideshow
    if (typeof TouchSlideshow !== 'undefined') {
        const heroSlideshow = new TouchSlideshow('.hero');
        
        // Přidat rezervační tlačítko do slideshow
        setTimeout(() => {
            if (heroSlideshow.addReservationButton) {
                heroSlideshow.addReservationButton();
            }
        }, 1000);
    }
});
        });
    
