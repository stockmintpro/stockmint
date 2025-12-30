// setup-wizard.js - First-time setup page
class SetupWizard {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.setupData = {
            company: {},
            warehouse: {},
            supplier: {},
            customer: {},
            category: {},
            product: {}
        };
    }

    render() {
        const setupCompleted = localStorage.getItem('stockmint_setup_completed');
        
        if (setupCompleted === 'true') {
            return this.renderMasterDataHome();
        }

        return `
            <div class="page-content">
                <h1>🎯 Welcome to StockMint!</h1>
                <p class="page-subtitle">Let's set up your account. Choose your setup method:</p>
                
                <div class="cards-grid" style="grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));">
                    <!-- Start New Card -->
                    <div class="feature-card" onclick="window.location.hash='#setup/start-new'">
                        <div class="feature-icon" style="background: #19BEBB;">
                            <i class="fas fa-rocket"></i>
                        </div>
                        <h3>Start New</h3>
                        <p>Create new database from scratch. Perfect for new businesses.</p>
                        <div class="setup-steps">
                            <div class="step"><i class="fas fa-check"></i> Company Info</div>
                            <div class="step"><i class="fas fa-check"></i> Warehouse Setup</div>
                            <div class="step"><i class="fas fa-check"></i> Add Products</div>
                        </div>
                        <button class="btn-primary" style="margin-top: 20px;">
                            <i class="fas fa-play"></i> Get Started
                        </button>
                    </div>

                    <!-- Data Migration Card -->
                    <div class="feature-card" onclick="window.location.hash='#setup/migrate'">
                        <div class="feature-icon" style="background: #667eea;">
                            <i class="fas fa-file-import"></i>
                        </div>
                        <h3>Data Migration</h3>
                        <p>Import existing data from Excel/CSV. For established businesses.</p>
                        <div class="setup-steps">
                            <div class="step"><i class="fas fa-check"></i> Download Template</div>
                            <div class="step"><i class="fas fa-check"></i> Fill Your Data</div>
                            <div class="step"><i class="fas fa-check"></i> Upload & Validate</div>
                        </div>
                        <button class="btn-primary" style="margin-top: 20px;">
                            <i class="fas fa-upload"></i> Migrate Data
                        </button>
                    </div>
                </div>

                <!-- Data Management Section -->
                <div class="card" style="margin-top: 30px;">
                    <div class="card-header">
                        <h3><i class="fas fa-database"></i> Data Management</h3>
                    </div>
                    <div class="card-body">
                        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                            <button class="btn-secondary" onclick="window.open('template.html', '_blank')">
                                <i class="fas fa-download"></i> Download Template
                            </button>
                            <button class="btn-secondary" onclick="document.getElementById('uploadTemplate').click()">
                                <i class="fas fa-upload"></i> Upload Data
                            </button>
                            <button class="btn-secondary" id="backupBtn">
                                <i class="fas fa-save"></i> Backup Data
                            </button>
                            <button class="btn-secondary" id="resetBtn" style="color: #ef4444;">
                                <i class="fas fa-redo"></i> Reset Data
                            </button>
                        </div>
                        
                        <input type="file" id="uploadTemplate" accept=".xlsx,.xls,.csv" style="display: none;">
                        
                        <div class="instructions" style="margin-top: 20px;">
                            <h4><i class="fas fa-info-circle"></i> Important Notes:</h4>
                            <ul>
                                <li>Data will be stored in your Google Sheets</li>
                                <li>Ensure you have Google Sheets API enabled</li>
                                <li>Backup your data regularly</li>
                                <li>Contact support if you need help migrating</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderMasterDataHome() {
        return `
            <div class="page-content">
                <h1>📁 Master Data</h1>
                <p class="page-subtitle">Manage your core business data and settings</p>
                
                <div class="cards-grid">
                    <div class="feature-card" onclick="window.location.hash='#master/company'">
                        <div class="feature-icon" style="background: #19BEBB;">
                            <i class="fas fa-building"></i>
                        </div>
                        <h3>Company</h3>
                        <p>Company profile and information</p>
                    </div>
                    
                    <div class="feature-card" onclick="window.location.hash='#master/warehouses'">
                        <div class="feature-icon" style="background: #667eea;">
                            <i class="fas fa-warehouse"></i>
                        </div>
                        <h3>Warehouses</h3>
                        <p>Manage storage locations</p>
                    </div>
                    
                    <div class="feature-card" onclick="window.location.hash='#master/suppliers'">
                        <div class="feature-icon" style="background: #10b981;">
                            <i class="fas fa-truck"></i>
                        </div>
                        <h3>Suppliers</h3>
                        <p>Supplier information and contacts</p>
                    </div>
                    
                    <div class="feature-card" onclick="window.location.hash='#master/customers'">
                        <div class="feature-icon" style="background: #f59e0b;">
                            <i class="fas fa-users"></i>
                        </div>
                        <h3>Customers</h3>
                        <p>Customer database</p>
                    </div>
                    
                    <div class="feature-card" onclick="window.location.hash='#master/products'">
                        <div class="feature-icon" style="background: #ef4444;">
                            <i class="fas fa-boxes"></i>
                        </div>
                        <h3>Products</h3>
                        <p>Product catalog and inventory</p>
                    </div>
                    
                    <div class="feature-card" onclick="window.location.hash='#master/categories'">
                        <div class="feature-icon" style="background: #8b5cf6;">
                            <i class="fas fa-tags"></i>
                        </div>
                        <h3>Categories</h3>
                        <p>Product categories and grouping</p>
                    </div>
                </div>
                
                <!-- Data Management Tools -->
                <div class="card" style="margin-top: 30px;">
                    <div class="card-header">
                        <h3><i class="fas fa-database"></i> Data Management Tools</h3>
                    </div>
                    <div class="card-body">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            <button class="btn-secondary" onclick="window.open('template.html', '_blank')">
                                <i class="fas fa-file-excel"></i> Download Template
                            </button>
                            <button class="btn-secondary" onclick="document.getElementById('uploadData').click()">
                                <i class="fas fa-upload"></i> Import Data
                            </button>
                            <button class="btn-secondary" id="exportData">
                                <i class="fas fa-download"></i> Export Data
                            </button>
                            <button class="btn-secondary" id="backupData">
                                <i class="fas fa-save"></i> Backup Now
                            </button>
                            <button class="btn-secondary" id="restoreData">
                                <i class="fas fa-history"></i> Restore Backup
                            </button>
                            <button class="btn-secondary" id="resetData" style="color: #ef4444;">
                                <i class="fas fa-trash-alt"></i> Reset All Data
                            </button>
                        </div>
                        <input type="file" id="uploadData" accept=".xlsx,.xls,.csv" style="display: none;">
                        
                        <div class="instructions" style="margin-top: 20px;">
                            <p><strong>Note:</strong> Data reset will delete all your data. This action cannot be undone. Make sure you have a backup.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Upload template
        const uploadInput = document.getElementById('uploadTemplate') || document.getElementById('uploadData');
        if (uploadInput) {
            uploadInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleFileUpload(file);
                }
            });
        }

        // Reset data confirmation
        const resetBtn = document.getElementById('resetBtn') || document.getElementById('resetData');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('⚠️ WARNING: This will delete ALL your data!\n\nAre you sure you want to reset all data?')) {
                    this.resetAllData();
                }
            });
        }

        // Backup button
        const backupBtn = document.getElementById('backupBtn') || document.getElementById('backupData');
        if (backupBtn) {
            backupBtn.addEventListener('click', () => {
                this.createBackup();
            });
        }
    }

    handleFileUpload(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Validate the template
                const isValid = this.validateTemplate(workbook);
                
                if (isValid) {
                    this.showNotification('✅ Template validated successfully!', 'success');
                    // Process the data
                    this.processUploadedData(workbook);
                } else {
                    this.showNotification('❌ Invalid template structure', 'error');
                }
            } catch (error) {
                this.showNotification(`❌ Error reading file: ${error.message}`, 'error');
            }
        };
        
        reader.readAsArrayBuffer(file);
    }

    validateTemplate(workbook) {
        // Check for required sheets
        const requiredSheets = [
            'dim_Company',
            'dim_Warehouses',
            'dim_Products',
            'dim_Categories'
        ];
        
        const sheetNames = workbook.SheetNames;
        return requiredSheets.every(sheet => sheetNames.includes(sheet));
    }

    processUploadedData(workbook) {
        // Process each sheet
        const sheets = {};
        
        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            sheets[sheetName] = jsonData;
        });
        
        // Save to Google Sheets or localStorage
        this.saveToDatabase(sheets);
    }

    saveToDatabase(data) {
        // Simulate saving
        this.showNotification('📊 Processing data...', 'info');
        
        setTimeout(() => {
            // Mark setup as completed
            localStorage.setItem('stockmint_setup_completed', 'true');
            localStorage.setItem('stockmint_data_migrated', 'true');
            
            this.showNotification('✅ Data migration completed successfully!', 'success');
            
            // Refresh the page
            setTimeout(() => {
                window.location.hash = '#master-data';
                window.location.reload();
            }, 1500);
        }, 2000);
    }

    resetAllData() {
        // Clear all data
        localStorage.removeItem('stockmint_setup_completed');
        localStorage.removeItem('stockmint_data_migrated');
        
        // Clear other data keys
        const keys = Object.keys(localStorage).filter(key => key.startsWith('stockmint_'));
        keys.forEach(key => localStorage.removeItem(key));
        
        this.showNotification('✅ All data has been reset', 'success');
        
        setTimeout(() => {
            window.location.hash = '#master-data';
            window.location.reload();
        }, 1000);
    }

    createBackup() {
        // Create backup data
        const backupData = {
            timestamp: new Date().toISOString(),
            user: StockMintAuth.getUser(),
            data: {
                // Add your actual data here
                company: localStorage.getItem('stockmint_company'),
                products: localStorage.getItem('stockmint_products'),
                // etc...
            }
        };
        
        // Download as JSON file
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `stockmint_backup_${new Date().toISOString().slice(0,10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showNotification('✅ Backup created successfully!', 'success');
    }

    showNotification(message, type = 'info') {
        if (window.StockMintCommon && window.StockMintCommon.showNotification) {
            window.StockMintCommon.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SetupWizard;
}

// Global
window.SetupWizard = SetupWizard;