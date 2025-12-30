// setup-wizard.js - First-time setup page with multi-step wizard
class SetupWizard {
    constructor() {
        this.currentStep = parseInt(localStorage.getItem('stockmint_setup_current_step')) || 1;
        this.totalSteps = 6; // Company, Warehouse, Supplier, Customer, Category, Product
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
        this.loadSavedData();
    }

    loadSavedData() {
        // Load any previously saved data
        const savedCompany = localStorage.getItem('stockmint_company');
        if (savedCompany) {
            this.setupData.company = JSON.parse(savedCompany);
        }
        // Load temp setup data if exists
        const tempData = localStorage.getItem('stockmint_setup_temp');
        if (tempData) {
            this.setupData = { ...this.setupData, ...JSON.parse(tempData) };
        }
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
                <h1>🚀 First-Time Setup Wizard</h1>
                <p class="page-subtitle">Complete these 6 steps to set up your inventory system</p>
                
                <!-- Progress Steps -->
                <div class="setup-progress">
                    <div class="progress-container">
                        <div class="step-indicator ${this.currentStep >= 1 ? 'active' : ''} ${this.currentStep === 1 ? 'current' : ''}">
                            <div class="step-number">1</div>
                            <div class="step-label">Company</div>
                        </div>
                        <div class="step-connector ${this.currentStep >= 2 ? 'active' : ''}"></div>
                        <div class="step-indicator ${this.currentStep >= 2 ? 'active' : ''} ${this.currentStep === 2 ? 'current' : ''}">
                            <div class="step-number">2</div>
                            <div class="step-label">Warehouse</div>
                        </div>
                        <div class="step-connector ${this.currentStep >= 3 ? 'active' : ''}"></div>
                        <div class="step-indicator ${this.currentStep >= 3 ? 'active' : ''} ${this.currentStep === 3 ? 'current' : ''}">
                            <div class="step-number">3</div>
                            <div class="step-label">Supplier</div>
                        </div>
                        <div class="step-connector ${this.currentStep >= 4 ? 'active' : ''}"></div>
                        <div class="step-indicator ${this.currentStep >= 4 ? 'active' : ''} ${this.currentStep === 4 ? 'current' : ''}">
                            <div class="step-number">4</div>
                            <div class="step-label">Customer</div>
                        </div>
                        <div class="step-connector ${this.currentStep >= 5 ? 'active' : ''}"></div>
                        <div class="step-indicator ${this.currentStep >= 5 ? 'active' : ''} ${this.currentStep === 5 ? 'current' : ''}">
                            <div class="step-number">5</div>
                            <div class="step-label">Category</div>
                        </div>
                        <div class="step-connector ${this.currentStep >= 6 ? 'active' : ''}"></div>
                        <div class="step-indicator ${this.currentStep >= 6 ? 'active' : ''} ${this.currentStep === 6 ? 'current' : ''}">
                            <div class="step-number">6</div>
                            <div class="step-label">Product</div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-${this.getStepIcon()}"></i> ${this.getStepTitle()}</h3>
                        <p>${this.getStepDescription()}</p>
                    </div>
                    <div class="card-body">
                        ${this.renderCurrentStep()}
                        
                        <div class="setup-navigation" style="display: flex; justify-content: space-between; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                            <div>
                                ${this.currentStep > 1 ? `
                                    <button type="button" class="btn-secondary" id="prevStepBtn">
                                        <i class="fas fa-arrow-left"></i> Previous
                                    </button>
                                ` : ''}
                            </div>
                            <div>
                                <button type="button" class="btn-secondary" onclick="window.location.hash='#dashboard'">
                                    <i class="fas fa-times"></i> Cancel Setup
                                </button>
                                ${this.currentStep < this.totalSteps ? `
                                    <button type="button" class="btn-primary" id="nextStepBtn" style="margin-left: 10px;">
                                        Continue <i class="fas fa-arrow-right"></i>
                                    </button>
                                ` : `
                                    <button type="button" class="btn-success" id="completeSetupBtn" style="margin-left: 10px;">
                                        <i class="fas fa-check-circle"></i> Complete Setup
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="setup-tips" style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #19BEBB;">
                    <h4><i class="fas fa-lightbulb"></i> Setup Tips:</h4>
                    <p>${this.getStepTips()}</p>
                </div>
            </div>
            
            <style>
                .setup-progress {
                    margin: 30px 0;
                    width: 100%;
                    overflow-x: auto;
                }
                
                .progress-container {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    min-width: 600px;
                    position: relative;
                }
                
                .step-indicator {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                    z-index: 2;
                    min-width: 80px;
                }
                
                .step-number {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #e9ecef;
                    color: #6c757d;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 16px;
                    margin-bottom: 8px;
                    transition: all 0.3s ease;
                }
                
                .step-label {
                    font-size: 12px;
                    color: #6c757d;
                    text-align: center;
                    white-space: nowrap;
                }
                
                .step-indicator.active .step-number {
                    background: #19BEBB;
                    color: white;
                }
                
                .step-indicator.current .step-number {
                    box-shadow: 0 0 0 4px rgba(25, 190, 187, 0.2);
                    animation: pulse 2s infinite;
                }
                
                .step-connector {
                    flex: 1;
                    height: 2px;
                    background: #e9ecef;
                    margin: 0 5px;
                    transition: all 0.3s ease;
                }
                
                .step-connector.active {
                    background: #19BEBB;
                }
                
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(25, 190, 187, 0.4); }
                    70% { box-shadow: 0 0 0 6px rgba(25, 190, 187, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(25, 190, 187, 0); }
                }
                
                @media (max-width: 768px) {
                    .progress-container {
                        min-width: 800px; /* Lebih lebar untuk mobile scrolling */
                    }
                    
                    .step-indicator {
                        min-width: 60px;
                    }
                    
                    .step-number {
                        width: 32px;
                        height: 32px;
                        font-size: 14px;
                    }
                    
                    .step-label {
                        font-size: 10px;
                    }
                    
                    .step-connector {
                        margin: 0 2px;
                    }
                }
                
                @media (min-width: 769px) and (max-width: 1200px) {
                    .progress-container {
                        min-width: 700px;
                    }
                }
                
                @media (min-width: 1201px) {
                    .progress-container {
                        min-width: 800px;
                    }
                }
                
                .btn-success {
                    background: #10b981;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }
                
                .btn-success:hover {
                    background: #0da271;
                    transform: translateY(-2px);
                }
            </style>
        `;
    }

    getStepIcon() {
        const icons = ['building', 'warehouse', 'truck', 'users', 'tags', 'box'];
        return icons[this.currentStep - 1] || 'check-circle';
    }

    getStepTitle() {
        const titles = [
            'Company Information',
            'Warehouse Setup',
            'Supplier Information',
            'Customer Information',
            'Product Category',
            'Add First Product'
        ];
        return titles[this.currentStep - 1] || 'Setup Complete';
    }

    getStepDescription() {
        const descriptions = [
            'Tell us about your business',
            'Where do you store your inventory?',
            'Who supplies your products?',
            'Who are your customers?',
            'How do you categorize products?',
            'Add your first product to inventory'
        ];
        return descriptions[this.currentStep - 1] || '';
    }

    getStepTips() {
        const tips = [
            'Your company information will appear on invoices and reports.',
            'You can add more warehouses later from the Master Data menu.',
            'Add your main supplier. You can add more suppliers later.',
            'Add your main customer. You can add more customers later.',
            'Create categories to organize your products effectively.',
            'This will be your first inventory item. You can add more products later.'
        ];
        return tips[this.currentStep - 1] || '';
    }

    renderCurrentStep() {
        switch(this.currentStep) {
            case 1:
                return this.renderStepCompany();
            case 2:
                return this.renderStepWarehouse();
            case 3:
                return this.renderStepSupplier();
            case 4:
                return this.renderStepCustomer();
            case 5:
                return this.renderStepCategory();
            case 6:
                return this.renderStepProduct();
            default:
                return '<p>Invalid step</p>';
        }
    }

    renderStepCompany() {
        const company = this.setupData.company || {};
        return `
            <form id="stepForm" onsubmit="return false;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label>Company Name *</label>
                        <input type="text" id="companyName" class="form-control" required 
                               value="${company.name || ''}" placeholder="Enter company name">
                    </div>
                    <div>
                        <label>Tax ID</label>
                        <input type="text" id="companyTaxId" class="form-control" 
                               value="${company.taxId || ''}" placeholder="Enter tax ID (optional)">
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label>Address</label>
                    <textarea id="companyAddress" class="form-control" rows="3" 
                              placeholder="Enter company address">${company.address || ''}</textarea>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label>Phone Number</label>
                        <input type="tel" id="companyPhone" class="form-control" 
                               value="${company.phone || ''}" placeholder="Enter phone number">
                    </div>
                    <div>
                        <label>Email</label>
                        <input type="email" id="companyEmail" class="form-control" 
                               value="${company.email || ''}" placeholder="Enter email address">
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label>Business Type</label>
                    <select id="businessType" class="form-control">
                        <option value="">Select business type</option>
                        <option value="retail" ${company.businessType === 'retail' ? 'selected' : ''}>Retail</option>
                        <option value="wholesale" ${company.businessType === 'wholesale' ? 'selected' : ''}>Wholesale</option>
                        <option value="manufacturing" ${company.businessType === 'manufacturing' ? 'selected' : ''}>Manufacturing</option>
                        <option value="ecommerce" ${company.businessType === 'ecommerce' ? 'selected' : ''}>E-commerce</option>
                        <option value="services" ${company.businessType === 'services' ? 'selected' : ''}>Services</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label>
                        <input type="checkbox" id="agreeTerms" required ${company.agreeTerms ? 'checked' : ''}> 
                        I agree to the Terms of Service and Privacy Policy
                    </label>
                </div>
            </form>
        `;
    }

    renderStepWarehouse() {
        const warehouse = this.setupData.warehouse || {};
        return `
            <form id="stepForm" onsubmit="return false;">
                <div style="margin-bottom: 20px;">
                    <label>Warehouse Name *</label>
                    <input type="text" id="warehouseName" class="form-control" required 
                           value="${warehouse.name || ''}" placeholder="e.g., Main Warehouse, Storefront">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label>Location/Area *</label>
                        <input type="text" id="warehouseLocation" class="form-control" required 
                               value="${warehouse.location || ''}" placeholder="e.g., Downtown, Industrial Area">
                    </div>
                    <div>
                        <label>Warehouse Code</label>
                        <input type="text" id="warehouseCode" class="form-control" 
                               value="${warehouse.code || 'WH001'}" placeholder="Auto-generated">
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label>Address</label>
                    <textarea id="warehouseAddress" class="form-control" rows="2" 
                              placeholder="Warehouse address (optional)">${warehouse.address || ''}</textarea>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label>Contact Person</label>
                        <input type="text" id="warehouseContact" class="form-control" 
                               value="${warehouse.contactPerson || ''}" placeholder="Warehouse manager">
                    </div>
                    <div>
                        <label>Contact Phone</label>
                        <input type="tel" id="warehousePhone" class="form-control" 
                               value="${warehouse.phone || ''}" placeholder="Warehouse phone">
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label>
                        <input type="checkbox" id="isPrimaryWarehouse" ${warehouse.isPrimary !== false ? 'checked' : ''}> 
                        Set as primary warehouse
                    </label>
                    <small style="display: block; color: #666; margin-top: 5px;">
                        Primary warehouse is used as default for inventory operations.
                    </small>
                </div>
            </form>
        `;
    }

    renderStepSupplier() {
        const supplier = this.setupData.supplier || {};
        return `
            <form id="stepForm" onsubmit="return false;">
                <div style="margin-bottom: 20px;">
                    <label>Supplier Name *</label>
                    <input type="text" id="supplierName" class="form-control" required 
                           value="${supplier.name || ''}" placeholder="e.g., PT. Supplier Jaya">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label>Supplier Code</label>
                        <input type="text" id="supplierCode" class="form-control" 
                               value="${supplier.code || 'SUP001'}" placeholder="Auto-generated">
                    </div>
                    <div>
                        <label>Contact Person</label>
                        <input type="text" id="supplierContact" class="form-control" 
                               value="${supplier.contactPerson || ''}" placeholder="Contact person name">
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label>Address</label>
                    <textarea id="supplierAddress" class="form-control" rows="2" 
                              placeholder="Supplier address">${supplier.address || ''}</textarea>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label>Phone Number</label>
                        <input type="tel" id="supplierPhone" class="form-control" 
                               value="${supplier.phone || ''}" placeholder="Supplier phone">
                    </div>
                    <div>
                        <label>Email</label>
                        <input type="email" id="supplierEmail" class="form-control" 
                               value="${supplier.email || ''}" placeholder="Supplier email">
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label>Payment Terms</label>
                        <select id="paymentTerms" class="form-control">
                            <option value="">Select payment terms</option>
                            <option value="cash" ${supplier.paymentTerms === 'cash' ? 'selected' : ''}>Cash on Delivery</option>
                            <option value="7days" ${supplier.paymentTerms === '7days' ? 'selected' : ''}>Net 7 Days</option>
                            <option value="14days" ${supplier.paymentTerms === '14days' ? 'selected' : ''}>Net 14 Days</option>
                            <option value="30days" ${supplier.paymentTerms === '30days' ? 'selected' : ''}>Net 30 Days</option>
                        </select>
                    </div>
                    <div>
                        <label>Tax ID</label>
                        <input type="text" id="supplierTaxId" class="form-control" 
                               value="${supplier.taxId || ''}" placeholder="Supplier tax ID">
                    </div>
                </div>
            </form>
        `;
    }

    renderStepCustomer() {
        const customer = this.setupData.customer || {};
        return `
            <form id="stepForm" onsubmit="return false;">
                <div style="margin-bottom: 20px;">
                    <label>Customer Name *</label>
                    <input type="text" id="customerName" class="form-control" required 
                           value="${customer.name || ''}" placeholder="e.g., John Doe, PT. Customer Maju">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label>Customer Code</label>
                        <input type="text" id="customerCode" class="form-control" 
                               value="${customer.code || 'CUST001'}" placeholder="Auto-generated">
                    </div>
                    <div>
                        <label>Customer Type</label>
                        <select id="customerType" class="form-control">
                            <option value="retail" ${customer.type === 'retail' ? 'selected' : ''}>Retail</option>
                            <option value="wholesale" ${customer.type === 'wholesale' ? 'selected' : ''}>Wholesale</option>
                            <option value="corporate" ${customer.type === 'corporate' ? 'selected' : ''}>Corporate</option>
                        </select>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label>Address</label>
                    <textarea id="customerAddress" class="form-control" rows="2" 
                              placeholder="Customer address">${customer.address || ''}</textarea>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label>Phone Number</label>
                        <input type="tel" id="customerPhone" class="form-control" 
                               value="${customer.phone || ''}" placeholder="Customer phone">
                    </div>
                    <div>
                        <label>Email</label>
                        <input type="email" id="customerEmail" class="form-control" 
                               value="${customer.email || ''}" placeholder="Customer email">
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label>Payment Terms</label>
                        <select id="customerPaymentTerms" class="form-control">
                            <option value="cash" ${customer.paymentTerms === 'cash' ? 'selected' : ''}>Cash</option>
                            <option value="7days" ${customer.paymentTerms === '7days' ? 'selected' : ''}>Net 7 Days</option>
                            <option value="14days" ${customer.paymentTerms === '14days' ? 'selected' : ''}>Net 14 Days</option>
                            <option value="30days" ${customer.paymentTerms === '30days' ? 'selected' : ''}>Net 30 Days</option>
                        </select>
                    </div>
                    <div>
                        <label>Credit Limit</label>
                        <input type="number" id="creditLimit" class="form-control" 
                               value="${customer.creditLimit || '0'}" placeholder="0 for no limit">
                    </div>
                </div>
            </form>
        `;
    }

    renderStepCategory() {
        const category = this.setupData.category || {};
        return `
            <form id="stepForm" onsubmit="return false;">
                <div style="margin-bottom: 20px;">
                    <label>Category Name *</label>
                    <input type="text" id="categoryName" class="form-control" required 
                           value="${category.name || ''}" placeholder="e.g., Electronics, Grocery, Clothing">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label>Category Code</label>
                        <input type="text" id="categoryCode" class="form-control" 
                               value="${category.code || 'CAT001'}" placeholder="Auto-generated">
                    </div>
                    <div>
                        <label>Parent Category</label>
                        <select id="parentCategory" class="form-control">
                            <option value="">None (Main Category)</option>
                            <!-- Will be populated with existing categories -->
                        </select>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label>Description</label>
                    <textarea id="categoryDescription" class="form-control" rows="3" 
                              placeholder="Describe this category">${category.description || ''}</textarea>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label>Category Color</label>
                    <div style="display: flex; gap: 10px; align-items: center; margin-top: 5px; flex-wrap: wrap;">
                        ${['#19BEBB', '#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map(color => `
                            <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                                <input type="radio" name="categoryColor" value="${color}" 
                                       ${category.color === color ? 'checked' : (color === '#19BEBB' && !category.color ? 'checked' : '')}>
                                <span style="display: inline-block; width: 24px; height: 24px; border-radius: 4px; background: ${color}; border: 2px solid ${color === '#19BEBB' && !category.color ? '#333' : 'transparent'};"></span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            </form>
        `;
    }

    renderStepProduct() {
        const product = this.setupData.product || {};
        return `
            <form id="stepForm" onsubmit="return false;">
                <div style="margin-bottom: 20px;">
                    <label>Product Name *</label>
                    <input type="text" id="productName" class="form-control" required 
                           value="${product.name || ''}" placeholder="e.g., iPhone 15, Rice 5kg">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label>Product Code/SKU *</label>
                        <input type="text" id="productCode" class="form-control" required 
                               value="${product.code || 'PROD001'}" placeholder="Unique product code">
                    </div>
                    <div>
                        <label>Barcode (Optional)</label>
                        <input type="text" id="productBarcode" class="form-control" 
                               value="${product.barcode || ''}" placeholder="Barcode number">
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label>Category</label>
                        <select id="productCategory" class="form-control" required>
                            <option value="">Select category</option>
                            <option value="CAT001" ${product.categoryId === 'CAT001' ? 'selected' : ''}>Sample Category</option>
                        </select>
                    </div>
                    <div>
                        <label>Unit of Measurement</label>
                        <select id="productUnit" class="form-control" required>
                            <option value="">Select unit</option>
                            <option value="pcs" ${product.unit === 'pcs' ? 'selected' : ''}>Pieces (pcs)</option>
                            <option value="kg" ${product.unit === 'kg' ? 'selected' : ''}>Kilogram (kg)</option>
                            <option value="gram" ${product.unit === 'gram' ? 'selected' : ''}>Gram (g)</option>
                            <option value="liter" ${product.unit === 'liter' ? 'selected' : ''}>Liter (L)</option>
                            <option value="pack" ${product.unit === 'pack' ? 'selected' : ''}>Pack</option>
                            <option value="box" ${product.unit === 'box' ? 'selected' : ''}>Box</option>
                        </select>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label>Cost Price *</label>
                        <div style="position: relative;">
                            <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #666;">Rp</span>
                            <input type="number" id="costPrice" class="form-control" required 
                                   value="${product.costPrice || ''}" placeholder="0" 
                                   style="padding-left: 30px;" step="0.01" min="0">
                        </div>
                    </div>
                    <div>
                        <label>Selling Price *</label>
                        <div style="position: relative;">
                            <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #666;">Rp</span>
                            <input type="number" id="sellingPrice" class="form-control" required 
                                   value="${product.sellingPrice || ''}" placeholder="0" 
                                   style="padding-left: 30px;" step="0.01" min="0">
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label>Initial Stock</label>
                        <input type="number" id="initialStock" class="form-control" 
                               value="${product.initialStock || '0'}" placeholder="0" min="0">
                    </div>
                    <div>
                        <label>Reorder Level</label>
                        <input type="number" id="reorderLevel" class="form-control" 
                               value="${product.reorderLevel || '10'}" placeholder="10" min="0">
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label>Description</label>
                    <textarea id="productDescription" class="form-control" rows="3" 
                              placeholder="Product description">${product.description || ''}</textarea>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label>
                        <input type="checkbox" id="hasExpiryDate" ${product.hasExpiry ? 'checked' : ''}> 
                        This product has expiry date
                    </label>
                </div>
            </form>
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
                                    <button type="button" class="btn-primary" onclick="window.open('template.html', '_blank')">
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
                                        <button type="button" class="btn-secondary" id="uploadMigrationFile" style="padding: 12px 24px;">
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
                    background: ${this.isDemoUser ? '#fef3c7' : '#d1fae5'};
                    color: ${this.isDemoUser ? '#92400e' : '#065f46'};
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
        // Handle form submission for each step
        const nextBtn = document.getElementById('nextStepBtn');
        const prevBtn = document.getElementById('prevStepBtn');
        const completeBtn = document.getElementById('completeSetupBtn');
        
        // Remove existing event listeners first
        if (nextBtn) {
            nextBtn.replaceWith(nextBtn.cloneNode(true));
        }
        if (prevBtn) {
            prevBtn.replaceWith(prevBtn.cloneNode(true));
        }
        if (completeBtn) {
            completeBtn.replaceWith(completeBtn.cloneNode(true));
        }
        
        // Bind new event listeners
        if (nextBtn) {
            document.getElementById('nextStepBtn').addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNextStep();
            });
        }
        
