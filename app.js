// DOM Elements
const menuBtn = document.querySelector('.menu-btn');
const filterBtn = document.querySelector('.filter-btn');
const filtersPanel = document.querySelector('.filters-panel');
const closeFilters = document.querySelector('.close-filters');
const searchInput = document.querySelector('.search-container input');
const loadingMessage = document.querySelector('.loading-message');
const toiletCards = document.querySelector('.toilet-cards');
const applyFiltersBtn = document.querySelector('.apply-filters');
const resetFiltersBtn = document.querySelector('.reset-filters');

// Sample Data
const toilets = [
    {
        id: 1,
        name: "Central Station Restroom",
        distance: "50m",
        rating: 4.5,
        reviews: 128,
        status: "CLOSED",
        cleanliness: 4.8,
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
        cleanliness: 4.5,
        address: "Main Mall, Level 2",
        features: ["wheelchair", "baby", "paid"],
        coordinates: { lat: 51.5075, lng: -0.1276 }
    }
];

// Event Listeners
filterBtn.addEventListener('click', () => {
    filtersPanel.classList.add('active');
});

closeFilters.addEventListener('click', () => {
    filtersPanel.classList.remove('active');
});

// Close filters panel when clicking outside
document.addEventListener('click', (e) => {
    if (!filtersPanel.contains(e.target) && !filterBtn.contains(e.target)) {
        filtersPanel.classList.remove('active');
    }
});

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    filterToilets();
});

// Generate star rating HTML
function generateStars(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            starsHTML += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 <= rating) {
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

    return features.map(feature => featureIcons[feature]).join('');
}

// Render toilet cards
function renderToiletCards(toiletsData = toilets) {
    toiletCards.innerHTML = toiletsData.map(toilet => `
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
                <span>${toilet.cleanliness}/5</span>
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

// Filter toilets based on search and filters
function filterToilets() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedFeatures = Array.from(document.querySelectorAll('.feature-option input:checked'))
        .map(input => input.name);
    const ratingValue = document.querySelector('#ratingSlider').value;
    const distanceValue = document.querySelector('#distanceSlider').value;

    const filteredToilets = toilets.filter(toilet => {
        const matchesSearch = toilet.name.toLowerCase().includes(searchTerm) ||
                            toilet.address.toLowerCase().includes(searchTerm);
        const matchesFeatures = selectedFeatures.length === 0 ||
                              selectedFeatures.every(feature => toilet.features.includes(feature));
        const matchesRating = toilet.rating >= ratingValue;
        const matchesDistance = parseInt(toilet.distance) <= distanceValue;

        return matchesSearch && matchesFeatures && matchesRating && matchesDistance;
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
        // Implement your details modal here
        alert(`Details for ${toilet.name}\nCleanliness: ${toilet.cleanliness}/5\nFeatures: ${toilet.features.join(', ')}`);
    }
}

// Handle filter sliders
const ratingSlider = document.querySelector('#ratingSlider');
const distanceSlider = document.querySelector('#distanceSlider');

function updateSliderValue(slider) {
    const valueDisplay = slider.nextElementSibling;
    if (slider.id === 'ratingSlider') {
        valueDisplay.textContent = slider.value === '0' ? 'Any rating' : `${slider.value}+ stars`;
    } else {
        valueDisplay.textContent = slider.value === '5000' ? 'Any distance' : `Within ${slider.value}m`;
    }
}

ratingSlider?.addEventListener('input', (e) => {
    updateSliderValue(e.target);
    filterToilets();
});

distanceSlider?.addEventListener('input', (e) => {
    updateSliderValue(e.target);
    filterToilets();
});

// Filter actions
applyFiltersBtn.addEventListener('click', () => {
    filterToilets();
    filtersPanel.classList.remove('active');
});

resetFiltersBtn.addEventListener('click', () => {
    // Reset checkboxes
    document.querySelectorAll('.feature-option input').forEach(input => input.checked = false);
    
    // Reset sliders
    if (ratingSlider) ratingSlider.value = 0;
    if (distanceSlider) distanceSlider.value = 5000;
    
    // Update slider displays
    if (ratingSlider) updateSliderValue(ratingSlider);
    if (distanceSlider) updateSliderValue(distanceSlider);
    
    // Reset search
    searchInput.value = '';
    
    // Rerender cards
    renderToiletCards();
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderToiletCards();
    // Hide loading message after 1 second
    setTimeout(() => {
        loadingMessage.style.display = 'none';
    }, 1000);
});