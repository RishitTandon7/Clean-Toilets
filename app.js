// DOM Elements
const menuBtn = document.querySelector('.menu-btn');
const filterBtn = document.querySelector('.filter-btn');
const filtersPanel = document.querySelector('.filters-panel');
const closeFilters = document.querySelector('.close-filters');
const searchInput = document.querySelector('.search-wrapper input');
const loadingMessage = document.querySelector('.loading-message');
const toiletCardsContainer = document.querySelector('.toilet-cards');
const sidebar = document.getElementById('sidebar');
const closeSidebarBtn = document.querySelector('.close-sidebar');
const addToiletFab = document.querySelector('.add-toilet-fab');
const addToiletModal = document.querySelector('.add-toilet-modal');
const closeModal = document.querySelector('.close-modal');
const addToiletForm = document.getElementById('addToiletForm');
const imageInput = document.getElementById('toiletImages');
const imagePreview = document.querySelector('.image-preview');
const navItems = document.querySelectorAll('.nav-item');

// Create overlay element
const overlay = document.createElement('div');
overlay.className = 'overlay';
document.body.appendChild(overlay);

// Sample Data
let toilets = [
    {
        id: 1,
        name: "Central Station Restroom",
        distance: "50m",
        rating: 4.5,
        reviews: 128,
        status: "OPEN",
        cleanliness: "4.8/5",
        address: "123 Station Square",
        features: ["wheelchair", "baby", "free"],
        coordinates: { lat: 51.5074, lng: -0.1278 },
        images: ["ct.jpg"],
        isFavorite: false
    },
    {
        id: 2,
        name: "Shopping Mall Toilet",
        distance: "150m",
        rating: 4.2,
        reviews: 89,
        status: "CLOSED",
        cleanliness: "4.5/5",
        address: "456 Mall Street",
        features: ["wheelchair", "paid"],
        coordinates: { lat: 51.5075, lng: -0.1276 },
        images: ["mt.jpeg"],
        isFavorite: false
    }
];

// Load favorites from localStorage
const loadFavorites = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    toilets = toilets.map(toilet => ({
        ...toilet,
        isFavorite: favorites.includes(toilet.id)
    }));
};

// Toggle Favorite
function toggleFavorite(id) {
    const toilet = toilets.find(t => t.id === id);
    if (toilet) {
        toilet.isFavorite = !toilet.isFavorite;
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        if (toilet.isFavorite) {
            favorites.push(id);
            showNotification('Added to favorites');
        } else {
            const index = favorites.indexOf(id);
            if (index > -1) favorites.splice(index, 1);
            showNotification('Removed from favorites');
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
        renderToiletCards();
    }
}

// Show Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Generate Stars
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = '';
    
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
}

// Generate Features
function generateFeatures(features) {
    return features.map(feature => {
        let icon = '';
        switch (feature) {
            case 'wheelchair':
                icon = 'fa-wheelchair';
                break;
            case 'baby':
                icon = 'fa-baby';
                break;
            case 'free':
                icon = 'fa-dollar-sign';
                break;
            case 'paid':
                icon = 'fa-coins';
                break;
            default:
                icon = 'fa-check';
        }
        return `<span class="feature"><i class="fas ${icon}"></i> ${feature}</span>`;
    }).join('');
}

