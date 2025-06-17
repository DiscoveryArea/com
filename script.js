// Application State
const APP_STATE = {
    locations: [],
    pendingLocations: [],
    approvedLocations: [],
    isAdminAuthenticated: false,
    map: null,
    selectionMap: null,
    markers: [],
    nextLocationId: 7
};

// Storage Management
const StorageManager = {
    DATA_FILE: 'discoveryAreaData.json',

    async saveState() {
        try {
            const stateToSave = {
                locations: APP_STATE.locations,
                pendingLocations: APP_STATE.pendingLocations,
                approvedLocations: APP_STATE.approvedLocations,
                nextLocationId: APP_STATE.nextLocationId
            };

            // Save to localStorage for automatic persistence
            localStorage.setItem('discoveryAreaState', JSON.stringify(stateToSave));

            Utils.showNotification('Data saved automatically!', 'success');
        } catch (error) {
            console.error('Failed to save state:', error);
            Utils.showNotification('Failed to save data.', 'error');
        }
    },

    async loadState() {
        try {
            // Load from localStorage for automatic persistence
            const savedData = localStorage.getItem('discoveryAreaState');

            if (savedData) {
                const parsedState = JSON.parse(savedData);

                APP_STATE.locations = parsedState.locations || [];
                APP_STATE.pendingLocations = parsedState.pendingLocations || [];
                APP_STATE.approvedLocations = parsedState.approvedLocations || [];
                APP_STATE.nextLocationId = parsedState.nextLocationId || 1;

                console.log('Data loaded from storage successfully');
                return true;
            } else {
                console.log('No saved data found, starting fresh');
                return false;
            }
        } catch (error) {
            console.error('Failed to load state:', error);
            return false;
        }
    },

    async exportToFile() {
        try {
            const stateToSave = {
                locations: APP_STATE.locations,
                pendingLocations: APP_STATE.pendingLocations,
                approvedLocations: APP_STATE.approvedLocations,
                nextLocationId: APP_STATE.nextLocationId
            };

            // Convert the state to a JSON string
            const data = JSON.stringify(stateToSave, null, 2);

            // Use the File System Access API to save the data to a file
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: this.DATA_FILE,
                types: [{
                    description: 'JSON files',
                    accept: { 'application/json': ['.json'] },
                }],
            });

            const writableStream = await fileHandle.createWritable();
            await writableStream.write(data);
            await writableStream.close();

            Utils.showNotification('Data exported to file!', 'success');
        } catch (error) {
            console.error('Failed to export to file:', error);
            Utils.showNotification('Export cancelled or failed.', 'error');
        }
    },

    async importFromFile() {
        try {
            // Use the File System Access API to open a file
            const [fileHandle] = await window.showOpenFilePicker({
                types: [{
                    description: 'JSON files',
                    accept: { 'application/json': ['.json'] },
                }],
            });

            if (fileHandle) {
                const file = await fileHandle.getFile();
                const data = await file.text();

                const parsedState = JSON.parse(data);

                // Load data from file
                APP_STATE.locations = parsedState.locations || [];
                APP_STATE.pendingLocations = parsedState.pendingLocations || [];
                APP_STATE.approvedLocations = parsedState.approvedLocations || [];
                APP_STATE.nextLocationId = parsedState.nextLocationId || 1;

                // Save to localStorage as well
                this.saveState();

                Utils.showNotification('Data imported from file!', 'success');
                return true;
            } else {
                console.log('No file selected');
                return false;
            }
        } catch (error) {
            console.error('Failed to import from file:', error);
            Utils.showNotification('Import cancelled or failed.', 'error');
            return false;
        }
    },

    clearState() {
        // Not applicable for file-based storage
        Utils.showNotification('Clear state is not applicable for file-based storage.', 'info');
    },

    resetToEmpty() {
        APP_STATE.locations = [];
        APP_STATE.pendingLocations = [];
        APP_STATE.approvedLocations = [];
        APP_STATE.nextLocationId = 1;

        this.saveState();
    }
};

// Admin Credentials
const ADMIN_CREDENTIALS = {
    email: 'knight.of.sea.02@gmail.com',
    password: '7001845682@sanjib$ab&ss',
    code: 'ILOVEYOU'
};

// Sample Locations Data
const SAMPLE_LOCATIONS = [];

// DOM Elements
const DOM = {
    searchInput: null,
    filterTabs: null,
    locationsGrid: null,
    submitForm: null,
    navLinks: null,
    hamburger: null,
    navMenu: null,
    adminSection: null,
    modals: {},
    init() {
        this.searchInput = document.getElementById('searchInput');
        this.filterTabs = document.querySelectorAll('.filter-tab');
        this.locationsGrid = document.getElementById('locationsGrid');
        this.submitForm = document.getElementById('submitForm');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.adminSection = document.getElementById('admin');

        // Initialize modals
        this.modals.mapSelection = document.getElementById('mapSelectionModal');
        this.modals.adminLogin = document.getElementById('adminLoginModal');
    }
};

// Utility Functions
const Utils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    },

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            z-index: 10001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-weight: 600;
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation' : 'info'}-circle"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    },

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
};