        if (prevBtn) {
            document.getElementById('prevStepBtn').addEventListener('click', (e) => {
                e.preventDefault();
                this.handlePrevStep();
            });
        }
        
        if (completeBtn) {
            document.getElementById('completeSetupBtn').addEventListener('click', (e) => {
                e.preventDefault();
                this.handleCompleteSetup();
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

    handleNextStep() {
        try {
            this.saveCurrentStep();
            this.currentStep++;
            this.updateWizard();
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    handlePrevStep() {
        try {
            this.saveCurrentStep();
            this.currentStep--;
            this.updateWizard();
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    handleCompleteSetup() {
        try {
            this.saveCurrentStep();
            this.completeSetup();
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    updateWizard() {
        // Save current step to localStorage
        localStorage.setItem('stockmint_setup_current_step', this.currentStep.toString());
        
        // Update the wizard display
        const setupContainer = document.querySelector('.page-content');
        if (setupContainer) {
            setupContainer.innerHTML = this.renderStartNew();
            this.bindEvents();
            
            // Scroll to top
            window.scrollTo(0, 0);
        }
    }

    saveCurrentStep() {
        switch(this.currentStep) {
            case 1:
                this.saveCompanyData();
                break;
            case 2:
                this.saveWarehouseData();
                break;
            case 3:
                this.saveSupplierData();
                break;
            case 4:
                this.saveCustomerData();
                break;
            case 5:
                this.saveCategoryData();
                break;
            case 6:
                this.saveProductData();
                break;
        }
        
        // Save to temporary storage
        localStorage.setItem('stockmint_setup_temp', JSON.stringify(this.setupData));
    }

    saveCompanyData() {
        const companyName = document.getElementById('companyName')?.value;
        const companyTaxId = document.getElementById('companyTaxId')?.value || '';
        const companyAddress = document.getElementById('companyAddress')?.value || '';
        const companyPhone = document.getElementById('companyPhone')?.value || '';
        const companyEmail = document.getElementById('companyEmail')?.value || '';
        const businessType = document.getElementById('businessType')?.value || '';
        const agreeTerms = document.getElementById('agreeTerms')?.checked || false;
        
        if (!companyName) {
            this.showNotification('Company name is required', 'error');
            throw new Error('Company name required');
        }
        
        if (!agreeTerms) {
            this.showNotification('You must agree to the Terms of Service', 'error');
            throw new Error('Terms not agreed');
        }
        
        this.setupData.company = {
            id: 1,
            name: companyName,
            taxId: companyTaxId,
            address: companyAddress,
            phone: companyPhone,
            email: companyEmail,
            businessType: businessType,
            agreeTerms: agreeTerms,
            setupDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.showNotification('Company information saved', 'success');
    }

    saveWarehouseData() {
        const warehouseName = document.getElementById('warehouseName')?.value;
        const warehouseLocation = document.getElementById('warehouseLocation')?.value || '';
        const warehouseCode = document.getElementById('warehouseCode')?.value || 'WH001';
        const warehouseAddress = document.getElementById('warehouseAddress')?.value || '';
        const warehouseContact = document.getElementById('warehouseContact')?.value || '';
        const warehousePhone = document.getElementById('warehousePhone')?.value || '';
        const isPrimary = document.getElementById('isPrimaryWarehouse')?.checked || true;
        
        if (!warehouseName) {
            this.showNotification('Warehouse name is required', 'error');
            throw new Error('Warehouse name required');
        }
        
        if (!warehouseLocation) {
            this.showNotification('Warehouse location is required', 'error');
            throw new Error('Warehouse location required');
        }
        
        this.setupData.warehouse = {
            id: 1,
            name: warehouseName,
            location: warehouseLocation,
            code: warehouseCode,
            address: warehouseAddress,
            contactPerson: warehouseContact,
            phone: warehousePhone,
            isPrimary: isPrimary,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.showNotification('Warehouse information saved', 'success');
    }

    saveSupplierData() {
        const supplierName = document.getElementById('supplierName')?.value;
        const supplierCode = document.getElementById('supplierCode')?.value || 'SUP001';
        const supplierContact = document.getElementById('supplierContact')?.value || '';
        const supplierAddress = document.getElementById('supplierAddress')?.value || '';
        const supplierPhone = document.getElementById('supplierPhone')?.value || '';
        const supplierEmail = document.getElementById('supplierEmail')?.value || '';
        const paymentTerms = document.getElementById('paymentTerms')?.value || '';
        const supplierTaxId = document.getElementById('supplierTaxId')?.value || '';
        
        if (!supplierName) {
            this.showNotification('Supplier name is required', 'error');
            throw new Error('Supplier name required');
        }
        
        this.setupData.supplier = {
            id: 1,
            name: supplierName,
            code: supplierCode,
            contactPerson: supplierContact,
            address: supplierAddress,
            phone: supplierPhone,
            email: supplierEmail,
            paymentTerms: paymentTerms,
            taxId: supplierTaxId,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.showNotification('Supplier information saved', 'success');
    }

    saveCustomerData() {
        const customerName = document.getElementById('customerName')?.value;
        const customerCode = document.getElementById('customerCode')?.value || 'CUST001';
        const customerType = document.getElementById('customerType')?.value || 'retail';
        const customerAddress = document.getElementById('customerAddress')?.value || '';
        const customerPhone = document.getElementById('customerPhone')?.value || '';
        const customerEmail = document.getElementById('customerEmail')?.value || '';
        const paymentTerms = document.getElementById('customerPaymentTerms')?.value || 'cash';
        const creditLimit = document.getElementById('creditLimit')?.value || '0';
        
        if (!customerName) {
            this.showNotification('Customer name is required', 'error');
            throw new Error('Customer name required');
        }
        
        this.setupData.customer = {
            id: 1,
            name: customerName,
            code: customerCode,
            type: customerType,
            address: customerAddress,
            phone: customerPhone,
            email: customerEmail,
            paymentTerms: paymentTerms,
            creditLimit: parseFloat(creditLimit),
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.showNotification('Customer information saved', 'success');
    }

    saveCategoryData() {
        const categoryName = document.getElementById('categoryName')?.value;
        const categoryCode = document.getElementById('categoryCode')?.value || 'CAT001';
        const categoryDescription = document.getElementById('categoryDescription')?.value || '';
        const categoryColor = document.querySelector('input[name="categoryColor"]:checked')?.value || '#19BEBB';
        
        if (!categoryName) {
            this.showNotification('Category name is required', 'error');
            throw new Error('Category name required');
        }
        
        this.setupData.category = {
            id: 'CAT001',
            name: categoryName,
            code: categoryCode,
            description: categoryDescription,
            color: categoryColor,
            parentId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.showNotification('Category information saved', 'success');
    }

    saveProductData() {
        const productName = document.getElementById('productName')?.value;
        const productCode = document.getElementById('productCode')?.value;
        const productBarcode = document.getElementById('productBarcode')?.value || '';
        const productCategory = document.getElementById('productCategory')?.value || 'CAT001';
        const productUnit = document.getElementById('productUnit')?.value;
        const costPrice = document.getElementById('costPrice')?.value;
        const sellingPrice = document.getElementById('sellingPrice')?.value;
        const initialStock = document.getElementById('initialStock')?.value || '0';
        const reorderLevel = document.getElementById('reorderLevel')?.value || '10';
        const productDescription = document.getElementById('productDescription')?.value || '';
        const hasExpiry = document.getElementById('hasExpiryDate')?.checked || false;
        
        if (!productName || !productCode || !productUnit || !costPrice || !sellingPrice) {
            this.showNotification('Please fill all required fields', 'error');
            throw new Error('Required fields missing');
        }
        
        if (parseFloat(costPrice) <= 0) {
            this.showNotification('Cost price must be greater than 0', 'error');
            throw new Error('Invalid cost price');
        }
        
        if (parseFloat(sellingPrice) <= 0) {
            this.showNotification('Selling price must be greater than 0', 'error');
            throw new Error('Invalid selling price');
        }
        
        if (parseFloat(sellingPrice) < parseFloat(costPrice)) {
            this.showNotification('Selling price should be higher than cost price', 'warning');
        }
        
        this.setupData.product = {
            id: productCode,
            name: productName,
            code: productCode,
            barcode: productBarcode,
            categoryId: productCategory,
            unit: productUnit,
            costPrice: parseFloat(costPrice),
            sellingPrice: parseFloat(sellingPrice),
            initialStock: parseInt(initialStock),
            currentStock: parseInt(initialStock),
            reorderLevel: parseInt(reorderLevel),
            description: productDescription,
            hasExpiry: hasExpiry,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.showNotification('Product information saved', 'success');
    }

    completeSetup() {
        try {
            // Save all data to localStorage
            this.saveAllDataToStorage();
            
            // Mark setup as completed
            localStorage.setItem('stockmint_setup_completed', 'true');
            localStorage.removeItem('stockmint_setup_current_step');
            localStorage.removeItem('stockmint_setup_temp');
            
            // Create opening stock entry
            this.createOpeningStock();
            
            this.showNotification('✅ Setup completed successfully! Your system is now ready.', 'success');
            
            setTimeout(() => {
                window.location.hash = '#dashboard';
                window.location.reload();
            }, 2000);
            
        } catch (error) {
            this.showNotification(`❌ Error: ${error.message}`, 'error');
        }
    }

    saveAllDataToStorage() {
        // Save company
        if (this.setupData.company) {
            localStorage.setItem('stockmint_company', JSON.stringify(this.setupData.company));
        }
        
        // Save warehouse (as array)
        if (this.setupData.warehouse) {
            const warehouses = [this.setupData.warehouse];
            localStorage.setItem('stockmint_warehouses', JSON.stringify(warehouses));
        }
        
        // Save supplier (as array)
        if (this.setupData.supplier) {
            const suppliers = [this.setupData.supplier];
            localStorage.setItem('stockmint_suppliers', JSON.stringify(suppliers));
        }
        
        // Save customer (as array)
        if (this.setupData.customer) {
            const customers = [this.setupData.customer];
            localStorage.setItem('stockmint_customers', JSON.stringify(customers));
        }
        
        // Save category (as array)
        if (this.setupData.category) {
            const categories = [this.setupData.category];
            localStorage.setItem('stockmint_categories', JSON.stringify(categories));
        }
        
        // Save product (as array)
        if (this.setupData.product) {
            const products = [this.setupData.product];
            localStorage.setItem('stockmint_products', JSON.stringify(products));
        }
    }

    createOpeningStock() {
        if (this.setupData.product && this.setupData.warehouse) {
            const openingStock = {
                id: `OS${Date.now()}`,
                productId: this.setupData.product.id,
                warehouseId: this.setupData.warehouse.id,
                quantity: this.setupData.product.initialStock || 0,
                date: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };
            
            // Save opening stock
            const existingStock = JSON.parse(localStorage.getItem('stockmint_opening_stock') || '[]');
            existingStock.push(openingStock);
            localStorage.setItem('stockmint_opening_stock', JSON.stringify(existingStock));
            
            // Create product-supplier-warehouse relationship
            if (this.setupData.supplier) {
                const relationship = {
                    id: `REL${Date.now()}`,
                    productId: this.setupData.product.id,
                    supplierId: this.setupData.supplier.id,
                    warehouseId: this.setupData.warehouse.id,
                    isPrimarySupplier: true,
                    isPrimaryWarehouse: true,
                    createdAt: new Date().toISOString()
                };
                
                const existingRelations = JSON.parse(localStorage.getItem('stockmint_product_supplier_warehouse') || '[]');
                existingRelations.push(relationship);
                localStorage.setItem('stockmint_product_supplier_warehouse', JSON.stringify(existingRelations));
            }
        }
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
                localStorage.removeItem('stockmint_setup_temp');
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
                ["COMPANY_ID", "COMPANY_NAME", "STREET", "ZIP_CODE", "CITY", "COUNTRY", "ADDITIONAL_ADDRESS", "PHONE1", "PHONE2", "FAX", "EMAIL", "TAX_NO", "FISCAL_CODE", "WEBSITE", "LOGO_URL", "DEFAULT_WAREHOUSE_ID", "DEFAULT_CURRENCY", "DECIMAL_PLACES"],
                [1, "Your Company", "123 Main St", "12345", "Your City", "Your Country", "", "+123456789", "", "", "contact@company.com", "123456789", "", "", "", 1, "Rp.", 0]
            ],
            "dim_Warehouses": [
                ["STORAGE_ID", "STORAGE_NAME", "STORAGE_AREA", "IS_PRIMARY"],
                [1, "Main Warehouse", "Your Area", 1]
            ],
            "dim_Products": [
                ["PRODUCT_ID", "PRODUCT_NAME", "DESCRIPTION", "CATEGORY_ID", "UNIT", "SIZE", "COLOR", "HAS_EXPIRY", "ARCHIVE"],
                ["PROD001", "Sample Product", "Product description", "CAT001", "pcs", "250 gr", "", 1, 0]
            ],
            "dim_Categories": [
                ["CATEGORY_ID", "CATEGORY_NAME"],
                ["CAT001", "Sample Category"]
            ],
            "dim_Suppliers": [
                ["SUPPLIER_ID", "SUPPLIER_NAME", "STREET", "ZIP_CODE", "CITY", "COUNTRY", "ADDITIONAL_ADDRESS", "CONTACT_PERSON", "PHONE1", "PHONE2", "FAX", "EMAIL", "TAX_NO", "FISCAL_CODE", "WEBSITE", "ADDITIONAL_TEXT", "IS_ACTIVE"],
                [1, "Sample Supplier", "", "", "Supplier City", "Supplier Country", "", "John Doe", "+123456789", "", "", "supplier@example.com", "", "", "", "", 1]
            ],
            "dim_Customers": [
                ["CUSTOMER_ID", "CUSTOMER_NAME", "STREET", "ZIP_CODE", "CITY", "COUNTRY", "ADDITIONAL_ADDRESS", "CONTACT_PERSON", "PHONE1", "PHONE2", "FAX", "EMAIL", "TAX_NO", "FISCAL_CODE", "WEBSITE", "CUSTOMER_TYPE", "CREDIT_LIMIT", "IS_ACTIVE"],
                [1, "Sample Customer", "", "", "Customer City", "Customer Country", "", "Jane Smith", "+987654321", "", "", "customer@example.com", "", "", "", "RETAIL", 1000000, 1]
            ],
            "Product_Supplier_Warehouse": [
                ["LINK_ID", "PRODUCT_ID", "SUPPLIER_ID", "WAREHOUSE_ID", "IS_PRIMARY_SUPPLIER", "IS_PRIMARY_WAREHOUSE"],
                ["LINK00001", "PROD001", 1, 1, 1, 1]
            ],
            "Opening_Stock": [
                ["PRODUCT_ID", "WAREHOUSE_ID", "OPENING_QTY", "AS_OF_DATE"],
                ["PROD001", 1, 100, "${new Date().toISOString().slice(0,10)} 00:00:00"]
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
        XLSX.writeFile(wb, "StockMint_Setup_Template.xlsx");
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
