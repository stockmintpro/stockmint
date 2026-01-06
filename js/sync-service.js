// Sync Service untuk sinkronisasi data dengan Google Sheets
class SyncService {
    constructor() {
        this.syncInterval = null;
        this.isSyncing = false;
        this.lastSyncTime = localStorage.getItem('stockmint_last_sync');
        this.autoSyncEnabled = true;
    }
    
    // Initialize sync service
    async init() {
        const user = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
        
        // Hanya untuk Google users yang bukan demo
        if (user.isDemo || !user.email) {
            console.log('Sync service disabled for demo users');
            return;
        }
        
        console.log('🔄 Initializing sync service...');
        
        // Setup periodic sync (every 10 minutes)
        this.startPeriodicSync(600000);
        
        // Sync immediately jika sudah setup tapi belum pernah sync
        const setupCompleted = localStorage.getItem('stockmint_setup_completed') === 'true';
        const hasGoogleSheet = localStorage.getItem('stockmint_google_sheet_id');
        
        if (setupCompleted && hasGoogleSheet && !this.lastSyncTime) {
            setTimeout(() => this.syncAllData(), 10000);
        }
    }
    
    // Start periodic sync dengan interval yang bisa diatur
    startPeriodicSync(interval = 600000) { // Default 10 minutes
        // Clear existing interval
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        this.syncInterval = setInterval(() => {
            if (!this.isSyncing && this.autoSyncEnabled) {
                console.log('🔄 Auto-syncing data...');
                this.syncAllData();
            }
        }, interval);
        
        console.log(`✅ Periodic sync started (${interval/60000} minutes interval)`);
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