// Location Management
const LocationManager = {
    async init() {
        // Try to load from storage first
        await StorageManager.loadState();
        this.renderLocations(APP_STATE.locations);
    },

    renderLocations(locations) {
        if (!DOM.locationsGrid) return;

        DOM.locationsGrid.innerHTML = '';

        if (locations.length === 0) {
            DOM.locationsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--gray-500);">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                    <h3>No locations found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }

        locations.forEach(location => {
            const card = this.createLocationCard(location);
            DOM.locationsGrid.appendChild(card);
        });
    },

    createLocationCard(location) {
        const card = document.createElement('div');
        card.className = 'location-card';

        const accessBadgeClass = location.accessType === 'public' ? 'public' : 
                                location.accessType === 'permission' ? 'permission' : 'private';

        const accessBadgeText = location.accessType === 'public' ? 'Public Access' :
                               location.accessType === 'permission' ? 'Permission Required' : 'Private Property';

        // Display first image if available, otherwise show placeholder
        const imageContent = location.images && location.images.length > 0 
            ? `<img src="${location.images[0].url || location.images[0].dataUrl}" alt="${location.name}" style="width: 100%; height: 100%; object-fit: cover;">`
            : `<i class="fas fa-camera"></i>`;

        card.innerHTML = `
            <div class="location-image">
                ${imageContent}
            </div>
            <div class="location-content">
                <div class="location-header">
                    <div>
                        <div class="location-title">${location.name}</div>
                        <div class="location-city">${location.city}</div>
                    </div>
                    <span class="access-badge ${accessBadgeClass}">${accessBadgeText}</span>
                </div>
                <div class="location-features">
                    ${location.features.map(feature => `<span><i class="fas fa-check"></i> ${feature}</span>`).join('')}
                </div>
                <div class="location-description">${location.description}</div>
                <div class="location-actions">
                    <button class="btn btn-primary" onclick="LocationManager.viewLocation(${location.id})">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="btn btn-outline" onclick="LocationManager.getDirections('${location.coordinates}')">
                        <i class="fas fa-directions"></i> Directions
                    </button>
                </div>
            </div>
        `;

        return card;
    },

    viewLocation(locationId) {
        const location = APP_STATE.locations.find(loc => loc.id === locationId);
        if (location) {
            this.showLocationModal(location);
        }
    },

    getDirections(coordinates) {
        // Show location permission message first
        this.showLocationPermissionModal(coordinates);
    },

    showLocationPermissionModal(coordinates) {
        const modal = document.createElement('div');
        modal.className = 'modal show';

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-map-marker-alt"></i> Enable Location Access</h3>
                </div>
                <div class="modal-body" style="text-align: center; padding: 2rem;">
                    <div style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem;">
                        <i class="fas fa-location-arrow"></i>
                    </div>
                    <h4 style="margin-bottom: 1rem;">Location Permission Required</h4>
                    <p style="line-height: 1.6; color: var(--gray-700); margin-bottom: 1.5rem;">
                        Please make sure your location is enabled and you have given access to Google Maps for the best navigation experience.
                    </p>
                    <div style="background: var(--gray-50); padding: 1rem; border-radius: var(--border-radius); margin-bottom: 1.5rem;">
                        <p style="font-size: 0.9rem; color: var(--gray-600); margin: 0;">
                            <i class="fas fa-info-circle"></i> 
                            This will redirect you to Google Maps with the destination coordinates pre-filled.
                        </p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="LocationManager.proceedToDirections('${coordinates}'); this.closest('.modal').remove();" class="btn btn-primary">
                        <i class="fas fa-check"></i> OK, Take Me There
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Auto-remove modal if clicked outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    },

    proceedToDirections(coordinates) {
        const [lat, lng] = coordinates.split(',').map(coord => coord.trim());
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        window.open(url, '_blank');
    },

    showLocationModal(location) {
        const modal = document.createElement('div');
        modal.className = 'modal show';

        // Create image gallery or placeholder
        const imageGallery = location.images && location.images.length > 0 
            ? `<div class="image-gallery" style="margin-bottom: 1.5rem;">
                 <div class="main-image" style="height: 300px; border-radius: var(--border-radius); overflow: hidden; margin-bottom: 1rem;">
                   <img src="${location.images[0].url || location.images[0].dataUrl}" alt="${location.name}" style="width: 100%; height: 100%; object-fit: cover;">
                 </div>
                 ${location.images.length > 1 ? `
                   <div class="thumbnail-gallery" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                     ${location.images.slice(1, 4).map((img, index) => `
                       <img src="${img.url || img.dataUrl}" alt="${location.name} ${index + 2}" 
                            style="width: 80px; height: 80px; object-fit: cover; border-radius: var(--border-radius-sm); cursor: pointer;"
                            onclick="this.closest('.modal').querySelector('.main-image img').src = '${img.url || img.dataUrl}'">
                     `).join('')}
                     ${location.images.length > 4 ? `<div style="width: 80px; height: 80px; background: var(--gray-200); border-radius: var(--border-radius-sm); display: flex; align-items: center; justify-content: center; color: var(--gray-600); font-weight: 600;">+${location.images.length - 4}</div>` : ''}
                   </div>
                 ` : ''}
               </div>`
            : `<div style="height: 200px; background: var(--gradient-primary); border-radius: var(--border-radius); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem; margin-bottom: 1.5rem;">
                 <i class="fas fa-camera"></i>
               </div>`;

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${location.name}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${imageGallery}
                    <p style="color: var(--gray-600); margin-bottom: 1rem;">${location.city}</p>
                    <div style="margin-bottom: 1rem;">
                        <span class="access-badge ${location.accessType}">${location.accessType === 'public' ? 'Public Access' : location.accessType === 'permission' ? 'Permission Required' : 'Private Property'}</span>
                    </div>
                    <p style="margin-bottom: 1rem;"><strong>Best Time:</strong> ${location.bestTime}</p>
                    <p style="margin-bottom: 1.5rem; line-height: 1.6;">${location.description}</p>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem;">
                        ${location.features.map(feature => `
                            <span style="background: var(--gray-100); padding: 0.25rem 0.5rem; border-radius: 20px; font-size: 0.9rem;">
                                <i class="fas fa-check" style="color: var(--success); margin-right: 0.25rem;"></i>
                                ${feature}
                            </span>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="LocationManager.getDirections('${location.coordinates}')" class="btn btn-primary">
                        <i class="fas fa-directions"></i> Get Directions
                    </button>
                    <button onclick="LocationManager.shareLocation(${location.id})" class="btn btn-outline">
                        <i class="fas fa-share"></i> Share
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    },

    shareLocation(locationId) {
        const location = APP_STATE.locations.find(loc => loc.id === locationId);
        if (navigator.share) {
            navigator.share({
                title: `${location.name} - Discovery Area`,
                text: `Check out this amazing photoshoot location: ${location.name} in ${location.city}`,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => {
                Utils.showNotification('Location link copied to clipboard!', 'success');
            });
        }
    },

    filterLocations(searchTerm, filterType) {
        let filtered = APP_STATE.locations.filter(location => {
            const matchesSearch = !searchTerm || 
                                 location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 location.description.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFilter = filterType === 'all' || 
                                 location.category === filterType ||
                                 (filterType === 'free' && location.accessType === 'public') ||
                                 (filterType === 'trending' && location.id <= 3);

            return matchesSearch && matchesFilter;
        });

        this.renderLocations(filtered);
        MapManager.filterMarkers(filtered);
    }
};

// Search and Filter Management
const SearchManager = {
    init() {
        if (DOM.searchInput) {
            DOM.searchInput.addEventListener('input', Utils.debounce(this.handleSearch.bind(this), 300));
        }

        DOM.filterTabs.forEach(tab => {
            tab.addEventListener('click', this.handleFilter.bind(this));
        });
    },

    handleSearch(event) {
        const searchTerm = event.target.value;
        const activeFilter = document.querySelector('.filter-tab.active').dataset.filter;
        LocationManager.filterLocations(searchTerm, activeFilter);
    },

    handleFilter(event) {
        DOM.filterTabs.forEach(tab => tab.classList.remove('active'));
        event.target.classList.add('active');

        const filterType = event.target.dataset.filter;
        const searchTerm = DOM.searchInput ? DOM.searchInput.value : '';
        LocationManager.filterLocations(searchTerm, filterType);
    }
};

// Map Management
const MapManager = {
    init() {
        this.initMainMap();
        this.initMapSelection();
    },

    initMainMap() {
        const mapElement = document.getElementById('map');
        if (!mapElement) return;

        APP_STATE.map = L.map('map').setView([20.5937, 78.9629], 5);

        // Base layers
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        });

        const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        });

        // Labels overlay for satellite view - comprehensive labels with place names and boundaries
        const labelsLayer = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places_Alternate/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; Esri',
            opacity: 0.8
        });

        // Additional comprehensive labels layer
        const transportationLayer = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; Esri',
            opacity: 0.7
        });

        // Create layer groups with comprehensive labeling
        const satelliteWithLabels = L.layerGroup([satelliteLayer, labelsLayer, transportationLayer]);

        // Add default layer (satellite with labels)
        satelliteWithLabels.addTo(APP_STATE.map);

        // Layer control
        const baseLayers = {
            "Satellite with Labels": satelliteWithLabels,
            "Street Map": streetLayer,
            "Satellite Only": satelliteLayer
        };

        L.control.layers(baseLayers).addTo(APP_STATE.map);

        this.addMarkersToMap(APP_STATE.locations);
    },

    addMarkersToMap(locations) {
        if (!APP_STATE.map) return;

        // Clear existing markers
        APP_STATE.markers.forEach(marker => APP_STATE.map.removeLayer(marker));
        APP_STATE.markers = [];

        locations.forEach(location => {
            const [lat, lng] = location.coordinates.split(',').map(coord => parseFloat(coord.trim()));

            const markerColor = location.accessType === 'public' ? '#10b981' : 
                               location.accessType === 'permission' ? '#f59e0b' : '#ef4444';

            const marker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })
            }).addTo(APP_STATE.map);

            marker.bindPopup(this.createPopupContent(location));
            APP_STATE.markers.push(marker);
        });
    },

    createPopupContent(location) {
        return `
            <div style="min-width: 250px;">
                <h3 style="margin-bottom: 0.5rem;">${location.name}</h3>
                <p style="margin-bottom: 0.5rem; color: var(--gray-600);">${location.city}</p>
                <p style="margin-bottom: 1rem; font-size: 0.9rem;">${location.description}</p>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="LocationManager.viewLocation(${location.id})" style="flex: 1; background: var(--primary); color: white; border: none; padding: 0.5rem; border-radius: 0.375rem; cursor: pointer;">
                        View Details
                    </button>
                    <button onclick="LocationManager.getDirections('${location.coordinates}')" style="flex: 1; background: transparent; color: var(--primary); border: 1px solid var(--primary); padding: 0.5rem; border-radius: 0.375rem; cursor: pointer;">
                        Directions
                    </button>
                </div>
            </div>
        `;
    },

    filterMarkers(filteredLocations) {
        this.addMarkersToMap(filteredLocations);
    },

    initMapSelection() {
        const mapSelectorBtn = document.getElementById('openMapSelector');
        const mapModal = DOM.modals.mapSelection;
        const closeBtn = document.getElementById('closeMapSelector');
        const cancelBtn = document.getElementById('cancelSelection');
        const confirmBtn = document.getElementById('confirmSelection');

        if (!mapSelectorBtn || !mapModal) return;

        let selectedMarker;
        let selectedCoords;

        mapSelectorBtn.addEventListener('click', () => {
            mapModal.classList.add('show');

            setTimeout(() => {
                if (!APP_STATE.selectionMap) {
                    APP_STATE.selectionMap = L.map('selectionMap').setView([20.5937, 78.9629], 5);

                    // Add satellite layer
                    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                        attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    }).addTo(APP_STATE.selectionMap);

                    // Add labels overlay
                    L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
                        attribution: '&copy; Esri'
                    }).addTo(APP_STATE.selectionMap);

                    APP_STATE.selectionMap.on('click', (e) => {
                        const { lat, lng } = e.latlng;

                        if (selectedMarker) {
                            APP_STATE.selectionMap.removeLayer(selectedMarker);
                        }

                        selectedMarker = L.marker([lat, lng], {
                            icon: L.divIcon({
                                className: 'selection-marker',
                                html: '<div style="background: var(--primary); width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);"></div>',
                                iconSize: [20, 20],
                                iconAnchor: [10, 10]
                            })
                        }).addTo(APP_STATE.selectionMap);

                        selectedCoords = { lat, lng };

                        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                            .then(response => response.json())
                            .then(data => {
                                const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || 'Unknown City';
                                document.getElementById('selectedLocationText').textContent = 
                                    `${lat.toFixed(6)}, ${lng.toFixed(6)} (${city})`;
                                confirmBtn.disabled = false;
                            })
                            .catch(() => {
                                document.getElementById('selectedLocationText').textContent = 
                                    `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                                confirmBtn.disabled = false;
                            });
                    });
                } else {
                    APP_STATE.selectionMap.invalidateSize();
                }
            }, 100);
        });

        [closeBtn, cancelBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    mapModal.classList.remove('show');
                });
            }
        });

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                if (selectedCoords) {
                    const coordsString = `${selectedCoords.lat.toFixed(6)}, ${selectedCoords.lng.toFixed(6)}`;
                    document.getElementById('coordinates').value = coordsString;

                    const locationText = document.getElementById('selectedLocationText').textContent;
                    const cityMatch = locationText.match(/\((.*?)\)/);
                    if (cityMatch) {
                        document.getElementById('city').value = cityMatch[1];
                    }

                    mapSelectorBtn.innerHTML = `
                        <i class="fas fa-check"></i>
                        <span>Location Selected</span>
                    `;
                    mapSelectorBtn.style.background = 'var(--success)';

                    mapModal.classList.remove('show');
                }
            });
        }

        mapModal.addEventListener('click', (e) => {
            if (e.target === mapModal) {
                mapModal.classList.remove('show');
            }
        });
    }
};

