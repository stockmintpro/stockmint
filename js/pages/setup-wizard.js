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
                            <button class="btn-secondary" onclick="document.getElementById('uploadTemplate').click()">
                                <i class="fas fa-upload"></i> Upload Data
                            </button>
                            <button class="btn-secondary" onclick="this.createBackup()">
                                <i class="fas fa-save"></i> Backup Data
                            </button>
                            <button class="btn-secondary" onclick="this.resetAllData(false)" style="color: #f59e0b;">
                                <i class="fas fa-redo"></i> Reset Setup
                            </button>
                        </div>
                        
                        <input type="file" id="uploadTemplate" accept=".xlsx,.xls,.csv" style="display: none;" onchange="setupWizard.handleFileUpload(this.files[0])">
                        
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
                        ${[1,2,3,4,5,6].map(step => `
                            <div class="step-indicator ${this.currentStep >= step ? 'active' : ''} ${this.currentStep === step ? 'current' : ''}">
                                <div class="step-number">${step}</div>
                                <div class="step-label">${this.getStepLabel(step)}</div>
                            </div>
                            ${step < 6 ? `<div class="step-connector ${this.currentStep > step ? 'active' : ''}"></div>` : ''}
                        `).join('')}
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
                                    <button type="button" class="btn-secondary" onclick="setupWizard.handlePrevStep()">
                                        <i class="fas fa-arrow-left"></i> Previous
                                    </button>
                                ` : ''}
                            </div>
                            <div>
                                <button type="button" class="btn-secondary" onclick="window.location.hash='#dashboard'">
                                    <i class="fas fa-times"></i> Cancel Setup
                                </button>
                                ${this.currentStep < this.totalSteps ? `
                                    <button type="button" class="btn-primary" onclick="setupWizard.handleNextStep()" style="margin-left: 10px;">
                                        Continue <i class="fas fa-arrow-right"></i>
                                    </button>
                                ` : `
                                    <button type="button" class="btn-success" onclick="setupWizard.handleCompleteSetup()" style="margin-left: 10px;">
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
                    min-width: 800px;
                    padding: 0 10px;
                }
                
                .step-indicator {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                    z-index: 2;
                    min-width: 80px;
                    flex-shrink: 0;
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
                        min-width: 600px;
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

    getStepLabel(step) {
        const labels = ['Company', 'Warehouse', 'Supplier', 'Customer', 'Category', 'Product'];
        return labels[step - 1] || '';
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

    // SIMPLIFIED EVENT HANDLERS - Directly callable from onclick
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
        
        // Update the wizard display by reloading the hash
        window.location.hash = '#setup/start-new';
        // The main app should re-render the page
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
        const uploadStatus = document.getElementById('uploadStatus');
        
        if (uploadStatus) {
            uploadStatus.innerHTML = `
                <div style="background: #fef3c7; padding: 10px; border-radius: 5px;">
                    <i class="fas fa-spinner fa-spin"></i> Processing file: ${file.name}...
                </div>
            `;
        }
        
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

// Create global instance
window.setupWizard = new SetupWizard();
window.SetupWizard = SetupWizard;
