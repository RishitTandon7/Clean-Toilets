// DOM Elements
const filterBtn = document.querySelector('.filter-btn');
const filtersPanel = document.querySelector('.filters-panel');
const closeFilters = document.querySelector('.close-filters');
const searchInput = document.querySelector('.search-wrapper input');
const loadingMessage = document.querySelector('.loading-message');
const toiletCardsContainer = document.querySelector('.toilet-cards');

// Create overlay element
const overlay = document.createElement('div');
overlay.className = 'overlay';
document.body.appendChild(overlay);

// Sample Data
const toilets = [
    {
        id: 1,
        name: "Central Station Restroom",
        distance: "50m",
        rating: 4.5,
        reviews: 128,
        status: "CLOSED",
        cleanliness: "4.8/5",
        address: "123 Station Square",
        features: ["wheelchair", "baby", "free"],
        coordinates: { lat: 51.5074, lng: -0.1278 }
    },
    {
        id: 2,
        name: "Shopping Mall Toilet",
        distance: "150m",
        rating: 4.2,
        reviews: 89,
        status: "CLOSED",
        cleanliness: "4.5/5",
        address: "Main Mall, Level 2",
        features: ["wheelchair", "baby", "paid"],
        coordinates: { lat: 51.5075, lng: -0.1276 }
    }
];

// Filter button functionality
filterBtn.addEventListener('click', () => {
    filtersPanel.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeFilters?.addEventListener('click', () => {
    filtersPanel.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
});

// Close filters when clicking overlay
overlay.addEventListener('click', () => {
    filtersPanel.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
});

// Search functionality with debounce
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        filterToilets();
    }, 300);
});

// Generate star rating HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            starsHTML += '<i class="fas fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        } else {
            starsHTML += '<i class="far fa-star"></i>';
        }
    }
    return starsHTML;
}

// Generate features HTML
function generateFeatures(features) {
    const featureIcons = {
        wheelchair: '<i class="fas fa-wheelchair"></i>',
        baby: '<i class="fas fa-baby"></i>',
        free: '<i class="fas fa-dollar-sign"></i>',
        paid: '<i class="fas fa-coins"></i>'
    };
    return features.map(feature => featureIcons[feature] || '').join('');
}

// Render toilet cards
function renderToiletCards(toiletsData = toilets) {
    toiletCardsContainer.innerHTML = toiletsData.map(toilet => `
        <div class="toilet-card">
            <div class="card-header">
                <h2>${toilet.name}</h2>
                <span class="status ${toilet.status.toLowerCase()}">${toilet.status}</span>
            </div>
            
            <div class="rating">
                <span class="rating-number">${toilet.rating}</span>
                <div class="stars">
                    ${generateStars(toilet.rating)}
                </div>
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
    `).join('');
}

// Filter toilets
function filterToilets() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredToilets = toilets.filter(toilet => {
        return toilet.name.toLowerCase().includes(searchTerm) ||
               toilet.address.toLowerCase().includes(searchTerm);
    });
    renderToiletCards(filteredToilets);
}

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
        alert(`
            ${toilet.name}
            Rating: ${toilet.rating}/5 (${toilet.reviews} reviews)
            Cleanliness: ${toilet.cleanliness}
            Features: ${toilet.features.join(', ')}
            Address: ${toilet.address}
        `);
    }
}

// Handle sliders
const ratingSlider = document.getElementById('ratingSlider');
const distanceSlider = document.getElementById('distanceSlider');

function updateSliderValue(slider) {
    const valueDisplay = slider.nextElementSibling;
    if (slider.id === 'ratingSlider') {
        valueDisplay.textContent = slider.value === '0' ? 'Any rating' : `${slider.value}+ stars`;
    } else {
        valueDisplay.textContent = slider.value === '5000' ? 'Any distance' : `Within ${slider.value}m`;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderToiletCards();
    // Hide loading message after 1.5 seconds
    setTimeout(() => {
        loadingMessage.style.display = 'none';
    }, 1500);
});

// Prevent zoom on double tap (mobile)
document.addEventListener('touchend', (e) => {
    e.preventDefault();
    e.target.click();
});