// Form Management
const FormManager = {
    init() {
        if (DOM.submitForm) {
            DOM.submitForm.addEventListener('submit', this.handleSubmit.bind(this));
        }

        const fileInput = document.getElementById('photos');
        if (fileInput) {
            fileInput.addEventListener('change', this.handleFileChange.bind(this));
        }

        const fileUploadArea = document.querySelector('.file-upload-area');
        if (fileUploadArea) {
            fileUploadArea.addEventListener('click', () => fileInput.click());
            fileUploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
            fileUploadArea.addEventListener('drop', this.handleFileDrop.bind(this));
        }
    },

    async handleSubmit(event) {
        event.preventDefault();

        // Get the submit button and show loading state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            Processing...
        `;

        try {
            const formData = new FormData(DOM.submitForm);
            const files = document.getElementById('photos').files;

            // Validate required fields first
            const locationName = document.getElementById('locationName').value.trim();
            const coordinates = document.getElementById('coordinates').value.trim();
            const description = document.getElementById('description').value.trim();

            if (!locationName || !coordinates || !description) {
                Utils.showNotification('Please fill in all required fields', 'error');
                return;
            }

            // Handle file uploads if any
            let uploadedImages = [];
            if (files.length > 0) {
                submitBtn.innerHTML = `
                    <i class="fas fa-spinner fa-spin"></i>
                    Uploading images...
                `;

                // Process images and convert to base64
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];

                    // Validate file size (10MB limit)
                    if (file.size > 10 * 1024 * 1024) {
                        Utils.showNotification(`File ${file.name} is too large. Maximum size is 10MB.`, 'error');
                        return;
                    }

                    // Validate file type
                    if (!file.type.startsWith('image/')) {
                        Utils.showNotification(`File ${file.name} is not a valid image.`, 'error');
                        return;
                    }

                    // Convert to base64
                    const dataUrl = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target.result);
                        reader.readAsDataURL(file);
                    });

                    // Simulate upload delay
                    await new Promise(resolve => setTimeout(resolve, 300));

                    // Store file info with base64 data
                    uploadedImages.push({
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        lastModified: file.lastModified,
                        dataUrl: dataUrl
                    });
                }

                Utils.showNotification(`Successfully uploaded ${files.length} image(s)!`, 'success');
            }

            // Create location data
            const locationData = {
                id: APP_STATE.nextLocationId++,
                name: locationName,
                city: document.getElementById('city').value || 'Unknown City',
                coordinates: coordinates,
                bestTime: document.getElementById('bestTime').value || 'Golden Hour',
                category: document.getElementById('category').value || 'nature',
                accessType: document.getElementById('accessType').value || 'public',
                description: description,
                submitterName: document.getElementById('submitterName').value.trim() || 'Anonymous',
                submittedAt: new Date().toISOString(),
                status: 'pending',
                features: ['User Submitted'],
                images: uploadedImages
            };

            // Add to pending locations
            APP_STATE.pendingLocations.push(locationData);

            // Save state to persistent storage
            await StorageManager.saveState();

            // Update admin panel if it's visible
            if (APP_STATE.isAdminAuthenticated && DOM.adminSection.style.display !== 'none') {
                AdminManager.updatePendingCount();
                AdminManager.renderPendingLocations();
            }

            Utils.showNotification('Location submitted successfully! It\'s now pending admin approval.', 'success');

            // Reset form
            DOM.submitForm.reset();
            this.resetFileUpload();

            // Reset map selector button
            const mapSelectorBtn = document.getElementById('openMapSelector');
            if (mapSelectorBtn) {
                mapSelectorBtn.innerHTML = `
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Click to Select Location</span>
                `;
                mapSelectorBtn.style.background = '';
            }

        } catch (error) {
            console.error('Error submitting location:', error);
            Utils.showNotification('Failed to submit location. Please try again.', 'error');
        } finally {
            // Reset submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
        }
    },

    handleFileChange(event) {
        const files = event.target.files;
        this.updateFileUploadText(files);
    },

    handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.style.borderColor = 'var(--primary)';
    },

    handleFileDrop(event) {
        event.preventDefault();
        const files = event.dataTransfer.files;
        document.getElementById('photos').files = files;
        this.updateFileUploadText(files);
        event.currentTarget.style.borderColor = 'var(--gray-300)';
    },

    updateFileUploadText(files) {
        const uploadContent = document.querySelector('.upload-content span');
        if (uploadContent) {
            if (files.length > 0) {
                uploadContent.textContent = `${files.length} file(s) selected`;
                uploadContent.style.color = 'var(--success)';
            } else {
                uploadContent.textContent = 'Drag & drop photos or click to browse';
                uploadContent.style.color = '';
            }
        }
    },

    resetFileUpload() {
        const fileInput = document.getElementById('photos');
        const uploadContent = document.querySelector('.upload-content span');

        if (fileInput) {
            fileInput.value = '';
        }

        if (uploadContent) {
            uploadContent.textContent = 'Drag & drop photos or click to browse';
            uploadContent.style.color = '';
        }
    }
};

// Admin Management
const AdminManager = {
    init() {
        const adminTriggers = document.querySelectorAll('.admin-login-trigger');
        adminTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                APP_STATE.isAdminAuthenticated ? this.showAdminPanel() : this.showAdminLogin();
            });
        });

        this.initAdminModal();
    },

    initAdminModal() {
        const modal = DOM.modals.adminLogin;
        const loginBtn = document.getElementById('adminLoginBtn');
        const closeBtn = document.getElementById('closeAdminLogin');
        const cancelBtn = document.getElementById('cancelAdminLogin');
        const loginForm = document.getElementById('adminLoginForm');

        if (loginBtn) {
            loginBtn.addEventListener('click', this.authenticateAdmin.bind(this));
        }

        [closeBtn, cancelBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    modal.classList.remove('show');
                });
            }
        });

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.authenticateAdmin();
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        }
       },

    showAdminLogin() {
        const modal = DOM.modals.adminLogin;
        if (modal) {
            modal.classList.add('show');

            // Clear form
            ['adminEmail', 'adminPassword', 'adminCode'].forEach(id => {
                const field = document.getElementById(id);
                if (field) field.value = '';
            });

            // Hide error
            const errorDiv = document.getElementById('loginError');
            if (errorDiv) {
                errorDiv.classList.remove('show');
            }

            // Focus on email field
            setTimeout(() => {
                const emailField = document.getElementById('adminEmail');
                if (emailField) emailField.focus();
            }, 100);
        }
    },

    authenticateAdmin() {
        const email = document.getElementById('adminEmail')?.value.trim();
        const password = document.getElementById('adminPassword')?.value;
        const code = document.getElementById('adminCode')?.value.trim();
        const errorDiv = document.getElementById('loginError');

        if (!email || !password || !code) {
            Utils.showNotification('All fields are required', 'error');
            return;
        }

        if (email === ADMIN_CREDENTIALS.email && 
            password === ADMIN_CREDENTIALS.password && 
            code === ADMIN_CREDENTIALS.code) {

            APP_STATE.isAdminAuthenticated = true;
            DOM.modals.adminLogin.classList.remove('show');
            Utils.showNotification('✅ Admin access granted!', 'success');
            this.showAdminPanel();
        } else {
            if (errorDiv) {
                errorDiv.classList.add('show');
            }
            Utils.showNotification('❌ Invalid credentials', 'error');
            const passwordField = document.getElementById('adminPassword');
            if (passwordField) passwordField.value = '';
        }
    },

    showAdminPanel() {
        if (DOM.adminSection) {
            DOM.adminSection.style.display = 'block';
            DOM.adminSection.scrollIntoView({ behavior: 'smooth' });
            this.updatePendingCount();
            this.renderPendingLocations();
            this.renderApprovedLocations();
        }
    },

    updatePendingCount() {
        const countElement = document.getElementById('pendingCount');
        if (countElement) {
            countElement.textContent = APP_STATE.pendingLocations.length;
        }

        const approvedCountElement = document.getElementById('approvedCount');
        if (approvedCountElement) {
            approvedCountElement.textContent = APP_STATE.approvedLocations.length;
        }
    },

    renderPendingLocations() {
        const pendingGrid = document.getElementById('pendingGrid');
        if (!pendingGrid) return;

        if (APP_STATE.pendingLocations.length === 0) {
            pendingGrid.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--gray-500);">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                    <h3>No pending submissions</h3>
                    <p>All caught up! New location submissions will appear here.</p>
                </div>
            `;
            return;
        }

        pendingGrid.innerHTML = '';
        APP_STATE.pendingLocations.forEach(location => {
            const card = this.createPendingCard(location);
            pendingGrid.appendChild(card);
        });
    },

    createPendingCard(location) {
        const card = document.createElement('div');
        card.className = 'pending-card';

        const submittedDate = new Date(location.submittedAt).toLocaleDateString();
        const imageCount = location.images ? location.images.length : 0;

        // Create image preview if images exist
        const imagePreview = location.images && location.images.length > 0 
            ? `<div class="admin-image-preview" style="margin-bottom: 1rem;">
                 <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                   ${location.images.slice(0, 3).map(img => `
                     <img src="${img.dataUrl || img.url}" alt="Preview" 
                          style="width: 80px; height: 80px; object-fit: cover; border-radius: var(--border-radius-sm); cursor: pointer;"
                          onclick="AdminManager.showImageModal('${img.dataUrl || img.url}', '${location.name}')">
                   `).join('')}
                   ${location.images.length > 3 ? `<div style="width: 80px; height: 80px; background: var(--gray-200); border-radius: var(--border-radius-sm); display: flex; align-items: center; justify-content: center; color: var(--gray-600); font-weight: 600; cursor: pointer;" onclick="AdminManager.showAllImages(${location.id})">+${location.images.length - 3}</div>` : ''}
                 </div>
               </div>`
            : '';

        card.innerHTML = `
            <h4>${location.name}</h4>
            <div class="location-meta">
                📍 ${location.city} • 🕐 ${location.bestTime} • 👤 ${location.submitterName}
                <br>📅 Submitted: ${submittedDate} ${imageCount > 0 ? `• 📸 ${imageCount} image(s)` : ''}
            </div>
            ${imagePreview}
            <div class="location-description">${location.description}</div>
            <div class="location-meta">
                <strong>Coordinates:</strong> ${location.coordinates}<br>
                <strong>Category:</strong> ${location.category} • <strong>Access:</strong> ${location.accessType}
            </div>
            <div class="approval-actions">
                <button class="approve-btn" onclick="AdminManager.approveLocation(${location.id})">
                    <i class="fas fa-check"></i> Approve
                </button>
                <button class="reject-btn" onclick="AdminManager.rejectLocation(${location.id})">
                    <i class="fas fa-times"></i> Reject
                </button>
                <button class="delete-btn" onclick="AdminManager.deleteLocation(${location.id}, 'pending')" style="background: var(--danger); color: white; border: none; padding: 0.5rem 1rem; border-radius: var(--border-radius); cursor: pointer; margin-left: 0.5rem;">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;

        return card;
    },

    async approveLocation(locationId) {
        const locationIndex = APP_STATE.pendingLocations.findIndex(loc => loc.id === locationId);
        if (locationIndex === -1) return;

        const location = APP_STATE.pendingLocations[locationIndex];

        // Remove from pending
        APP_STATE.pendingLocations.splice(locationIndex, 1);

        // Add to approved and main locations
        location.status = 'approved';
        location.approvedAt = new Date().toISOString();
        APP_STATE.approvedLocations.unshift(location);
        APP_STATE.locations.push(location);

        // Save state to persistent storage (data.json file)
        await StorageManager.saveState();

        // Update UI
        this.updatePendingCount();
        this.renderPendingLocations();
        this.renderApprovedLocations();
        LocationManager.renderLocations(APP_STATE.locations);
        MapManager.addMarkersToMap(APP_STATE.locations);

        Utils.showNotification(`✅ Location "${location.name}" has been approved and is now live!`, 'success');
    },

    async rejectLocation(locationId) {
        const locationIndex = APP_STATE.pendingLocations.findIndex(loc => loc.id === locationId);
        if (locationIndex === -1) return;

        const location = APP_STATE.pendingLocations[locationIndex];
        APP_STATE.pendingLocations.splice(locationIndex, 1);

        // Save state to persistent storage (data.json file)
        await StorageManager.saveState();

        this.updatePendingCount();
        this.renderPendingLocations();

        Utils.showNotification(`❌ Location "${location.name}" has been rejected.`, 'error');
    },

    renderApprovedLocations() {
        const approvedGrid = document.getElementById('approvedGrid');
        if (!approvedGrid) return;

        if (APP_STATE.approvedLocations.length === 0) {
            approvedGrid.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--gray-500);">
                    <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 1rem; display: block; color: var(--success);"></i>
                    <h3>No approved locations yet</h3>
                    <p>Approved locations will appear here.</p>
                </div>
            `;
            return;
        }

        approvedGrid.innerHTML = '';
        APP_STATE.approvedLocations.slice(0, 6).forEach(location => {
            const card = this.createApprovedCard(location);
            approvedGrid.appendChild(card);
        });
    },

    showImageModal(imageSrc, locationName) {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3>Image Preview - ${locationName}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" style="text-align: center;">
                    <img src="${imageSrc}" alt="Location Image" style="max-width: 100%; max-height: 70vh; border-radius: var(--border-radius);">
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    },

    showAllImages(locationId) {
        // Look for location in both pending and approved arrays
        let location = APP_STATE.pendingLocations.find(loc => loc.id === locationId) ||
                      APP_STATE.approvedLocations.find(loc => loc.id === locationId);

        if (!location || !location.images) return;

        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px;">
                <div class="modal-header">
                    <h3>All Images - ${location.name}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        ${location.images.map((img, index) => `
                            <div style="text-align: center;">
                                <img src="${img.dataUrl || img.url}" alt="Image ${index + 1}" 
                                     style="width: 100%; height: 150px; object-fit: cover; border-radius: var(--border-radius); cursor: pointer;"
                                     onclick="AdminManager.showImageModal('${img.dataUrl || img.url}', '${location.name}')">
                                <p style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--gray-600);">${img.name}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    },

    createApprovedCard(location) {
        const card = document.createElement('div');
        card.className = 'approved-card';

        const approvedDate = new Date(location.approvedAt).toLocaleDateString();
        const imageCount = location.images ? location.images.length : 0;

        // Create image preview if images exist
        const imagePreview = location.images && location.images.length > 0 
            ? `<div class="admin-image-preview" style="margin-bottom: 1rem;">
                 <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                   ${location.images.slice(0, 3).map(img => `
                     <img src="${img.dataUrl || img.url}" alt="Preview" 
                          style="width: 60px; height: 60px; object-fit: cover; border-radius: var(--border-radius-sm); cursor: pointer;"
                          onclick="AdminManager.showImageModal('${img.dataUrl || img.url}', '${location.name}')">
                   `).join('')}
                   ${location.images.length > 3 ? `<div style="width: 60px; height: 60px; background: var(--gray-200); border-radius: var(--border-radius-sm); display: flex; align-items: center; justify-content: center; color: var(--gray-600); font-weight: 600; font-size: 0.8rem; cursor: pointer;" onclick="AdminManager.showAllImages(${location.id})">+${location.images.length - 3}</div>` : ''}
                 </div>
               </div>`
            : '';

        card.innerHTML = `
            <h4>${location.name} ✅</h4>
            <div class="location-meta">
                📍 ${location.city} • 🕐 ${location.bestTime} • 👤 ${location.submitterName || 'Admin'}
                <br>✅ Approved: ${approvedDate} ${imageCount > 0 ? `• 📸 ${imageCount} image(s)` : ''}
            </div>
            ${imagePreview}
            <div class="location-description">${location.description}</div>
            <div class="location-meta">
                <strong>Coordinates:</strong> ${location.coordinates}<br>
                <strong>Category:</strong> ${location.category} • <strong>Access:</strong> ${location.accessType}<br>
                <strong>Status:</strong> Live on website
            </div>
            <div class="admin-actions" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--gray-200);">
                <button class="delete-btn" onclick="AdminManager.deleteLocation(${location.id}, 'approved')" style="background: var(--danger); color: white; border: none; padding: 0.5rem 1rem; border-radius: var(--border-radius); cursor: pointer; font-size: 0.9rem; transition: var(--transition);">
                    <i class="fas fa-trash"></i> Delete from Website
                </button>
            </div>
        `;

        return card;
    },

    async deleteLocation(locationId, source) {
        // Find location in the appropriate array
        let location = null;
        if (source === 'approved') {
            location = APP_STATE.approvedLocations.find(loc => loc.id === locationId) || 
                      APP_STATE.locations.find(loc => loc.id === locationId);
        } else if (source === 'pending') {
            location = APP_STATE.pendingLocations.find(loc => loc.id === locationId);
        }

        if (!location) {
            Utils.showNotification('Location not found.', 'error');
            return;
        }

        const locationName = location.name;
        const statusText = source === 'approved' ? 'approved location from the website' : 'pending location';

        const confirmed = confirm(`Are you sure you want to delete "${locationName}"?\n\nThis will permanently remove this ${statusText}. This action cannot be undone.`);
        if (!confirmed) return;

        if (source === 'approved') {
            // Remove from approved locations array
            const approvedIndex = APP_STATE.approvedLocations.findIndex(loc => loc.id === locationId);
            if (approvedIndex !== -1) {
                APP_STATE.approvedLocations.splice(approvedIndex, 1);
            }

            // Remove from main locations array (live locations)
            const mainIndex = APP_STATE.locations.findIndex(loc => loc.id === locationId);
            if (mainIndex !== -1) {
                APP_STATE.locations.splice(mainIndex, 1);
            }

            // Update main locations display and map immediately
            LocationManager.renderLocations(APP_STATE.locations);
            MapManager.addMarkersToMap(APP_STATE.locations);

            Utils.showNotification(`🗑️ Location "${locationName}" has been deleted from the website.`, 'success');
        } else if (source === 'pending') {
            // Remove from pending locations array
            const pendingIndex = APP_STATE.pendingLocations.findIndex(loc => loc.id === locationId);
            if (pendingIndex !== -1) {
                APP_STATE.pendingLocations.splice(pendingIndex, 1);
            }

            Utils.showNotification(`🗑️ Pending location "${locationName}" has been deleted.`, 'success');
        }

        // Save state to persistent storage (data.json file)
        await StorageManager.saveState();

        // Update admin panel counters and displays
        this.updatePendingCount();
        this.renderPendingLocations();
        this.renderApprovedLocations();
    },

    bulkDeleteConfirm() {
        const confirmed = confirm(`Are you sure you want to delete ALL live locations from the website?\n\nThis action cannot be undone. All location data will be permanently lost.`);
        if (confirmed) {
            this.bulkDeleteLocations();
        }
    },

    bulkDeleteLocations() {
        // Clear all locations
        APP_STATE.locations = [];
        APP_STATE.approvedLocations = [];

        // Save the empty state
        StorageManager.saveState();

        // Update the UI
        LocationManager.renderLocations(APP_STATE.locations);
        MapManager.addMarkersToMap(APP_STATE.locations);
        this.renderApprovedLocations();
        this.updatePendingCount();

        Utils.showNotification('🗑️ All live locations have been deleted from the website.', 'success');
    },

    showAllLiveLocations() {
        LocationManager.renderLocations(APP_STATE.locations);
        Utils.showNotification(`Displaying all ${APP_STATE.locations.length} live locations.`, 'info');
    },

    downloadBackup() {
        const dataStr = JSON.stringify(APP_STATE, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const exportFileDefaultName = 'discoveryAreaDataBackup.json';

        let linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);

        Utils.showNotification('Backup downloaded!', 'success');
    },

    showRestoreDialog() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';

        fileInput.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const restoredState = JSON.parse(e.target.result);
                        APP_STATE.locations = restoredState.locations || [];
                        APP_STATE.pendingLocations = restoredState.pendingLocations || [];
                        APP_STATE.approvedLocations = restoredState.approvedLocations || [];
                        APP_STATE.nextLocationId = restoredState.nextLocationId || 1;

                        LocationManager.renderLocations(APP_STATE.locations);
                        MapManager.addMarkersToMap(APP_STATE.locations);
                        this.renderPendingLocations();
                        this.renderApprovedLocations();
                        this.updatePendingCount();

                        Utils.showNotification('Data restored from backup!', 'success');
                    } catch (error) {
                        console.error('Failed to restore data:', error);
                        Utils.showNotification('Failed to restore data. Invalid file format.', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };

        fileInput.click();
    },

    saveCurrentData() {
        StorageManager.saveState();
    }
};

// Navigation Management
const NavigationManager = {
    init() {
        // Smooth scrolling for navigation links
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href && href.startsWith('#') && href.length > 1) {
                    Utils.scrollToSection(href.substring(1));
                }
            });
        });

        // Hero buttons
        const heroButtons = document.querySelectorAll('[data-scroll]');
        heroButtons.forEach(button => {
            button.addEventListener('click', () => {
                const target = button.getAttribute('data-scroll');
                Utils.scrollToSection(target);
            });
        });

        // Mobile menu
        if (DOM.hamburger && DOM.navMenu) {
            DOM.hamburger.addEventListener('click', () => {
                DOM.navMenu.classList.toggle('active');
                DOM.hamburger.classList.toggle('active');
            });

            // Close mobile menu when clicking on nav links
            DOM.navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    DOM.navMenu.classList.remove('active');
                    DOM.hamburger.classList.remove('active');
                });
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!DOM.hamburger.contains(e.target) && !DOM.navMenu.contains(e.target)) {
                    DOM.navMenu.classList.remove('active');
                    DOM.hamburger.classList.remove('active');
                }
            });
        }

        // Newsletter subscription
        const newsletterForm = document.querySelector('.newsletter-form');
        if (newsletterForm) {
            const input = newsletterForm.querySelector('input');
            const button = newsletterForm.querySelector('button');

            if (button) {
                button.addEventListener('click', () => {
                    const email = input.value.trim();
                    if (!email) {
                        Utils.showNotification('Please enter your email address', 'error');
                        return;
                    }
                    if (!Utils.isValidEmail(email)) {
                        Utils.showNotification('Please enter a valid email address', 'error');
                        return;
                    }
                    Utils.showNotification('Thank you for subscribing!', 'success');
                    input.value = '';
                });
            }
        }

        // Contact photographer buttons
        const contactButtons = document.querySelectorAll('.contact-btn');
        contactButtons.forEach((button, index) => {
            const photographerNames = ['Arjun Photography', 'Nature Frames Studio', 'Candid Captures'];
            button.addEventListener('click', () => {
                Utils.showNotification(`Contact form for ${photographerNames[index]} would open here. Feature coming soon!`, 'info');
            });
        });
    }
};

// Application Initialization
const App = {
    async init() {
        // Initialize DOM references
        DOM.init();

        // Force reset if old sample data exists
        const hasOldSampleData = APP_STATE.locations.some(loc => 
            ['Lodhi Garden', 'Gateway of India', 'Hawa Mahal', 'Munnar Tea Gardens', 'City Palace', 'Marine Drive'].includes(loc.name)
        );

        if (hasOldSampleData) {
            console.log('Detected old sample data, clearing...');
            StorageManager.resetToEmpty();
        }

        // Initialize all managers
        await LocationManager.init();
        SearchManager.init();
        MapManager.init();
        FormManager.init();
        AdminManager.init();
        NavigationManager.init();

        // Initialize animations
        this.initAnimations();

        console.log('Discovery Area App initialized successfully');
    },

    initAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        const animatedElements = document.querySelectorAll('.location-card, .photographer-card, .submit-form');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
};

// Global functions for onclick handlers
window.scrollToSection = Utils.scrollToSection;
window.LocationManager = LocationManager;
window.AdminManager = AdminManager;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await App.init();
});

// Export for external access if needed
window.DiscoveryArea = App;
