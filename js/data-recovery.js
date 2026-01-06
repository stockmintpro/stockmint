// Data Recovery System
class DataRecovery {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
    }
    
    // Check if recovery is needed - LOGIKA YANG LEBIH AKURAT
    needsRecovery() {
        // Hanya untuk Google users
        if (this.user.isDemo) {
            return false;
        }
        
        const setupCompleted = localStorage.getItem('stockmint_setup_completed');
        const hasGoogleSheet = localStorage.getItem('stockmint_google_sheet_id');
        const hasLocalData = localStorage.getItem('stockmint_company');
        
        // Jika punya Google Sheet tapi setup belum completed atau data lokal kosong
        if (hasGoogleSheet && (!setupCompleted || !hasLocalData || hasLocalData === '{}')) {
            return true;
        }
        
        // Jika ada flag pending sync
        if (localStorage.getItem('stockmint_google_sheet_pending_sync') === 'true') {
            return true;
        }
        
        return false;
    }
    
    // Attempt to recover data from Google Sheets
    async attemptRecovery() {
        try {
            console.log('🔄 Attempting data recovery from Google Sheets...');
            
            if (!window.GoogleSheetsService) {
                throw new Error('Google Sheets service not available');
            }
            
            // Initialize Google Sheets service
            const sheetsService = window.GoogleSheetsService;
            const initialized = await sheetsService.init();
            
            if (!initialized) {
                throw new Error('Failed to initialize Google Sheets service');
            }
            
            // Load data dari Google Sheets
            const loaded = await sheetsService.loadDataFromSheets();
            
            if (loaded) {
                // Verifikasi data yang di-load
                const companyData = localStorage.getItem('stockmint_company');
                const productsData = localStorage.getItem('stockmint_products');
                
                if (companyData && companyData !== '{}' && productsData) {
                    console.log('✅ Data recovery successful!');
                    
                    // Mark setup as completed
                    localStorage.setItem('stockmint_setup_completed', 'true');
                    localStorage.setItem('stockmint_recovery_date', new Date().toISOString());
                    localStorage.removeItem('stockmint_google_sheet_pending_sync');
                    
                    return true;
                }
            }
            
            return false;
            
        } catch (error) {
            console.error('Data recovery failed:', error);
            // Jika recovery gagal, set flag untuk sync nanti
            localStorage.setItem('stockmint_google_sheet_pending_sync', 'true');
            return false;
        }
    }
    
    // Show recovery modal
    showRecoveryModal() {
        const modalHTML = `
            <div class="modal-overlay" id="recoveryModal" style="
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.7); display: flex; align-items: center;
                justify-content: center; z-index: 10000; padding: 20px;
            ">
                <div class="modal-content" style="
                    background: white; border-radius: 15px; padding: 30px;
                    max-width: 500px; width: 100%; box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                ">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <div style="font-size: 48px; color: #19BEBB; margin-bottom: 15px;">
                            🔄
                        </div>
                        <h2 style="color: #333; margin-bottom: 10px;">Data Recovery Available</h2>
                        <p style="color: #666;">We found your previous setup data in Google Sheets.</p>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <p>Would you like to restore your data?</p>
                        <ul style="text-align: left; color: #666; margin: 15px 0;">
                            <li>Company information</li>
                            <li>Warehouses</li>
                            <li>Suppliers & Customers</li>
                            <li>Categories & Products</li>
                        </ul>
                    </div>
                    
                    <div style="display: flex; gap: 15px; justify-content: center;">
                        <button id="recoverBtn" style="
                            background: #19BEBB; color: white; border: none;
                            padding: 12px 24px; border-radius: 8px; font-weight: 600;
                            cursor: pointer; flex: 1;
                        ">
                            <i class="fas fa-download"></i> Restore Data
                        </button>
                        
                        <button id="skipRecoveryBtn" style="
                            background: #f8f9fa; color: #333; border: 1px solid #ddd;
                            padding: 12px 24px; border-radius: 8px; font-weight: 600;
                            cursor: pointer; flex: 1;
                        ">
                            <i class="fas fa-times"></i> Start Fresh
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Bind events
        document.getElementById('recoverBtn').addEventListener('click', async () => {
            const modal = document.getElementById('recoveryModal');
            modal.innerHTML = `
                <div style="padding: 40px 20px; text-align: center;">
                    <div class="loading-spinner" style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #19BEBB; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                    <h3>Restoring Data...</h3>
                    <p>Please wait while we restore your data from Google Sheets.</p>
                </div>
            `;
            
            const success = await this.attemptRecovery();
            
            if (success) {
                modal.innerHTML = `
                    <div style="padding: 40px 20px; text-align: center;">
                        <div style="font-size: 48px; color: #10b981; margin-bottom: 15px;">✓</div>
                        <h3>Data Restored Successfully!</h3>
                        <p>Your data has been restored from Google Sheets.</p>
                        <button onclick="location.reload()" style="
                            background: #19BEBB; color: white; border: none;
                            padding: 12px 24px; border-radius: 8px; font-weight: 600;
                            cursor: pointer; margin-top: 20px;
                        ">
                            <i class="fas fa-redo"></i> Reload Application
                        </button>
                    </div>
                `;
            } else {
                modal.innerHTML = `
                    <div style="padding: 40px 20px; text-align: center;">
                        <div style="font-size: 48px; color: #ef4444; margin-bottom: 15px;">❌</div>
                        <h3>Restoration Failed</h3>
                        <p>Could not restore data from Google Sheets.</p>
                        <button onclick="location.reload()" style="
                            background: #19BEBB; color: white; border: none;
                            padding: 12px 24px; border-radius: 8px; font-weight: 600;
                            cursor: pointer; margin-top: 20px;
                        ">
                            <i class="fas fa-redo"></i> Try Again
                        </button>
                    </div>
                `;
            }
        });
        
        document.getElementById('skipRecoveryBtn').addEventListener('click', () => {
            document.getElementById('recoveryModal').remove();
        });
    }
}

// Create global instance
window.DataRecovery = new DataRecovery();
