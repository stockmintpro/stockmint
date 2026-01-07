// data-recovery.js - Perbaikan untuk menghindari loop
class DataRecovery {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
        this.isDemo = this.user?.isDemo || false;
    }
    
    // Periksa apakah recovery diperlukan
    needsRecovery() {
        if (this.isDemo) return false;
        
        const spreadsheetId = localStorage.getItem('stockmint_google_sheet_id');
        const setupCompleted = localStorage.getItem('stockmint_setup_completed') === 'true';
        const recoveryAttempted = localStorage.getItem('stockmint_recovery_attempted');
        
        // Jangan tampilkan recovery jika sudah dicoba hari ini
        if (recoveryAttempted) {
            const lastAttempt = new Date(recoveryAttempted);
            const today = new Date();
            if (lastAttempt.toDateString() === today.toDateString()) {
                return false;
            }
        }
        
        // Recovery hanya jika punya spreadsheet tapi data lokal kosong
        if (spreadsheetId && !setupCompleted) {
            const hasLocalData = localStorage.getItem('stockmint_company') && 
                                 localStorage.getItem('stockmint_products');
            
            if (!hasLocalData) {
                return true;
            }
        }
        
        return false;
    }
    
    // Tampilkan modal recovery
    async showRecoveryModal() {
        if (this.isDemo) return;
        
        const modalHTML = `
            <div id="recoveryModal" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 20px;
            ">
                <div style="
                    background: white;
                    border-radius: 15px;
                    padding: 30px;
                    max-width: 500px;
                    width: 100%;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                ">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <div style="font-size: 48px; color: #19BEBB; margin-bottom: 15px;">
                            <i class="fas fa-database"></i>
                        </div>
                        <h3 style="color: #333; margin-bottom: 10px;">Data Recovery Available</h3>
                        <p style="color: #666; line-height: 1.6;">
                            We found your Google Sheets with existing data. Would you like to restore it?
                        </p>
                    </div>
                    
                    <div style="display: flex; gap: 15px; flex-direction: column;">
                        <button id="restoreDataBtn" style="
                            background: #19BEBB;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 8px;
                        ">
                            <i class="fas fa-cloud-download-alt"></i> Restore Data from Google Sheets
                        </button>
                        
                        <button id="startFreshBtn" style="
                            background: #f8f9fa;
                            color: #333;
                            border: 1px solid #ddd;
                            padding: 12px 24px;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 8px;
                        ">
                            <i class="fas fa-plus-circle"></i> Start Fresh with New Data
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Bind events
        document.getElementById('restoreDataBtn').addEventListener('click', async () => {
            await this.restoreData();
        });
        
        document.getElementById('startFreshBtn').addEventListener('click', () => {
            localStorage.setItem('stockmint_setup_completed', 'true');
            localStorage.setItem('stockmint_recovery_attempted', new Date().toISOString());
            this.closeModal();
        });
    }
    
    async restoreData() {
        try {
            if (!window.GoogleSheetsService) {
                throw new Error('Google Sheets service not available');
            }
            
            const sheetsService = window.GoogleSheetsService;
            const initialized = await sheetsService.init();
            
            if (!initialized) {
                throw new Error('Failed to initialize Google Sheets');
            }
            
            // Tampilkan loading
            const restoreBtn = document.getElementById('restoreDataBtn');
            if (restoreBtn) {
                restoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Restoring...';
                restoreBtn.disabled = true;
            }
            
            // Load data dari Google Sheets
            const loaded = await sheetsService.loadDataFromSheets();
            
            if (loaded) {
                localStorage.setItem('stockmint_setup_completed', 'true');
                localStorage.setItem('stockmint_recovery_attempted', new Date().toISOString());
                
                alert('✅ Data restored successfully!');
                this.closeModal();
                
                // Refresh halaman
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                throw new Error('Failed to load data from Google Sheets');
            }
            
        } catch (error) {
            console.error('Restore error:', error);
            alert(`Restore failed: ${error.message}`);
            
            const restoreBtn = document.getElementById('restoreDataBtn');
            if (restoreBtn) {
                restoreBtn.innerHTML = '<i class="fas fa-cloud-download-alt"></i> Restore Data from Google Sheets';
                restoreBtn.disabled = false;
            }
        }
    }
    
    closeModal() {
        const modal = document.getElementById('recoveryModal');
        if (modal) {
            modal.remove();
        }
    }
}

// Create global instance
window.DataRecovery = new DataRecovery();
