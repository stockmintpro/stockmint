// Sync Service untuk sinkronisasi data dengan Google Sheets
class SyncService {
    constructor() {
        this.syncInterval = null;
        this.isSyncing = false;
        this.lastSyncTime = null;
    }
    
    // Initialize sync service
    init() {
        const user = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
        
        // Hanya untuk Google users yang bukan demo
        if (user.isDemo || !user.email) {
            console.log('Sync service disabled for demo users');
            return;
        }
        
        console.log('🔄 Initializing sync service...');
        
        // Setup periodic sync (every 5 minutes)
        this.startPeriodicSync();
        
        // Listen for storage changes
        this.setupStorageListener();
        
        // Sync immediately if last sync was more than 1 hour ago
        const lastSync = localStorage.getItem('stockmint_last_sync');
        if (!lastSync || (Date.now() - new Date(lastSync).getTime()) > 3600000) {
            setTimeout(() => this.syncAllData(), 5000);
        }
    }
    
    // Start periodic sync
    startPeriodicSync() {
        // Clear existing interval
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        // Sync every 5 minutes (300000 ms)
        this.syncInterval = setInterval(() => {
            if (!this.isSyncing) {
                this.syncAllData();
            }
        }, 300000);
        
        console.log('✅ Periodic sync started (5 minutes interval)');
    }
    
    // Setup storage change listener
    setupStorageListener() {
        window.addEventListener('storage', (e) => {
            // Jika ada perubahan pada data setup, sync ke Google Sheets
            if (e.key && e.key.startsWith('stockmint_') && 
                (e.key.includes('company') || 
                 e.key.includes('warehouses') || 
                 e.key.includes('suppliers') || 
                 e.key.includes('customers') || 
                 e.key.includes('categories') || 
                 e.key.includes('products'))) {
                
                console.log(`🔄 Storage change detected on ${e.key}, scheduling sync...`);
                
                // Debounce sync - tunggu 10 detik setelah perubahan terakhir
                setTimeout(() => {
                    if (!this.isSyncing) {
                        this.syncAllData();
                    }
                }, 10000);
            }
        });
    }
    
    // Sync all data to Google Sheets
    async syncAllData() {
        if (this.isSyncing) {
            console.log('⚠️ Sync already in progress, skipping...');
            return;
        }
        
        try {
            this.isSyncing = true;
            console.log('🔄 Starting data sync to Google Sheets...');
            
            // Check if Google Sheets service is ready
            if (!window.GoogleSheetsService || !window.GoogleSheetsService.isReady()) {
                console.log('Google Sheets service not ready, skipping sync');
                return;
            }
            
            // Prepare data from localStorage
            const setupData = {
                company: JSON.parse(localStorage.getItem('stockmint_company') || '{}'),
                warehouses: JSON.parse(localStorage.getItem('stockmint_warehouses') || '[]'),
                suppliers: JSON.parse(localStorage.getItem('stockmint_suppliers') || '[]'),
                customers: JSON.parse(localStorage.getItem('stockmint_customers') || '[]'),
                categories: JSON.parse(localStorage.getItem('stockmint_categories') || '[]'),
                products: JSON.parse(localStorage.getItem('stockmint_products') || '[]')
            };
            
            // Skip if no data
            if (!setupData.company || Object.keys(setupData.company).length === 0) {
                console.log('No setup data to sync');
                return;
            }
            
            // Save to Google Sheets
            await window.GoogleSheetsService.saveSetupData(setupData);
            
            // Update sync timestamp
            this.lastSyncTime = new Date().toISOString();
            localStorage.setItem('stockmint_last_sync', this.lastSyncTime);
            localStorage.setItem('stockmint_sync_status', 'success');
            
            console.log('✅ Data synced to Google Sheets successfully');
            
        } catch (error) {
            console.error('❌ Error syncing data:', error);
            localStorage.setItem('stockmint_sync_status', 'error');
            localStorage.setItem('stockmint_sync_error', error.message);
        } finally {
            this.isSyncing = false;
        }
    }
    
    // Manual sync trigger
    async manualSync() {
        console.log('🔄 Manual sync triggered');
        await this.syncAllData();
    }
    
    // Check sync status
    getSyncStatus() {
        return {
            lastSync: localStorage.getItem('stockmint_last_sync'),
            status: localStorage.getItem('stockmint_sync_status') || 'unknown',
            error: localStorage.getItem('stockmint_sync_error')
        };
    }
    
    // Stop sync service
    stop() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        console.log('🛑 Sync service stopped');
    }
}

// Create global instance
window.SyncService = new SyncService();