// Render Toilet Cards
function renderToiletCards(toiletsToRender = toilets) {
    toiletCardsContainer.innerHTML = toiletsToRender.map(toilet => `
        <div class="toilet-card" data-id="${toilet.id}">
            <div class="toilet-images">
                ${toilet.images.length ? `<img src="${toilet.images[0]}" alt="${toilet.name}">` : ''}
                <button class="favorite-btn ${toilet.isFavorite ? 'active' : ''}" 
                        onclick="toggleFavorite(${toilet.id})" 
                        aria-label="Toggle favorite">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="card-content">
                <div class="card-header">
                    <h2>${toilet.name}</h2>
                    <span class="status ${toilet.status.toLowerCase()}">${toilet.status}</span>
                </div>
                <div class="rating">
                    <div class="stars">${generateStars(toilet.rating)}</div>
                    <span class="rating-number">${toilet.rating}</span>
                    <span class="reviews">(${toilet.reviews} reviews)</span>
                </div>
                <div class="location">
                    <p><i class="fas fa-location-arrow"></i> ${toilet.distance}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${toilet.address}</p>
                </div>
                <div class="cleanliness">
                    <span>Cleanliness:</span>
                    <span>${toilet.cleanliness}</span>
                </div>
                <div class="features">
                    ${generateFeatures(toilet.features)}
                </div>
                <div class="card-actions">
                    <button class="btn-directions" onclick="getDirections(${toilet.id})">
                        <i class="fas fa-directions"></i>
                        Get Directions
                    </button>
                    <button class="btn-details" onclick="showDetails(${toilet.id})">
                        <i class="fas fa-info-circle"></i>
                        Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Filter Functionality
function filterToilets() {
    const searchTerm = searchInput.value.toLowerCase();
    const ratingFilter = parseFloat(document.getElementById('ratingSlider').value);
    const distanceFilter = parseInt(document.getElementById('distanceSlider').value);
    const features = Array.from(document.querySelectorAll('.feature-option input:checked')).map(cb => cb.name);
    
    const filteredToilets = toilets.filter(toilet => {
        const matchesSearch = toilet.name.toLowerCase().includes(searchTerm) ||
                            toilet.address.toLowerCase().includes(searchTerm);
        const matchesRating = toilet.rating >= ratingFilter;
        const matchesDistance = parseInt(toilet.distance) <= distanceFilter;
        const matchesFeatures = features.length === 0 || 
                              features.every(f => toilet.features.includes(f));
        
        return matchesSearch && matchesRating && matchesDistance && matchesFeatures;
    });
    
    renderToiletCards(filteredToilets);
}

// Event Listeners
menuBtn.addEventListener('click', () => {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeSidebarBtn.addEventListener('click', closeSidebar);

filterBtn.addEventListener('click', () => {
    filtersPanel.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeFilters.addEventListener('click', () => {
    filtersPanel.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
});

addToiletFab.addEventListener('click', () => {
    addToiletModal.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeModal.addEventListener('click', () => {
    addToiletModal.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
});

// Image Upload Handler
imageInput.addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    imagePreview.innerHTML = '';
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.innerHTML += `
                    <img src="${e.target.result}" alt="Preview">
                `;
            };
            reader.readAsDataURL(file);
        }
    });
});

// Form Submit Handler
addToiletForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // Add form submission logic here
    addToiletModal.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    showNotification('Toilet added successfully');
});

// Search Input Handler
searchInput.addEventListener('input', filterToilets);

// Slider Update Handler
function updateSliderValue(slider) {
    const valueDisplay = slider.nextElementSibling;
    if (slider.id === 'ratingSlider') {
        valueDisplay.textContent = slider.value === '0' ? 'Any rating' : `${slider.value}+ stars`;
    } else {
        valueDisplay.textContent = slider.value === '5000' ? 'Any distance' : `Within ${slider.value}m`;
    }
    filterToilets();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadFavorites();
    renderToiletCards();
    setTimeout(() => {
        loadingMessage.style.display = 'none';
    }, 1500);
});

// Handle overlay clicks
overlay.addEventListener('click', () => {
    closeSidebar();
    filtersPanel.classList.remove('active');
    addToiletModal.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
});

// Close panels on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeSidebar();
        filtersPanel.classList.remove('active');
        addToiletModal.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Get Directions
function getDirections(id) {
    const toilet = toilets.find(t => t.id === id);
    if (toilet) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${toilet.coordinates.lat},${toilet.coordinates.lng}`;
        window.open(url, '_blank');
    }
}

// Show Details
function showDetails(id) {
    const toilet = toilets.find(t => t.id === id);
    if (toilet) {
        const detailsModal = document.createElement('div');
        detailsModal.className = 'details-modal active';
        detailsModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${toilet.name}</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Rating:</strong> ${toilet.rating}/5 (${toilet.reviews} reviews)</p>
                    <p><strong>Cleanliness:</strong> ${toilet.cleanliness}</p>
                    <p><strong>Features:</strong> ${toilet.features.join(', ')}</p>
                    <p><strong>Address:</strong> ${toilet.address}</p>
                    <p><strong>Status:</strong> ${toilet.status}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(detailsModal);
        
        detailsModal.querySelector('.close-modal').onclick = () => {
            detailsModal.remove();
        };
    }
}

function closeSidebar() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}
