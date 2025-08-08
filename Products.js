console.log('Products.js načten');

// Globální proměnné pro produkty
let allProducts = [];
let currentFilter = 'all';

// Funkce pro načítání produktů
async function loadProducts() {
    try {
        console.log('Načítám produkty...');
        const response = await fetch('Products.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        allProducts = data.categories;
        
        console.log('Produkty načteny:', allProducts);
        
        // Vygeneruj filtry a produkty
        generateFilters();
        generateProducts();
        
        // Skryj loading spinner
        const loadingElement = document.querySelector('.catalog-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Chyba při načítání produktů:', error);
        showError('Nepodařilo se načíst produkty. Zkuste to později.');
    }
}

// Funkce pro generování filtrů
function generateFilters() {
    const filtersContainer = document.getElementById('catalogFilters');
    if (!filtersContainer) return;

    const filtersHTML = `
        <div class="catalog-filters">
            <div class="filter-buttons">
                <button class="filter-btn active" data-filter="all">Vše</button>
                ${allProducts.map(category => 
                    `<button class="filter-btn" data-filter="${category.id}">${category.name}</button>`
                ).join('')}
            </div>
            <input type="text" class="search-input" placeholder="Vyhledejte produkt..." id="productSearch">
        </div>
    `;
    
    filtersContainer.innerHTML = filtersHTML;
    
    // Přidej event listenery
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });
    
    document.getElementById('productSearch').addEventListener('input', handleSearch);
}

// Funkce pro generování produktů
function generateProducts() {
    const catalogGrid = document.getElementById('catalogGrid');
    if (!catalogGrid) return;

    let productsHTML = '';
    
    allProducts.forEach(category => {
        if (currentFilter === 'all' || currentFilter === category.id) {
            category.products.forEach(product => {
                const price = product.price ? `${product.price.toLocaleString()} Kč` : product.priceNote;
                
                productsHTML += `
                    <div class="catalog-card" data-category="${category.id}" data-product-id="${product.id}">
                        <div class="card-image">
                            <img src="${product.image}" alt="${product.name}" onerror="this.src='obrazky/placeholder.jpg'">
                            <div class="card-overlay">
                                <button class="view-details" onclick="openProductModal(${product.id})">
                                    Zobrazit detail
                                </button>
                            </div>
                        </div>
                        <div class="card-content">
                            <h3>${product.name}</h3>
                            <p>${product.description}</p>
                            <div class="price">${price}</div>
                        </div>
                    </div>
                `;
            });
        }
    });
    
    if (productsHTML === '') {
        catalogGrid.innerHTML = `
            <div class="no-products">
                <p>Žádné produkty nebyly nalezeny.</p>
            </div>
        `;
    } else {
        catalogGrid.innerHTML = productsHTML;
    }
}

// Event handler pro filtry
function handleFilterClick(e) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    currentFilter = e.target.dataset.filter;
    generateProducts();
}

// Event handler pro vyhledávání
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.catalog-card');
    
    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Funkce pro zobrazení chyby
function showError(message) {
    const catalogGrid = document.getElementById('catalogGrid');
    if (catalogGrid) {
        catalogGrid.innerHTML = `
            <div class="catalog-error">
                <p>❌ ${message}</p>
                <button onclick="loadProducts()">Zkusit znovu</button>
            </div>
        `;
    }
}

// Funkce pro otevření modal okna produktu
function openProductModal(productId) {
    console.log('Otevírám modal pro produkt ID:', productId);
    // Zde bude logika pro zobrazení modal okna
    // Tuto funkci dokončíš v Modal.js
}

// Automatické načtení při načtení stránky
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM načten, spouštím loadProducts()');
    loadProducts();
});

// Export funkcí pro použití v jiných souborech
window.loadProducts = loadProducts;
window.openProductModal = openProductModal;
