
// Data Persistence Manager for Discovery Area
class DataPersistenceManager {
    constructor() {
        this.dataFile = 'data.json';
        this.initialized = false;
    }

    // Initialize data manager and load existing data
    init() {
        this.loadData().then(() => {
            this.initialized = true;
            console.log('Data persistence manager initialized successfully');
        }).catch((error) => {
            console.error('Failed to initialize data manager:', error);
            // If loading fails, initialize with empty data
            this.initializeEmptyData();
        });
    }

    // Load data from JSON file
    async loadData() {
        try {
            const response = await fetch(this.dataFile);
            
            if (response.ok) {
                const data = await response.json();
                
                // Update APP_STATE with loaded data
                APP_STATE.locations = data.locations || [];
                APP_STATE.pendingLocations = data.pendingLocations || [];
                APP_STATE.approvedLocations = data.approvedLocations || [];
                APP_STATE.nextLocationId = data.nextLocationId || 1;
                
                console.log(`Loaded ${APP_STATE.locations.length} locations from persistent storage`);
                return true;
            } else {
                console.log('No existing data file found, starting with empty data');
                this.initializeEmptyData();
                return false;
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.initializeEmptyData();
            return false;
        }
    }

    // Save current app state to JSON file
    async saveData() {
        if (!this.initialized) {
            console.warn('Data manager not initialized, skipping save');
            return false;
        }

        try {
            const dataToSave = {
                locations: APP_STATE.locations,
                pendingLocations: APP_STATE.pendingLocations,
                approvedLocations: APP_STATE.approvedLocations,
                nextLocationId: APP_STATE.nextLocationId,
                lastUpdated: new Date().toISOString()
            };

            // Create a downloadable blob and trigger download
            const blob = new Blob([JSON.stringify(dataToSave, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = this.dataFile;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('Data saved successfully');
            
            // Also save to localStorage as backup
            localStorage.setItem('discoveryAreaBackup', JSON.stringify(dataToSave));
            
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    // Initialize with empty data structure
    initializeEmptyData() {
        APP_STATE.locations = [];
        APP_STATE.pendingLocations = [];
        APP_STATE.approvedLocations = [];
        APP_STATE.nextLocationId = 1;
        this.initialized = true;
    }

    // Auto-save functionality
    enableAutoSave(intervalMinutes = 5) {
        setInterval(() => {
            if (this.hasUnsavedChanges()) {
                this.saveData();
            }
        }, intervalMinutes * 60 * 1000);
    }

    // Check if there are unsaved changes
    hasUnsavedChanges() {
        const currentData = {
            locations: APP_STATE.locations,
            pendingLocations: APP_STATE.pendingLocations,
            approvedLocations: APP_STATE.approvedLocations,
            nextLocationId: APP_STATE.nextLocationId
        };

        const lastSaved = localStorage.getItem('discoveryAreaBackup');
        if (!lastSaved) return true;

        try {
            const savedData = JSON.parse(lastSaved);
            return JSON.stringify(currentData) !== JSON.stringify({
                locations: savedData.locations,
                pendingLocations: savedData.pendingLocations,
                approvedLocations: savedData.approvedLocations,
                nextLocationId: savedData.nextLocationId
            });
        } catch {
            return true;
        }
    }

    // Manual backup function
    createBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupData = {
            locations: APP_STATE.locations,
            pendingLocations: APP_STATE.pendingLocations,
            approvedLocations: APP_STATE.approvedLocations,
            nextLocationId: APP_STATE.nextLocationId,
            backupCreated: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `discovery-area-backup-${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return true;
    }

    // Restore from backup file
    async restoreFromFile(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);

            // Validate data structure
            if (!data.locations || !Array.isArray(data.locations)) {
                throw new Error('Invalid backup file format');
            }

            // Restore data
            APP_STATE.locations = data.locations || [];
            APP_STATE.pendingLocations = data.pendingLocations || [];
            APP_STATE.approvedLocations = data.approvedLocations || [];
            APP_STATE.nextLocationId = data.nextLocationId || 1;

            // Save to localStorage as well
            this.saveToLocalStorage();

            console.log('Data restored successfully from backup');
            return true;
        } catch (error) {
            console.error('Error restoring from backup:', error);
            throw error;
        }
    }

    // Enhanced localStorage saving with better error handling
    saveToLocalStorage() {
        try {
            const stateToSave = {
                locations: APP_STATE.locations,
                pendingLocations: APP_STATE.pendingLocations,
                approvedLocations: APP_STATE.approvedLocations,
                nextLocationId: APP_STATE.nextLocationId,
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem('discoveryAreaState', JSON.stringify(stateToSave));
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    }

    // Load from localStorage with validation
    loadFromLocalStorage() {
        try {
            const savedState = localStorage.getItem('discoveryAreaState');
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                
                APP_STATE.locations = parsedState.locations || [];
                APP_STATE.pendingLocations = parsedState.pendingLocations || [];
                APP_STATE.approvedLocations = parsedState.approvedLocations || [];
                APP_STATE.nextLocationId = parsedState.nextLocationId || 1;
                
                console.log('Data loaded from localStorage');
                return true;
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }
        return false;
    }
}

// Create global instance
window.DataManager = new DataPersistenceManager();
