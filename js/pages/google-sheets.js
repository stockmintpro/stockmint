// google-sheets.js - New file
class GoogleSheetsPage {
    constructor() {
        this.spreadsheetId = localStorage.getItem('stockmint_google_sheet_id');
        this.spreadsheetUrl = localStorage.getItem('stockmint_google_sheet_url');
    }
    
    async render() {
        if (!this.spreadsheetId) {
            return `
                <div class="page-content">
                    <h1><i class="fab fa-google-drive"></i> Google Sheets</h1>
                    <div class="card">
                        <div class="card-header">
                            <h3>Google Sheets Integration</h3>
                        </div>
                        <div class="card-body">
                            <div style="text-align: center; padding: 40px 20px;">
                                <i class="fab fa-google-drive" style="font-size: 64px; color: #4285f4; margin-bottom: 20px;"></i>
                                <h3>No Google Sheets Connected</h3>
                                <p style="color: #666; margin: 15px 0;">
                                    Your data is currently stored locally. Login with Google to enable cloud storage.
                                </p>
                                <div style="margin-top: 30px;">
                                    <a href="index.html" class="btn btn-primary">
                                        <i class="fab fa-google"></i> Login with Google
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="page-content">
                <h1><i class="fab fa-google-drive"></i> Google Sheets</h1>
                <div class="card">
                    <div class="card-header">
                        <h3>Your Data is Securely Stored in Google Sheets</h3>
                    </div>
                    <div class="card-body">
                        <div style="text-align: center; padding: 30px 20px;">
                            <i class="fab fa-google-drive" style="font-size: 64px; color: #0f9d58; margin-bottom: 20px;"></i>
                            <h3 style="color: #0f9d58;">✓ Connected to Google Sheets</h3>
                            <p style="color: #666; margin: 15px 0;">
                                All your inventory data is automatically synced to your personal Google Sheets.
                            </p>
                            
                            <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; margin: 25px 0; text-align: left;">
                                <h4 style="margin-top: 0;"><i class="fas fa-info-circle"></i> Storage Information</h4>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                                    <div>
                                        <p style="margin: 5px 0; color: #666;">Status:</p>
                                        <p style="margin: 5px 0; font-weight: 600; color: #0f9d58;">Active</p>
                                    </div>
                                    <div>
                                        <p style="margin: 5px 0; color: #666;">Owner:</p>
                                        <p style="margin: 5px 0; font-weight: 600;">${localStorage.getItem('stockmint_user_email') || 'You'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
                                <a href="${this.spreadsheetUrl}" target="_blank" class="btn btn-primary">
                                    <i class="fas fa-external-link-alt"></i> Open Google Sheets
                                </a>
                                <button onclick="location.reload()" class="btn btn-secondary">
                                    <i class="fas fa-sync-alt"></i> Refresh
                                </button>
                            </div>
                            
                            <p style="margin-top: 25px; font-size: 13px; color: #999;">
                                <i class="fas fa-shield-alt"></i> Only you have access to this spreadsheet
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Export
window.GoogleSheetsPage = GoogleSheetsPage;
