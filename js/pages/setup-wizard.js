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
        this.isDemoUser = false;
        this.currentPlan = localStorage.getItem('stockmint_plan') || 'basic';
    }

    render() {
        const setupCompleted = localStorage.getItem('stockmint_setup_completed');
        const currentPage = window.location.hash.substring(1);
        
        // Check if user is demo
        const userData = localStorage.getItem('stockmint_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                this.isDemoUser = user.isDemo || false;
            } catch (e) {
                this.isDemoUser = false;
            }
        }
        
        // Jika mengakses halaman setup khusus
        if (currentPage === 'setup/start-new') {
            return this.renderStartNew();
        }
        
        if (currentPage === 'setup/migrate') {
            return this.renderMigrate();
        }
        
        // Jika setup sudah selesai, tampilkan master data normal
        if (setupCompleted === 'true') {
            return this.renderMasterDataHome();
        }

        // Default: tampilkan pilihan setup
        return this.renderSetupOptions();
    }

    renderSetupOptions() {
        return `
            <div class="page-content">
                <h1>🎯 Welcome to StockMint!</h1>
                <p class="page-subtitle">Let's set up your account. Choose your setup method:</p>
                
                ${this.isDemoUser ? `
                    <div class="demo-alert">
                        <i class="fas fa-info-circle"></i>
                        <span>You are in DEMO mode. Setup is optional for demonstration purposes.</span>
                    </div>
                ` : ''}
                
                <div class="cards-grid" style="grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); margin-top: 20px;">
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
                            <button class="btn-secondary" id="uploadDataBtn">
                                <i class="fas fa-upload"></i> Upload Data
                            </button>
                            <button class="btn-secondary" id="backupBtn">
                                <i class="fas fa-save"></i> Backup Data
                            </button>
                            <button class="btn-secondary" id="resetSetupBtn" style="color: #f59e0b;">
                                <i class="fas fa-redo"></i> Reset Setup
                            </button>
                        </div>
                        
                        <input type="file" id="uploadTemplate" accept=".xlsx,.xls,.csv" style="display: none;">
                        
                        <div class="instructions" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                            <h4><i class="fas fa-info-circle"></i> Important Notes:</h4>
                            <ul style="margin: 10px 0 0 20px;">
                                <li>Data will be stored in your browser's local storage</li>
                                <li>For larger businesses, consider exporting data regularly</li>
                                <li>Backup your data before making major changes</li>
                                <li>Contact support if you need help with data migration</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .demo-alert {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 8px;
                    padding: 10px 15px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #856404;
                }
                
                .setup-steps {
                    margin: 15px 0;
                    padding: 10px;
                    background: #f8f9fa;
                    border-radius: 8px;
                }
                
                .step {
                    padding: 5px 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #666;
                }
                
                .step i {
                    color: #10b981;
                }
            </style>
        `;
    }

    renderStartNew() {
        return `
            <div class="page-content">
                <h1>🚀 Start New Setup</h1>
                <p class="page-subtitle">Fill in your basic business information</p>
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-building"></i> Company Information</h3>
                    </div>
                    <div class="card-body">
                        <form id="companyForm">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                                <div>
                                    <label>Company Name *</label>
                                    <input type="text" id="companyName" class="form-control" required placeholder="Enter company name">
                                </div>
                                <div>
                                    <label>Tax ID</label>
                                    <input type="text" id="companyTaxId" class="form-control" placeholder="Enter tax ID (optional)">
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <label>Address</label>
                                <textarea id="companyAddress" class="form-control" rows="3" placeholder="Enter company address"></textarea>
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <label>Phone Number</label>
                                <input type="tel" id="companyPhone" class="form-control" placeholder="Enter phone number">
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <label>Email</label>
                                <input type="email" id="companyEmail" class="form-control" placeholder="Enter email address">
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <label>Business Type</label>
                                <select id="businessType" class="form-control">
                                    <option value="">Select business type</option>
                                    <option value="retail">Retail</option>
                                    <option value="wholesale">Wholesale</option>
                                    <option value="manufacturing">Manufacturing</option>
                                    <option value="ecommerce">E-commerce</option>
                                    <option value="services">Services</option>
                                </select>
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <label>
                                    <input type="checkbox" id="agreeTerms"> 
                                    I agree to the Terms of Service and Privacy Policy
                                </label>
                            </div>
                            
                            <div style="display: flex; gap: 10px;">
                                <button type="submit" class="btn-primary">
                                    <i class="fas fa-save"></i> Save & Continue
                                </button>
                                <button type="button" class="btn-secondary" onclick="window.location.hash='#dashboard'">
                                    <i class="fas fa-times"></i> Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    renderMigrate() {
        return `
            <div class="page-content">
                <h1>📤 Data Migration</h1>
                <p class="page-subtitle">Import your existing data</p>
                
                <div class="alert alert-warning" style="background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h4><i class="fas fa-exclamation-triangle"></i> Advanced Feature Warning</h4>
                    <p>This feature is for users who understand database relationships. The Excel template has 12 interconnected sheets with complex relationships.</p>
                    <p><strong>For beginners:</strong> Use "Start New Setup" instead, which guides you step by step.</p>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-file-import"></i> Step-by-Step Migration</h3>
                    </div>
                    <div class="card-body">
                        <div class="migration-steps">
                            <div class="step">
                                <div class="step-number">1</div>
                                <div class="step-content">
                                    <h4>Download Template</h4>
                                    <p>Get the Excel template with all required sheets</p>
                                    <button class="btn-primary" onclick="window.open('template.html', '_blank')">
                                        <i class="fas fa-download"></i> Download Template
                                    </button>
                                </div>
                            </div>
                            
                            <div class="step">
                                <div class="step-number">2</div>
                                <div class="step-content">
                                    <h4>Study the Structure</h4>
                                    <p>Understand the 12 sheets and their relationships:</p>
                                    <ul>
                                        <li><strong>Core Tables:</strong> Company, Warehouses, Products, Categories</li>
                                        <li><strong>Relational Tables:</strong> Product-Supplier-Warehouse, Opening Stock</li>
                                        <li><strong>Pricing Tables:</strong> Purchase Price, Sale Price</li>
                                        <li><strong>Marketplace Tables:</strong> dim_Marketplace, marketplace_fee_components</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div class="step">
                                <div class="step-number">3</div>
                                <div class="step-content">
                                    <h4>Fill Your Data</h4>
                                    <p>Carefully fill in your data following the exact format</p>
                                    <div class="alert alert-info" style="background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 10px; border-radius: 5px;">
                                        <strong>Important:</strong> Don't change sheet names or column headers
                                    </div>
                                </div>
                            </div>
                            
                            <div class="step">
                                <div class="step-number">4</div>
                                <div class="step-content">
                                    <h4>Upload & Validate</h4>
                                    <p>Upload your filled template for validation</p>
                                    <div style="text-align: center; margin: 20px 0;">
                                        <button class="btn-secondary" id="uploadMigrationFile" style="padding: 12px 24px;">
                                            <i class="fas fa-upload"></i> Upload Filled Template
                                        </button>
                                        <input type="file" id="migrationFile" accept=".xlsx,.xls,.csv" style="display: none;">
                                    </div>
                                    <div id="uploadStatus"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="quick-tips" style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                            <h4><i class="fas fa-lightbulb"></i> Quick Tips for Success:</h4>
                            <ol>
                                <li>Start with small data first (5-10 products)</li>
                                <li>Ensure IDs are consistent across sheets</li>
                                <li>Use the same date format: YYYY-MM-DD HH:MM:SS</li>
                                <li>Keep a backup of your original data</li>
                                <li>Test with the template that includes example data first</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .migration-steps {
                    counter-reset: step-counter;
                }
                
                .step {
                    display: flex;
                    margin-bottom: 30px;
                    padding-bottom: 30px;
                    border-bottom: 1px dashed #dee2e6;
                }
                
                .step:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                    padding-bottom: 0;
                }
                
                .step-number {
                    width: 40px;
                    height: 40px;
                    background: #19BEBB;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 18px;
                    margin-right: 20px;
                    flex-shrink: 0;
                }
                
                .step-content {
                    flex: 1;
                }
                
                .step-content h4 {
                    margin-top: 0;
                    color: #333;
                }
                
                .step-content ul, .step-content ol {
                    margin: 10px 0 10px 20px;
                }
                
                .step-content li {
                    margin-bottom: 5px;
                }
            </style>
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
                        <span class="badge">${this.isDemoUser ? 'DEMO' : 'READY'}</span>
                    </div>
                    
                    <div class="feature-card" onclick="window.location.hash='#master/warehouses'">
                        <div class="feature-icon" style="background: #667eea;">
                            <i class="fas fa-warehouse"></i>
                        </div>
                        <h3>Warehouses</h3>
                        <p>Manage storage locations</p>
                        <span class="badge">${this.currentPlan === 'demo' ? 'DEMO' : 'READY'}</span>
                    </div>
                    
                    <div class="feature-card" onclick="window.location.hash='#master/suppliers'">
                        <div class="feature-icon" style="background: #10b981;">
                            <i class="fas fa-truck"></i>
                        </div>
                        <h3>Suppliers</h3>
                        <p>Supplier information and contacts</p>
                        <span class="badge">READY</span>
                    </div>
                    
                    <div class="feature-card" onclick="window.location.hash='#master/customers'">
                        <div class="feature-icon" style="background: #f59e0b;">
                            <i class="fas fa-users"></i>
                        </div>
                        <h3>Customers</h3>
                        <p>Customer database</p>
                        <span class="badge">READY</span>
                    </div>
                    
                    <div class="feature-card" onclick="window.location.hash='#master/products'">
                        <div class="feature-icon" style="background: #ef4444;">
                            <i class="fas fa-boxes"></i>
                        </div>
                        <h3>Products</h3>
                        <p>Product catalog and inventory</p>
                        <span class="badge">READY</span>
                    </div>
                    
                    <div class="feature-card" onclick="window.location.hash='#master/categories'">
                        <div class="feature-icon" style="background: #8b5cf6;">
                            <i class="fas fa-tags"></i>
                        </div>
                        <h3>Categories</h3>
                        <p>Product categories and grouping</p>
                        <span class="badge">READY</span>
                    </div>
                    
                    <div class="feature-card" onclick="window.location.hash='#master/units'">
                        <div class="feature-icon" style="background: #3b82f6;">
                            <i class="fas fa-balance-scale"></i>
                        </div>
                        <h3>Units</h3>
                        <p>Measurement units and conversions</p>
                        <span class="badge">READY</span>
                    </div>
                    
                    <div class="feature-card" onclick="window.location.hash='#master/tax-rates'">
                        <div class="feature-icon" style="background: #10b981;">
                            <i class="fas fa-percent"></i>
                        </div>
                        <h3>Tax Rates</h3>
                        <p>Tax configurations and rates</p>
                        <span class="badge">READY</span>
                    </div>
                    
                    <div class="feature-card ${this.currentPlan === 'demo' ? 'disabled-feature' : ''}" 
                         onclick="${this.currentPlan !== 'demo' ? 'window.location.hash=\'#master/marketplace-fee\'' : ''}">
                        <div class="feature-icon" style="background: #f97316;">
                            <i class="fas fa-percentage"></i>
                        </div>
                        <h3>Marketplace Fee</h3>
                        <p>Configure marketplace fees</p>
                        <span class="badge">${this.currentPlan === 'demo' ? 'LOCKED' : 'READY'}</span>
                    </div>
                    
                    <div class="feature-card ${this.currentPlan === 'demo' ? 'disabled-feature' : ''}" 
                         onclick="${this.currentPlan !== 'demo' ? 'window.location.hash=\'#master/data-migration\'' : ''}">
                        <div class="feature-icon" style="background: #6b7280;">
                            <i class="fas fa-database"></i>
                        </div>
                        <h3>Data Migration</h3>
                        <p>Import data from old systems</p>
                        <span class="badge">${this.currentPlan === 'demo' ? 'LOCKED' : 'READY'}</span>
                    </div>
                </div>
                
                <!-- Data Management Tools -->
                <div class="card" style="margin-top: 30px;">
                    <div class="card-header">
                        <h3><i class="fas fa-database"></i> Data Management Tools</h3>
                    </div>
                    <div class="card-body">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            <button class="btn-secondary" onclick="this.downloadTemplate()">
                                <i class="fas fa-file-excel"></i> Download Template
                            </button>
                            <button class="btn-secondary" id="importDataBtn">
                                <i class="fas fa-upload"></i> Import Data
                            </button>
                            <button class="btn-secondary" id="exportDataBtn">
                                <i class="fas fa-download"></i> Export Data
                            </button>
                            <button class="btn-secondary" id="backupDataBtn">
                                <i class="fas fa-save"></i> Backup Now
                            </button>
                            <button class="btn-secondary" id="restoreDataBtn">
                                <i class="fas fa-history"></i> Restore Backup
                            </button>
                            <button class="btn-secondary" id="resetSetupBtn" style="color: #f59e0b;">
                                <i class="fas fa-redo"></i> Reset Setup
                            </button>
                            <button class="btn-secondary" id="fullResetBtn" style="color: #ef4444;">
                                <i class="fas fa-trash-alt"></i> Full Reset
                            </button>
                        </div>
                        <input type="file" id="uploadData" accept=".xlsx,.xls,.csv" style="display: none;">
                        
                        <div class="instructions" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                            <p><strong><i class="fas fa-exclamation-triangle"></i> Warning:</strong> Data reset will delete all your data. This action cannot be undone. Make sure you have a backup.</p>
                        </div>
                        
                        <!-- Data Statistics -->
                        <div class="data-stats" style="margin-top: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                            <div class="stat-box" style="background: #f0f9ff; padding: 15px; border-radius: 8px; text-align: center;">
                                <div style="font-size: 24px; font-weight: bold; color: #19BEBB;">0</div>
                                <div style="font-size: 12px; color: #666;">Products</div>
                            </div>
                            <div class="stat-box" style="background: #f0fdf4; padding: 15px; border-radius: 8px; text-align: center;">
                                <div style="font-size: 24px; font-weight: bold; color: #10b981;">0</div>
                                <div style="font-size: 12px; color: #666;">Suppliers</div>
                            </div>
                            <div class="stat-box" style="background: #fef3c7; padding: 15px; border-radius: 8px; text-align: center;">
                                <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">0</div>
                                <div style="font-size: 12px; color: #666;">Customers</div>
                            </div>
                            <div class="stat-box" style="background: #fef2f2; padding: 15px; border-radius: 8px; text-align: center;">
                                <div style="font-size: 24px; font-weight: bold; color: #ef4444;">0</div>
                                <div style="font-size: 12px; color: #666;">Warehouses</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .badge {
                    display: inline-block;
                    padding: 3px 8px;
                    font-size: 11px;
                    font-weight: 600;
                    border-radius: 12px;
                    margin-top: 8px;
                    text-transform: uppercase;
                }
                
                .badge[data-status="ready"] {
                    background: #d1fae5;
                    color: #065f46;
                }
                
                .badge[data-status="demo"] {
                    background: #fef3c7;
                    color: #92400e;
                }
                
                .badge[data-status="locked"] {
                    background: #fee2e2;
                    color: #dc2626;
                }
                
                .disabled-feature {
                    opacity: 0.6;
                    cursor: not-allowed !important;
                }
                
                .disabled-feature:hover {
                    transform: none !important;
                    box-shadow: none !important;
                }
            </style>
        `;
    }

    bindEvents() {
        // Handle company form submission
        const companyForm = document.getElementById('companyForm');
        if (companyForm) {
            companyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCompanyForm();
            });
        }
        
        // Handle migration file upload
        const uploadBtn = document.getElementById('uploadMigrationFile');
        const fileInput = document.getElementById('migrationFile');
        
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => {
                fileInput.click();
            });
            
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleFileUpload(file);
                }
            });
        }
        
        // Handle data import button
        const importBtn = document.getElementById('importDataBtn') || document.getElementById('uploadDataBtn');
        const uploadInput = document.getElementById('uploadData') || document.getElementById('uploadTemplate');
        
        if (importBtn && uploadInput) {
            importBtn.addEventListener('click', () => {
                uploadInput.click();
            });
            
            uploadInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleFileUpload(file);
                }
            });
        }
        
        // Reset Setup button (partial reset)
        const resetSetupBtn = document.getElementById('resetSetupBtn');
        if (resetSetupBtn) {
            resetSetupBtn.addEventListener('click', () => {
                this.resetAllData(false); // Reset setup only
            });
        }
        
        // Full Reset button (complete reset)
        const fullResetBtn = document.getElementById('fullResetBtn');
        if (fullResetBtn) {
            fullResetBtn.addEventListener('click', () => {
                this.resetAllData(true); // Complete reset
            });
        }
        
        // Backup button
        const backupBtn = document.getElementById('backupBtn') || document.getElementById('backupDataBtn');
        if (backupBtn) {
            backupBtn.addEventListener('click', () => {
                this.createBackup();
            });
        }
        
        // Export button
        const exportBtn = document.getElementById('exportDataBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }
        
        // Restore button
        const restoreBtn = document.getElementById('restoreDataBtn');
        if (restoreBtn) {
            restoreBtn.addEventListener('click', () => {
                this.restoreBackup();
            });
        }
    }

    handleCompanyForm() {
        const companyName = document.getElementById('companyName').value;
        const companyTaxId = document.getElementById('companyTaxId').value;
        const companyAddress = document.getElementById('companyAddress').value;
        const companyPhone = document.getElementById('companyPhone')?.value || '';
        const companyEmail = document.getElementById('companyEmail')?.value || '';
        const businessType = document.getElementById('businessType')?.value || '';
        const agreeTerms = document.getElementById('agreeTerms')?.checked || false;
        
        if (!companyName) {
            this.showNotification('Company name is required', 'error');
            return;
        }
        
        if (!agreeTerms) {
            this.showNotification('You must agree to the Terms of Service', 'error');
            return;
        }
        
        // Simpan data perusahaan
        const companyData = {
            id: 1,
            name: companyName,
            taxId: companyTaxId,
            address: companyAddress,
            phone: companyPhone,
            email: companyEmail,
            businessType: businessType,
            setupDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Simpan ke localStorage
        localStorage.setItem('stockmint_company', JSON.stringify(companyData));
        localStorage.setItem('stockmint_setup_completed', 'true');
        
        this.showNotification('✅ Company information saved! Setup completed.', 'success');
        
        setTimeout(() => {
            window.location.hash = '#dashboard';
            window.location.reload();
        }, 1500);
    }
    
    handleFileUpload(file) {
        const reader = new FileReader();
        const uploadStatus = document.getElementById('uploadStatus');
        
        if (uploadStatus) {
            uploadStatus.innerHTML = `
                <div style="background: #fef3c7; padding: 10px; border-radius: 5px;">
                    <i class="fas fa-spinner fa-spin"></i> Processing file: ${file.name}...
                </div>
            `;
        }
        
        reader.onload = (e) => {
            try {
                // For demo purposes, simulate file processing
                setTimeout(() => {
                    // Mark migration as completed
                    localStorage.setItem('stockmint_setup_completed', 'true');
                    localStorage.setItem('stockmint_data_migrated', 'true');
                    
                    if (uploadStatus) {
                        uploadStatus.innerHTML = `
                            <div style="background: #d1fae5; padding: 10px; border-radius: 5px;">
                                <i class="fas fa-check-circle"></i> File processed successfully!
                            </div>
                        `;
                    }
                    
                    this.showNotification('✅ Data migration completed successfully!', 'success');
                    
                    // Redirect after 2 seconds
                    setTimeout(() => {
                        window.location.hash = '#dashboard';
                        window.location.reload();
                    }, 2000);
                }, 2000);
                
            } catch (error) {
                if (uploadStatus) {
                    uploadStatus.innerHTML = `
                        <div style="background: #fee2e2; padding: 10px; border-radius: 5px;">
                            <i class="fas fa-exclamation-circle"></i> Error: ${error.message}
                        </div>
                    `;
                }
                this.showNotification(`❌ Error reading file: ${error.message}`, 'error');
            }
        };
        
        reader.onerror = () => {
            if (uploadStatus) {
                uploadStatus.innerHTML = `
                    <div style="background: #fee2e2; padding: 10px; border-radius: 5px;">
                        <i class="fas fa-exclamation-circle"></i> Failed to read file
                    </div>
                `;
            }
            this.showNotification('❌ Failed to read file', 'error');
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
        
        // Save to localStorage
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
                window.location.hash = '#dashboard';
                window.location.reload();
            }, 1500);
        }, 2000);
    }

    resetAllData(completeReset = false) {
        const confirmation = completeReset ? 
            '⚠️ WARNING: This will delete ALL your data including:\n\n• Company Information\n• All Products\n• All Suppliers\n• All Customers\n• All Categories\n• All Transaction History\n• All Settings\n\nAre you sure you want to reset ALL data?' :
            '⚠️ This will delete your setup data so you can start over. Your user account will be preserved.\n\nAre you sure?';
        
        if (confirm(confirmation)) {
            if (completeReset) {
                // Clear ALL stockmint data
                const keys = Object.keys(localStorage).filter(key => key.startsWith('stockmint_'));
                keys.forEach(key => localStorage.removeItem(key));
                
                // Reset user to demo
                localStorage.setItem('stockmint_user', JSON.stringify({ name: 'Guest', isDemo: true }));
                localStorage.setItem('stockmint_plan', 'demo');
                
                this.showNotification('✅ All data has been completely reset. You are now in DEMO mode.', 'success');
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                // Clear only setup data
                localStorage.removeItem('stockmint_setup_completed');
                localStorage.removeItem('stockmint_setup_current_step');
                localStorage.removeItem('stockmint_company');
                localStorage.removeItem('stockmint_warehouses');
                localStorage.removeItem('stockmint_suppliers');
                localStorage.removeItem('stockmint_customers');
                localStorage.removeItem('stockmint_categories');
                localStorage.removeItem('stockmint_products');
                localStorage.removeItem('stockmint_data_migrated');
                
                this.showNotification('✅ Setup data has been reset. You can start setup again.', 'success');
                
                setTimeout(() => {
                    window.location.hash = '#setup/start-new';
                    window.location.reload();
                }, 1000);
            }
        }
    }

    createBackup() {
        // Create backup data
        const backupData = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            data: {
                company: localStorage.getItem('stockmint_company'),
                products: localStorage.getItem('stockmint_products'),
                suppliers: localStorage.getItem('stockmint_suppliers'),
                customers: localStorage.getItem('stockmint_customers'),
                warehouses: localStorage.getItem('stockmint_warehouses'),
                categories: localStorage.getItem('stockmint_categories')
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

    exportData() {
        // For now, same as backup
        this.createBackup();
    }

    restoreBackup() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const backupData = JSON.parse(e.target.result);
                    
                    // Restore data
                    if (backupData.data.company) {
                        localStorage.setItem('stockmint_company', backupData.data.company);
                    }
                    if (backupData.data.products) {
                        localStorage.setItem('stockmint_products', backupData.data.products);
                    }
                    if (backupData.data.suppliers) {
                        localStorage.setItem('stockmint_suppliers', backupData.data.suppliers);
                    }
                    if (backupData.data.customers) {
                        localStorage.setItem('stockmint_customers', backupData.data.customers);
                    }
                    if (backupData.data.warehouses) {
                        localStorage.setItem('stockmint_warehouses', backupData.data.warehouses);
                    }
                    if (backupData.data.categories) {
                        localStorage.setItem('stockmint_categories', backupData.data.categories);
                    }
                    
                    this.showNotification('✅ Backup restored successfully!', 'success');
                    
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                    
                } catch (error) {
                    this.showNotification('❌ Invalid backup file', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    downloadTemplate() {
        // Create a simple template structure
        const templateData = {
            "Instructions": [
                ["STOCKMINT DATA TEMPLATE"],
                ["Instructions:"],
                ["1. Fill in data in the appropriate sheets"],
                ["2. Do not modify sheet names"],
                ["3. Required fields are marked with *"],
                ["4. Save file as .xlsx or .csv"],
                ["5. Upload back to StockMint"]
            ],
            "dim_Company": [
                ["Company Name*", "Tax ID", "Address", "Phone", "Email", "Business Type"],
                ["Your Company", "123456789", "123 Main St", "+123456789", "contact@company.com", "Retail"]
            ],
            "dim_Products": [
                ["Product Code*", "Product Name*", "Category", "Unit", "Cost Price", "Selling Price", "Stock Quantity"],
                ["PROD001", "Sample Product", "Electronics", "pcs", "10.00", "15.00", "100"]
            ],
            "dim_Categories": [
                ["Category ID*", "Category Name*", "Description"],
                ["CAT001", "Electronics", "Electronic devices and accessories"]
            ],
            "dim_Suppliers": [
                ["Supplier Code*", "Supplier Name*", "Contact Person", "Phone", "Email", "Address"],
                ["SUP001", "Sample Supplier", "John Doe", "+123456789", "supplier@example.com", "456 Supplier St"]
            ],
            "dim_Customers": [
                ["Customer Code*", "Customer Name*", "Contact Person", "Phone", "Email", "Address"],
                ["CUS001", "Sample Customer", "Jane Smith", "+987654321", "customer@example.com", "789 Customer Ave"]
            ]
        };
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Add each sheet
        for (const [sheetName, data] of Object.entries(templateData)) {
            const ws = XLSX.utils.aoa_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
        }
        
        // Download
        XLSX.writeFile(wb, "StockMint_Data_Template.xlsx");
        this.showNotification('✅ Template downloaded successfully!', 'success');
    }

    showNotification(message, type = 'info') {
        if (window.StockMintCommon && window.StockMintCommon.showNotification) {
            window.StockMintCommon.showNotification(message, type);
        } else if (window.StockMintApp && window.StockMintApp.showNotification) {
            window.StockMintApp.showNotification(message, type);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close"><i class="fas fa-times"></i></button>
            `;
            
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#d1fae5' : type === 'error' ? '#fee2e2' : '#f0f9ff'};
                color: ${type === 'success' ? '#065f46' : type === 'error' ? '#dc2626' : '#0369a1'};
                padding: 12px 16px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 10000;
                animation: slideIn 0.3s ease;
            `;
            
            document.body.appendChild(notification);
            
            // Auto remove after 3 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 3000);
            
            // Close button
            notification.querySelector('.notification-close').addEventListener('click', () => {
                notification.remove();
            });
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SetupWizard;
}

// Global
window.SetupWizard = SetupWizard;
window.SetupWizard.downloadTemplate = function() {
    const wizard = new SetupWizard();
    wizard.downloadTemplate();
};
