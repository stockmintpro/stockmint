// GoogleSheetsPage - Enhanced Version
class GoogleSheetsPage {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
        this.spreadsheetId = localStorage.getItem('stockmint_google_sheet_id');
        this.spreadsheetUrl = localStorage.getItem('stockmint_google_sheet_url');
        this.connectionStatus = 'unknown';
    }
    
    async render() {
        // Check connection status
        await this.checkConnection();
        
        return `
        <div class="page-content">
            <h1><i class="fab fa-google-drive"></i> Google Sheets Integration</h1>
            <p class="page-subtitle">Manage your cloud storage and data sync</p>
            
            ${this.user.isDemo ? this.renderDemoView() : this.renderGoogleUserView()}
        </div>
        `;
    }
    
    async checkConnection() {
        if (this.user.isDemo || !this.spreadsheetId) {
            this.connectionStatus = 'not_connected';
            return;
        }
        
        try {
            if (window.GoogleSheetsService) {
                const result = await window.GoogleSheetsService.testConnection();
                this.connectionStatus = result.success ? 'connected' : 'error';
            } else {
                this.connectionStatus = 'service_unavailable';
            }
        } catch (error) {
            this.connectionStatus = 'error';
        }
    }
    
    renderDemoView() {
        return `
        <div class="card">
            <div class="card-header">
                <h3><i class="fab fa-google-drive"></i> Cloud Storage</h3>
            </div>
            <div class="card-body" style="text-align: center; padding: 40px 20px;">
                <i class="fab fa-google-drive" style="font-size: 64px; color: #4285f4; margin-bottom: 20px;"></i>
                <h3>Google Sheets Integration</h3>
                <p style="color: #666; margin: 15px 0; max-width: 500px; margin-left: auto; margin-right: auto;">
                    Store your inventory data securely in your personal Google Sheets.
                    Automatic sync ensures your data is always backed up and accessible from anywhere.
                </p>
                
                <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; margin: 25px 0; text-align: left;">
                    <h4><i class="fas fa-star"></i> Benefits:</h4>
                    <ul style="color: #666; margin: 10px 0; padding-left: 20px;">
                        <li>Secure cloud storage in your Google account</li>
                        <li>Automatic backup and sync</li>
                        <li>Access from any device</li>
                        <li>Real-time collaboration (coming soon)</li>
                        <li>No data loss even if you clear browser cache</li>
                    </ul>
                </div>
                
                <div style="margin-top: 30px;">
                    <a href="index.html" class="btn btn-primary" style="
                        display: inline-flex;
                        align-items: center;
                        gap: 10px;
                        padding: 12px 24px;
                        font-size: 16px;
                        font-weight: 600;
                    ">
                        <i class="fab fa-google"></i> Login with Google to Enable
                    </a>
                </div>
                
                <p style="margin-top: 25px; font-size: 13px; color: #999;">
                    <i class="fas fa-info-circle"></i> Google login automatically activates BASIC plan with full features
                </p>
            </div>
        </div>
        `;
    }
    
    renderGoogleUserView() {
        const statusConfig = {
            'connected': { color: '#10b981', icon: 'fa-check-circle', text: 'Connected' },
            'error': { color: '#ef4444', icon: 'fa-exclamation-circle', text: 'Connection Error' },
            'not_connected': { color: '#f59e0b', icon: 'fa-exclamation-triangle', text: 'Not Connected' },
            'service_unavailable': { color: '#6c757d', icon: 'fa-times-circle', text: 'Service Unavailable' },
            'unknown': { color: '#6c757d', icon: 'fa-question-circle', text: 'Checking...' }
        };
        
        const status = statusConfig[this.connectionStatus] || statusConfig.unknown;
        
        return `
        <div class="card">
            <div class="card-header">
                <h3><i class="fab fa-google-drive"></i> Your Google Sheets</h3>
            </div>
            <div class="card-body">
                <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 30px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <div style="flex-shrink: 0;">
                        <i class="fab fa-google-drive" style="font-size: 48px; color: #0f9d58;"></i>
                    </div>
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 5px 0;">Google Sheets Storage</h4>
                        <p style="margin: 0; color: #666;">
                            Your data is securely stored in your personal Google Drive.
                            All changes are automatically synced to the cloud.
                        </p>
                    </div>
                    <div style="flex-shrink: 0;">
                        <span style="
                            display: inline-block;
                            padding: 8px 16px;
                            background: ${status.color}20;
                            color: ${status.color};
                            border-radius: 20px;
                            font-weight: 600;
                            border: 1px solid ${status.color}40;
                        ">
                            <i class="fas ${status.icon}"></i> ${status.text}
                        </span>
                    </div>
                </div>
                
                ${this.spreadsheetId ? this.renderSpreadsheetInfo() : this.renderNoSpreadsheet()}
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <h4><i class="fas fa-sync-alt"></i> Sync Actions</h4>
                    <div style="display: flex; gap: 15px; margin-top: 15px;">
                        <button onclick="GoogleSheetsPage.forceSync()" class="btn btn-success" style="
                            display: inline-flex;
                            align-items: center;
                            gap: 8px;
                        ">
                            <i class="fas fa-sync-alt"></i> Sync Now
                        </button>
                        
                        <button onclick="GoogleSheetsPage.openSpreadsheet()" class="btn btn-primary" ${!this.spreadsheetId ? 'disabled' : ''} style="
                            display: inline-flex;
                            align-items: center;
                            gap: 8px;
                        ">
                            <i class="fas fa-external-link-alt"></i> Open in Google Sheets
                        </button>
                        
                        <button onclick="GoogleSheetsPage.createNewSpreadsheet()" class="btn btn-secondary" style="
                            display: inline-flex;
                            align-items: center;
                            gap: 8px;
                        ">
                            <i class="fas fa-plus"></i> Create New Sheet
                        </button>
                    </div>
                </div>
                
                <div style="margin-top: 30px; padding: 15px; background: #e8f5e8; border-radius: 8px; border: 1px solid #c8e6c9;">
                    <h5 style="margin: 0 0 10px 0; color: #2e7d32;">
                        <i class="fas fa-info-circle"></i> How it works
                    </h5>
                    <p style="margin: 0; color: #2e7d32; font-size: 14px;">
                        StockMint automatically creates and manages a Google Sheets spreadsheet in your Google Drive.
                        All your inventory data (products, customers, suppliers, etc.) is saved in separate sheets
                        within this spreadsheet. You can access and edit this data directly in Google Sheets.
                    </p>
                </div>
            </div>
        </div>
        `;
    }
    
    renderSpreadsheetInfo() {
        const company = JSON.parse(localStorage.getItem('stockmint_company') || '{}');
        const products = JSON.parse(localStorage.getItem('stockmint_products') || '[]');
        const lastSync = localStorage.getItem('stockmint_last_sync') || 'Never';
        
        return `
        <div style="background: white; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h4 style="margin-top: 0;"><i class="fas fa-file-excel"></i> Current Spreadsheet</h4>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                <div>
                    <p style="margin: 5px 0; color: #666; font-size: 14px;">Spreadsheet Name:</p>
                    <p style="margin: 5px 0; font-weight: 600;">${company.name ? `StockMint - ${company.name}` : 'StockMint Data'}</p>
                </div>
                <div>
                    <p style="margin: 5px 0; color: #666; font-size: 14px;">Owner:</p>
                    <p style="margin: 5px 0; font-weight: 600;">${this.user.email || 'You'}</p>
                </div>
                <div>
                    <p style="margin: 5px 0; color: #666; font-size: 14px;">Last Synced:</p>
                    <p style="margin: 5px 0; font-weight: 600;">${lastSync}</p>
                </div>
                <div>
                    <p style="margin: 5px 0; color: #666; font-size: 14px;">Data Size:</p>
                    <p style="margin: 5px 0; font-weight: 600;">${products.length} products, ${this.countAllData()} total records</p>
                </div>
            </div>
            
            <div style="margin-top: 15px; font-family: monospace; font-size: 12px; background: #f8f9fa; padding: 10px; border-radius: 4px; word-break: break-all;">
                <strong>Spreadsheet ID:</strong> ${this.spreadsheetId}
            </div>
        </div>
        `;
    }
    
    renderNoSpreadsheet() {
        return `
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h4 style="margin-top: 0; color: #856404;">
                <i class="fas fa-exclamation-triangle"></i> No Google Sheets Found
            </h4>
            <p style="color: #856404; margin: 10px 0;">
                You haven't created a Google Sheets spreadsheet yet. Your data is currently stored locally.
                Create a spreadsheet to enable cloud backup and sync.
            </p>
            <button onclick="GoogleSheetsPage.createFirstSpreadsheet()" class="btn btn-warning" style="
                margin-top: 10px;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            ">
                <i class="fas fa-plus-circle"></i> Create Your First Spreadsheet
            </button>
        </div>
        `;
    }
    
    countAllData() {
        const counts = [
            JSON.parse(localStorage.getItem('stockmint_warehouses') || '[]').length,
            JSON.parse(localStorage.getItem('stockmint_suppliers') || '[]').length,
            JSON.parse(localStorage.getItem('stockmint_customers') || '[]').length,
            JSON.parse(localStorage.getItem('stockmint_categories') || '[]').length,
            JSON.parse(localStorage.getItem('stockmint_products') || '[]').length
        ];
        return counts.reduce((a, b) => a + b, 0);
    }
    
    static async forceSync() {
        try {
            if (!window.GoogleSheetsService) {
                alert('Google Sheets service not available');
                return;
            }
            
            const user = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
            if (user.isDemo) {
                alert('This feature is not available in demo mode');
                return;
            }
            
            const sheetsService = window.GoogleSheetsService;
            
            // Show loading
            const button = event?.target?.closest('button');
            if (button) {
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
                button.disabled = true;
                
                try {
                    const result = await sheetsService.syncLocalDataToSheets();
                    
                    if (result) {
                        localStorage.setItem('stockmint_last_sync', new Date().toLocaleString());
                        alert('✅ Sync completed successfully!');
                    } else {
                        alert('⚠️ Sync completed with warnings. Some data may not have been saved.');
                    }
                } finally {
                    button.innerHTML = originalText;
                    button.disabled = false;
                    setTimeout(() => location.reload(), 1000);
                }
            }
        } catch (error) {
            console.error('Sync error:', error);
            alert(`❌ Sync failed: ${error.message}`);
        }
    }
    
    static openSpreadsheet() {
        const spreadsheetUrl = localStorage.getItem('stockmint_google_sheet_url');
        if (spreadsheetUrl) {
            window.open(spreadsheetUrl, '_blank');
        } else {
            const spreadsheetId = localStorage.getItem('stockmint_google_sheet_id');
            if (spreadsheetId) {
                window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`, '_blank');
            } else {
                alert('No spreadsheet available');
            }
        }
    }
    
    static async createNewSpreadsheet() {
        try {
            const company = JSON.parse(localStorage.getItem('stockmint_company') || '{}');
            const user = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
            
            if (!window.GoogleSheetsService) {
                alert('Google Sheets service not available');
                return;
            }
            
            const sheetsService = window.GoogleSheetsService;
            const name = prompt('Enter name for new spreadsheet:', 
                `StockMint - ${company.name || user.name || 'New Spreadsheet'}`);
            
            if (!name) return;
            
            const button = event?.target?.closest('button');
            if (button) {
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
                button.disabled = true;
                
                try {
                    const spreadsheetId = await sheetsService.createSpreadsheet(name);
                    
                    if (spreadsheetId) {
                        // Sync existing data to new spreadsheet
                        await sheetsService.syncLocalDataToSheets();
                        alert('✅ New spreadsheet created and data synced!');
                        setTimeout(() => location.reload(), 1000);
                    }
                } finally {
                    button.innerHTML = '<i class="fas fa-plus"></i> Create New Sheet';
                    button.disabled = false;
                }
            }
        } catch (error) {
            console.error('Create spreadsheet error:', error);
            alert(`❌ Failed to create spreadsheet: ${error.message}`);
        }
    }
    
    static async createFirstSpreadsheet() {
        try {
            const user = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
            if (user.isDemo) {
                alert('Please login with Google to use this feature');
                return;
            }
            
            if (!window.GoogleSheetsService) {
                alert('Google Sheets service not available. Please refresh the page.');
                return;
            }
            
            const sheetsService = window.GoogleSheetsService;
            
            const button = event?.target?.closest('button');
            if (button) {
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
                button.disabled = true;
                
                try {
                    const company = JSON.parse(localStorage.getItem('stockmint_company') || '{}');
                    const spreadsheetName = company.name ? 
                        `StockMint - ${company.name}` : 
                        `StockMint - ${user.name || user.email}`;
                    
                    const spreadsheetId = await sheetsService.createSpreadsheet(spreadsheetName);
                    
                    if (spreadsheetId) {
                        // If we have data, sync it
                        const hasData = localStorage.getItem('stockmint_setup_completed') === 'true';
                        if (hasData) {
                            await sheetsService.syncLocalDataToSheets();
                        }
                        
                        alert('✅ Spreadsheet created successfully!');
                        setTimeout(() => location.reload(), 1000);
                    }
                } finally {
                    button.innerHTML = '<i class="fas fa-plus-circle"></i> Create Your First Spreadsheet';
                    button.disabled = false;
                }
            }
        } catch (error) {
            console.error('Create first spreadsheet error:', error);
            alert(`❌ Failed to create spreadsheet: ${error.message}`);
        }
    }
}

// Export
window.GoogleSheetsPage = GoogleSheetsPage;
