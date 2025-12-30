// setup-wizard-multi.js - Multi-step setup wizard
class SetupWizardMulti {
    constructor() {
        this.currentStep = this.getCurrentStep();
        this.totalSteps = 6;
        this.setupData = this.loadSavedData();
    }
    
    getCurrentStep() {
        const savedStep = localStorage.getItem('stockmint_setup_current_step');
        if (savedStep) return savedStep;
        
        // Cek data yang sudah ada
        const hasCompany = localStorage.getItem('stockmint_company');
        const hasWarehouse = localStorage.getItem('stockmint_warehouses');
        const hasSupplier = localStorage.getItem('stockmint_suppliers');
        const hasCustomer = localStorage.getItem('stockmint_customers');
        const hasCategory = localStorage.getItem('stockmint_categories');
        const hasProduct = localStorage.getItem('stockmint_products');
        
        if (!hasCompany) return 'company';
        if (!hasWarehouse) return 'warehouse';
        if (!hasSupplier) return 'supplier';
        if (!hasCustomer) return 'customer';
        if (!hasCategory) return 'category';
        if (!hasProduct) return 'product';
        
        return 'complete';
    }
    
    loadSavedData() {
        return {
            company: JSON.parse(localStorage.getItem('stockmint_company') || '{}'),
            warehouses: JSON.parse(localStorage.getItem('stockmint_warehouses') || '[]'),
            suppliers: JSON.parse(localStorage.getItem('stockmint_suppliers') || '[]'),
            customers: JSON.parse(localStorage.getItem('stockmint_customers') || '[]'),
            categories: JSON.parse(localStorage.getItem('stockmint_categories') || '[]'),
            products: JSON.parse(localStorage.getItem('stockmint_products') || '[]')
        };
    }
    
    render() {
        const hash = window.location.hash.substring(1);
        const step = hash.split('/')[1] || this.currentStep;
        
        this.currentStep = step;
        
        switch(step) {
            case 'company':
                return this.renderCompanyStep();
            case 'warehouse':
                return this.renderWarehouseStep();
            case 'supplier':
                return this.renderSupplierStep();
            case 'customer':
                return this.renderCustomerStep();
            case 'category':
                return this.renderCategoryStep();
            case 'product':
                return this.renderProductStep();
            case 'complete':
                return this.renderCompleteStep();
            default:
                return this.renderCompanyStep();
        }
    }
    
    // ===== RENDER EACH STEP =====
    
    renderCompanyStep() {
        const savedData = this.setupData.company || {};
        
        return `
            <div class="page-content">
                <div class="setup-header">
                    <h1>🏢 Company Information</h1>
                    <p class="page-subtitle">Step 1 of ${this.totalSteps} - Tell us about your business</p>
                    
                    <div class="setup-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(1/this.totalSteps)*100}%"></div>
                        </div>
                        <div class="progress-steps">
                            <span class="step active">1</span>
                            <span class="step">2</span>
                            <span class="step">3</span>
                            <span class="step">4</span>
                            <span class="step">5</span>
                            <span class="step">6</span>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-building"></i> Company Details</h3>
                        <p>This information will appear on your invoices and reports</p>
                    </div>
                    <div class="card-body">
                        <form id="companyForm">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="companyName">Company Name *</label>
                                    <input type="text" id="companyName" class="form-control" 
                                           value="${savedData.name || ''}" required 
                                           placeholder="e.g., PT. Usaha Maju Jaya">
                                </div>
                                
                                <div class="form-group">
                                    <label for="companyTaxId">Tax ID (NPWP)</label>
                                    <input type="text" id="companyTaxId" class="form-control" 
                                           value="${savedData.taxId || ''}" 
                                           placeholder="e.g., 01.234.567.8-912.000">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="companyAddress">Business Address</label>
                                <textarea id="companyAddress" class="form-control" rows="3" 
                                          placeholder="Full business address">${savedData.address || ''}</textarea>
                            </div>
                            
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="companyPhone">Phone Number</label>
                                    <input type="tel" id="companyPhone" class="form-control" 
                                           value="${savedData.phone || ''}" 
                                           placeholder="e.g., 021-12345678">
                                </div>
                                
                                <div class="form-group">
                                    <label for="companyEmail">Email Address</label>
                                    <input type="email" id="companyEmail" class="form-control" 
                                           value="${savedData.email || ''}" 
                                           placeholder="e.g., info@company.com">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="businessType">Business Type</label>
                                <select id="businessType" class="form-control">
                                    <option value="">Select your business type</option>
                                    <option value="retail" ${savedData.businessType === 'retail' ? 'selected' : ''}>Retail Store</option>
                                    <option value="wholesale" ${savedData.businessType === 'wholesale' ? 'selected' : ''}>Wholesale</option>
                                    <option value="ecommerce" ${savedData.businessType === 'ecommerce' ? 'selected' : ''}>E-commerce</option>
                                    <option value="manufacturing" ${savedData.businessType === 'manufacturing' ? 'selected' : ''}>Manufacturing</option>
                                    <option value="distributor" ${savedData.businessType === 'distributor' ? 'selected' : ''}>Distributor</option>
                                    <option value="service" ${savedData.businessType === 'service' ? 'selected' : ''}>Service</option>
                                </select>
                            </div>
                            
                            <div class="form-check" style="margin: 20px 0;">
                                <input type="checkbox" id="agreeTerms" class="form-check-input" required>
                                <label for="agreeTerms" class="form-check-label">
                                    I agree to the <a href="#" onclick="alert('Terms of Service')">Terms of Service</a> and <a href="#" onclick="alert('Privacy Policy')">Privacy Policy</a>
                                </label>
                            </div>
                            
                            <div class="setup-actions">
                                <button type="button" class="btn-secondary" onclick="window.location.hash='#dashboard'">
                                    <i class="fas fa-times"></i> Cancel Setup
                                </button>
                                <button type="submit" class="btn-primary">
                                    <i class="fas fa-arrow-right"></i> Next: Add Warehouse
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            
            <style>
                .setup-header {
                    margin-bottom: 30px;
                }
                
                .setup-progress {
                    margin: 20px 0 30px 0;
                }
                
                .progress-bar {
                    height: 6px;
                    background: #e9ecef;
                    border-radius: 3px;
                    overflow: hidden;
                    margin-bottom: 10px;
                }
                
                .progress-fill {
                    height: 100%;
                    background: #19BEBB;
                    border-radius: 3px;
                    transition: width 0.3s ease;
                }
                
                .progress-steps {
                    display: flex;
                    justify-content: space-between;
                    margin: 0 10px;
                }
                
                .step {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    background: #e9ecef;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    color: #6c757d;
                }
                
                .step.active {
                    background: #19BEBB;
                    color: white;
                }
                
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 20px;
                }
                
                @media (max-width: 768px) {
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                }
                
                .setup-actions {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                }
            </style>
        `;
    }
    
    renderWarehouseStep() {
        const savedWarehouses = this.setupData.warehouses || [];
        
        return `
            <div class="page-content">
                <div class="setup-header">
                    <h1>🏭 Warehouse Setup</h1>
                    <p class="page-subtitle">Step 2 of ${this.totalSteps} - Add your storage locations</p>
                    
                    <div class="setup-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(2/this.totalSteps)*100}%"></div>
                        </div>
                        <div class="progress-steps">
                            <span class="step completed">✓</span>
                            <span class="step active">2</span>
                            <span class="step">3</span>
                            <span class="step">4</span>
                            <span class="step">5</span>
                            <span class="step">6</span>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-warehouse"></i> Add Warehouse</h3>
                        <p>Warehouses are where you store your inventory. Add at least one warehouse.</p>
                    </div>
                    <div class="card-body">
                        <form id="warehouseForm">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="warehouseName">Warehouse Name *</label>
                                    <input type="text" id="warehouseName" class="form-control" required 
                                           placeholder="e.g., Main Warehouse">
                                </div>
                                
                                <div class="form-group">
                                    <label for="warehouseCode">Warehouse Code</label>
                                    <input type="text" id="warehouseCode" class="form-control" 
                                           placeholder="e.g., WH-001">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="warehouseAddress">Address</label>
                                <textarea id="warehouseAddress" class="form-control" rows="2" 
                                          placeholder="Warehouse address (optional)"></textarea>
                            </div>
                            
                            <div class="form-check" style="margin: 15px 0;">
                                <input type="checkbox" id="isPrimary" class="form-check-input" checked>
                                <label for="isPrimary" class="form-check-label">
                                    Set as primary warehouse (default storage location)
                                </label>
                            </div>
                            
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-plus"></i> Add Warehouse
                            </button>
                        </form>
                        
                        ${savedWarehouses.length > 0 ? `
                            <div class="saved-items" style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                                <h4><i class="fas fa-check-circle" style="color: #10b981;"></i> Added Warehouses (${savedWarehouses.length})</h4>
                                <div class="items-list">
                                    ${savedWarehouses.map((wh, index) => `
                                        <div class="item-card">
                                            <div class="item-header">
                                                <strong>${wh.name}</strong>
                                                ${wh.isPrimary ? '<span class="badge-primary">Primary</span>' : ''}
                                            </div>
                                            <div class="item-details">
                                                ${wh.code ? `Code: ${wh.code}` : ''}
                                                ${wh.address ? `<br>${wh.address}` : ''}
                                            </div>
                                            <button type="button" class="btn-remove" data-index="${index}">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="setup-actions">
                            <button type="button" class="btn-secondary" onclick="window.location.hash='#setup/company'">
                                <i class="fas fa-arrow-left"></i> Back
                            </button>
                            <button type="button" class="btn-primary" id="nextToSupplier" 
                                    ${savedWarehouses.length === 0 ? 'disabled' : ''}>
                                <i class="fas fa-arrow-right"></i> Next: Add Supplier
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .saved-items {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 20px;
                }
                
                .items-list {
                    margin-top: 15px;
                }
                
                .item-card {
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 6px;
                    padding: 15px;
                    margin-bottom: 10px;
                    position: relative;
                }
                
                .item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }
                
                .badge-primary {
                    background: #19BEBB;
                    color: white;
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                }
                
                .item-details {
                    color: #666;
                    font-size: 14px;
                }
                
                .btn-remove {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: #fee2e2;
                    border: none;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    color: #dc2626;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .step.completed {
                    background: #10b981;
                    color: white;
                }
            </style>
        `;
    }
    
    renderSupplierStep() {
        const savedSuppliers = this.setupData.suppliers || [];
        
        return `
            <div class="page-content">
                <div class="setup-header">
                    <h1>🤝 Supplier Setup</h1>
                    <p class="page-subtitle">Step 3 of ${this.totalSteps} - Add your suppliers</p>
                    
                    <div class="setup-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(3/this.totalSteps)*100}%"></div>
                        </div>
                        <div class="progress-steps">
                            <span class="step completed">✓</span>
                            <span class="step completed">✓</span>
                            <span class="step active">3</span>
                            <span class="step">4</span>
                            <span class="step">5</span>
                            <span class="step">6</span>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-truck"></i> Add Supplier</h3>
                        <p>Suppliers are companies that provide you with products. Add at least one supplier.</p>
                    </div>
                    <div class="card-body">
                        <form id="supplierForm">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="supplierName">Supplier Name *</label>
                                    <input type="text" id="supplierName" class="form-control" required 
                                           placeholder="e.g., PT. Supplier Maju">
                                </div>
                                
                                <div class="form-group">
                                    <label for="supplierCode">Supplier Code</label>
                                    <input type="text" id="supplierCode" class="form-control" 
                                           placeholder="e.g., SUP-001">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="supplierContact">Contact Person</label>
                                <input type="text" id="supplierContact" class="form-control" 
                                       placeholder="e.g., John Doe">
                            </div>
                            
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="supplierPhone">Phone Number</label>
                                    <input type="tel" id="supplierPhone" class="form-control" 
                                           placeholder="e.g., 08123456789">
                                </div>
                                
                                <div class="form-group">
                                    <label for="supplierEmail">Email</label>
                                    <input type="email" id="supplierEmail" class="form-control" 
                                           placeholder="e.g., supplier@email.com">
                                </div>
                            </div>
                            
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-plus"></i> Add Supplier
                            </button>
                        </form>
                        
                        ${savedSuppliers.length > 0 ? `
                            <div class="saved-items" style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                                <h4><i class="fas fa-check-circle" style="color: #10b981;"></i> Added Suppliers (${savedSuppliers.length})</h4>
                                <div class="items-list">
                                    ${savedSuppliers.map((sup, index) => `
                                        <div class="item-card">
                                            <div class="item-header">
                                                <strong>${sup.name}</strong>
                                            </div>
                                            <div class="item-details">
                                                ${sup.contact ? `Contact: ${sup.contact}` : ''}
                                                ${sup.phone ? `<br>Phone: ${sup.phone}` : ''}
                                                ${sup.code ? `<br>Code: ${sup.code}` : ''}
                                            </div>
                                            <button type="button" class="btn-remove" data-index="${index}" data-type="supplier">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="setup-actions">
                            <button type="button" class="btn-secondary" onclick="window.location.hash='#setup/warehouse'">
                                <i class="fas fa-arrow-left"></i> Back
                            </button>
                            <button type="button" class="btn-primary" id="nextToCustomer" 
                                    ${savedSuppliers.length === 0 ? 'disabled' : ''}>
                                <i class="fas fa-arrow-right"></i> Next: Add Customer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderCustomerStep() {
        const savedCustomers = this.setupData.customers || [];
        
        return `
            <div class="page-content">
                <div class="setup-header">
                    <h1>👥 Customer Setup</h1>
                    <p class="page-subtitle">Step 4 of ${this.totalSteps} - Add your customers</p>
                    
                    <div class="setup-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(4/this.totalSteps)*100}%"></div>
                        </div>
                        <div class="progress-steps">
                            <span class="step completed">✓</span>
                            <span class="step completed">✓</span>
                            <span class="step completed">✓</span>
                            <span class="step active">4</span>
                            <span class="step">5</span>
                            <span class="step">6</span>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-users"></i> Add Customer</h3>
                        <p>Customers are who buy products from you. Add at least one customer.</p>
                    </div>
                    <div class="card-body">
                        <form id="customerForm">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="customerName">Customer Name *</label>
                                    <input type="text" id="customerName" class="form-control" required 
                                           placeholder="e.g., PT. Pelanggan Setia">
                                </div>
                                
                                <div class="form-group">
                                    <label for="customerType">Customer Type</label>
                                    <select id="customerType" class="form-control">
                                        <option value="retail">Retail</option>
                                        <option value="wholesale">Wholesale</option>
                                        <option value="corporate">Corporate</option>
                                        <option value="individual">Individual</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="customerContact">Contact Person</label>
                                <input type="text" id="customerContact" class="form-control" 
                                       placeholder="e.g., Jane Smith">
                            </div>
                            
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="customerPhone">Phone Number</label>
                                    <input type="tel" id="customerPhone" class="form-control" 
                                           placeholder="e.g., 08123456789">
                                </div>
                                
                                <div class="form-group">
                                    <label for="customerEmail">Email</label>
                                    <input type="email" id="customerEmail" class="form-control" 
                                           placeholder="e.g., customer@email.com">
                                </div>
                            </div>
                            
                            <div class="form-check" style="margin: 15px 0;">
                                <input type="checkbox" id="customerTaxable" class="form-check-input" checked>
                                <label for="customerTaxable" class="form-check-label">
                                    This customer is taxable
                                </label>
                            </div>
                            
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-plus"></i> Add Customer
                            </button>
                        </form>
                        
                        ${savedCustomers.length > 0 ? `
                            <div class="saved-items" style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                                <h4><i class="fas fa-check-circle" style="color: #10b981;"></i> Added Customers (${savedCustomers.length})</h4>
                                <div class="items-list">
                                    ${savedCustomers.map((cust, index) => `
                                        <div class="item-card">
                                            <div class="item-header">
                                                <strong>${cust.name}</strong>
                                                <span class="badge-customer">${cust.type || 'retail'}</span>
                                            </div>
                                            <div class="item-details">
                                                ${cust.contact ? `Contact: ${cust.contact}` : ''}
                                                ${cust.phone ? `<br>Phone: ${cust.phone}` : ''}
                                                ${cust.email ? `<br>Email: ${cust.email}` : ''}
                                            </div>
                                            <button type="button" class="btn-remove" data-index="${index}" data-type="customer">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="setup-actions">
                            <button type="button" class="btn-secondary" onclick="window.location.hash='#setup/supplier'">
                                <i class="fas fa-arrow-left"></i> Back
                            </button>
                            <button type="button" class="btn-primary" id="nextToCategory" 
                                    ${savedCustomers.length === 0 ? 'disabled' : ''}>
                                <i class="fas fa-arrow-right"></i> Next: Add Category
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .badge-customer {
                    background: #667eea;
                    color: white;
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    text-transform: capitalize;
                }
            </style>
        `;
    }
    
    renderCategoryStep() {
        const savedCategories = this.setupData.categories || [];
        
        return `
            <div class="page-content">
                <div class="setup-header">
                    <h1>🏷️ Category Setup</h1>
                    <p class="page-subtitle">Step 5 of ${this.totalSteps} - Organize your products</p>
                    
                    <div class="setup-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(5/this.totalSteps)*100}%"></div>
                        </div>
                        <div class="progress-steps">
                            <span class="step completed">✓</span>
                            <span class="step completed">✓</span>
                            <span class="step completed">✓</span>
                            <span class="step completed">✓</span>
                            <span class="step active">5</span>
                            <span class="step">6</span>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-tags"></i> Add Product Category</h3>
                        <p>Categories help organize your products. Add at least one category.</p>
                    </div>
                    <div class="card-body">
                        <form id="categoryForm">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="categoryName">Category Name *</label>
                                    <input type="text" id="categoryName" class="form-control" required 
                                           placeholder="e.g., Electronics">
                                </div>
                                
                                <div class="form-group">
                                    <label for="categoryCode">Category Code</label>
                                    <input type="text" id="categoryCode" class="form-control" 
                                           placeholder="e.g., CAT-001">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="categoryDescription">Description</label>
                                <textarea id="categoryDescription" class="form-control" rows="2" 
                                          placeholder="Category description (optional)"></textarea>
                            </div>
                            
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-plus"></i> Add Category
                            </button>
                        </form>
                        
                        ${savedCategories.length > 0 ? `
                            <div class="saved-items" style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                                <h4><i class="fas fa-check-circle" style="color: #10b981;"></i> Added Categories (${savedCategories.length})</h4>
                                <div class="items-list">
                                    ${savedCategories.map((cat, index) => `
                                        <div class="item-card">
                                            <div class="item-header">
                                                <strong>${cat.name}</strong>
                                                ${cat.code ? `<span>${cat.code}</span>` : ''}
                                            </div>
                                            <div class="item-details">
                                                ${cat.description || 'No description'}
                                            </div>
                                            <button type="button" class="btn-remove" data-index="${index}" data-type="category">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="setup-actions">
                            <button type="button" class="btn-secondary" onclick="window.location.hash='#setup/customer'">
                                <i class="fas fa-arrow-left"></i> Back
                            </button>
                            <button type="button" class="btn-primary" id="nextToProduct" 
                                    ${savedCategories.length === 0 ? 'disabled' : ''}>
                                <i class="fas fa-arrow-right"></i> Next: Add Product
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderProductStep() {
        const savedProducts = this.setupData.products || [];
        const categories = this.setupData.categories || [];
        
        return `
            <div class="page-content">
                <div class="setup-header">
                    <h1>📦 Product Setup</h1>
                    <p class="page-subtitle">Step 6 of ${this.totalSteps} - Add your first product</p>
                    
                    <div class="setup-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(6/this.totalSteps)*100}%"></div>
                        </div>
                        <div class="progress-steps">
                            <span class="step completed">✓</span>
                            <span class="step completed">✓</span>
                            <span class="step completed">✓</span>
                            <span class="step completed">✓</span>
                            <span class="step completed">✓</span>
                            <span class="step active">6</span>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-box"></i> Add Product</h3>
                        <p>Add your first product to complete the setup. You can add more later.</p>
                    </div>
                    <div class="card-body">
                        <form id="productForm">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="productName">Product Name *</label>
                                    <input type="text" id="productName" class="form-control" required 
                                           placeholder="e.g., Laptop Dell Inspiron">
                                </div>
                                
                                <div class="form-group">
                                    <label for="productCode">Product Code (SKU)</label>
                                    <input type="text" id="productCode" class="form-control" 
                                           placeholder="e.g., PROD-001">
                                </div>
                            </div>
                            
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="productCategory">Category *</label>
                                    <select id="productCategory" class="form-control" required>
                                        <option value="">Select Category</option>
                                        ${categories.map(cat => `
                                            <option value="${cat.id || cat.name}">${cat.name}</option>
                                        `).join('')}
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="productUnit">Unit</label>
                                    <input type="text" id="productUnit" class="form-control" 
                                           value="pcs" placeholder="e.g., pcs, kg, box">
                                </div>
                            </div>
                            
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="purchasePrice">Purchase Price (Rp)</label>
                                    <input type="number" id="purchasePrice" class="form-control" 
                                           min="0" step="100" value="0">
                                </div>
                                
                                <div class="form-group">
                                    <label for="salePrice">Sale Price (Rp)</label>
                                    <input type="number" id="salePrice" class="form-control" 
                                           min="0" step="100" value="0">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="initialStock">Initial Stock Quantity</label>
                                <input type="number" id="initialStock" class="form-control" 
                                       min="0" step="1" value="0">
                            </div>
                            
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-plus"></i> Add Product
                            </button>
                        </form>
                        
                        ${savedProducts.length > 0 ? `
                            <div class="saved-items" style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                                <h4><i class="fas fa-check-circle" style="color: #10b981;"></i> Added Products (${savedProducts.length})</h4>
                                <div class="items-list">
                                    ${savedProducts.map((prod, index) => `
                                        <div class="item-card">
                                            <div class="item-header">
                                                <strong>${prod.name}</strong>
                                                ${prod.code ? `<span>${prod.code}</span>` : ''}
                                            </div>
                                            <div class="item-details">
                                                Category: ${prod.category || 'Uncategorized'}<br>
                                                Purchase: Rp ${Number(prod.purchasePrice || 0).toLocaleString()}<br>
                                                Sale: Rp ${Number(prod.salePrice || 0).toLocaleString()}<br>
                                                Stock: ${prod.stock || 0} ${prod.unit || 'pcs'}
                                            </div>
                                            <button type="button" class="btn-remove" data-index="${index}" data-type="product">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="setup-actions">
                            <button type="button" class="btn-secondary" onclick="window.location.hash='#setup/category'">
                                <i class="fas fa-arrow-left"></i> Back
                            </button>
                            <button type="button" class="btn-primary" id="completeSetup" 
                                    ${savedProducts.length === 0 ? 'disabled' : ''}>
                                <i class="fas fa-check"></i> Complete Setup
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderCompleteStep() {
        return `
            <div class="page-content">
                <div class="setup-complete">
                    <div class="complete-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h1>🎉 Setup Complete!</h1>
                    <p class="page-subtitle">Your StockMint account is ready to use</p>
                    
                    <div class="summary-card">
                        <h3><i class="fas fa-clipboard-check"></i> Setup Summary</h3>
                        <div class="summary-items">
                            <div class="summary-item">
                                <i class="fas fa-building"></i>
                                <div>
                                    <strong>Company</strong>
                                    <span>${this.setupData.company?.name || 'Not set'}</span>
                                </div>
                            </div>
                            
                            <div class="summary-item">
                                <i class="fas fa-warehouse"></i>
                                <div>
                                    <strong>Warehouses</strong>
                                    <span>${this.setupData.warehouses?.length || 0} added</span>
                                </div>
                            </div>
                            
                            <div class="summary-item">
                                <i class="fas fa-truck"></i>
                                <div>
                                    <strong>Suppliers</strong>
                                    <span>${this.setupData.suppliers?.length || 0} added</span>
                                </div>
                            </div>
                            
                            <div class="summary-item">
                                <i class="fas fa-users"></i>
                                <div>
                                    <strong>Customers</strong>
                                    <span>${this.setupData.customers?.length || 0} added</span>
                                </div>
                            </div>
                            
                            <div class="summary-item">
                                <i class="fas fa-tags"></i>
                                <div>
                                    <strong>Categories</strong>
                                    <span>${this.setupData.categories?.length || 0} added</span>
                                </div>
                            </div>
                            
                            <div class="summary-item">
                                <i class="fas fa-box"></i>
                                <div>
                                    <strong>Products</strong>
                                    <span>${this.setupData.products?.length || 0} added</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="complete-actions">
                        <button class="btn-primary" onclick="window.location.hash='#dashboard'">
                            <i class="fas fa-rocket"></i> Go to Dashboard
                        </button>
                        <button class="btn-secondary" onclick="window.location.hash='#master-data'">
                            <i class="fas fa-cog"></i> Manage Data
                        </button>
                        <button class="btn-secondary" onclick="window.location.hash='#setup/import-more'">
                            <i class="fas fa-file-import"></i> Import More Data
                        </button>
                    </div>
                    
                    <div class="tips" style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                        <h4><i class="fas fa-lightbulb"></i> Next Steps:</h4>
                        <ul>
                            <li>Add more products using the Products page</li>
                            <li>Set up your tax rates in Master Data</li>
                            <li>Configure user permissions if you have a team</li>
                            <li>Connect your bank account for payments</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <style>
                .setup-complete {
                    text-align: center;
                    padding: 40px 20px;
                }
                
                .complete-icon {
                    font-size: 80px;
                    color: #10b981;
                    margin-bottom: 20px;
                }
                
                .summary-card {
                    background: white;
                    border-radius: 12px;
                    padding: 25px;
                    margin: 30px auto;
                    max-width: 600px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
                }
                
                .summary-items {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-top: 20px;
                }
                
                .summary-item {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    text-align: left;
                }
                
                .summary-item i {
                    font-size: 24px;
                    color: #19BEBB;
                }
                
                .summary-item strong {
                    display: block;
                    margin-bottom: 5px;
                }
                
                .summary-item span {
                    color: #666;
                    font-size: 14px;
                }
                
                .complete-actions {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    margin: 30px 0;
                    flex-wrap: wrap;
                }
            </style>
        `;
    }
    
    // ===== EVENT HANDLERS =====
    
    bindEvents() {
        // Company Form
        const companyForm = document.getElementById('companyForm');
        if (companyForm) {
            companyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCompanyForm();
            });
        }
        
        // Warehouse Form
        const warehouseForm = document.getElementById('warehouseForm');
        if (warehouseForm) {
            warehouseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleWarehouseForm();
            });
        }
        
        // Supplier Form
        const supplierForm = document.getElementById('supplierForm');
        if (supplierForm) {
            supplierForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSupplierForm();
            });
        }
        
        // Customer Form
        const customerForm = document.getElementById('customerForm');
        if (customerForm) {
            customerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCustomerForm();
            });
        }
        
        // Category Form
        const categoryForm = document.getElementById('categoryForm');
        if (categoryForm) {
            categoryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCategoryForm();
            });
        }
        
        // Product Form
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProductForm();
            });
        }
        
        // Next buttons
        const nextToSupplier = document.getElementById('nextToSupplier');
        if (nextToSupplier) {
            nextToSupplier.addEventListener('click', () => {
                window.location.hash = '#setup/supplier';
            });
        }
        
        const nextToCustomer = document.getElementById('nextToCustomer');
        if (nextToCustomer) {
            nextToCustomer.addEventListener('click', () => {
                window.location.hash = '#setup/customer';
            });
        }
        
        const nextToCategory = document.getElementById('nextToCategory');
        if (nextToCategory) {
            nextToCategory.addEventListener('click', () => {
                window.location.hash = '#setup/category';
            });
        }
        
        const nextToProduct = document.getElementById('nextToProduct');
        if (nextToProduct) {
            nextToProduct.addEventListener('click', () => {
                window.location.hash = '#setup/product';
            });
        }
        
        const completeSetup = document.getElementById('completeSetup');
        if (completeSetup) {
            completeSetup.addEventListener('click', () => {
                this.completeSetup();
            });
        }
        
        // Remove buttons
        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.closest('.btn-remove').getAttribute('data-index');
                const type = e.target.closest('.btn-remove').getAttribute('data-type');
                this.removeItem(type, index);
            });
        });
    }
    
    // ===== FORM HANDLERS =====
    
    handleCompanyForm() {
        const companyName = document.getElementById('companyName').value;
        const companyTaxId = document.getElementById('companyTaxId').value;
        const companyAddress = document.getElementById('companyAddress').value;
        const companyPhone = document.getElementById('companyPhone').value;
        const companyEmail = document.getElementById('companyEmail').value;
        const businessType = document.getElementById('businessType').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        if (!companyName) {
            this.showNotification('Company name is required', 'error');
            return;
        }
        
        if (!agreeTerms) {
            this.showNotification('You must agree to the Terms of Service', 'error');
            return;
        }
        
        const companyData = {
            id: 1,
            name: companyName,
            taxId: companyTaxId,
            address: companyAddress,
            phone: companyPhone,
            email: companyEmail,
            businessType: businessType,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('stockmint_company', JSON.stringify(companyData));
        localStorage.setItem('stockmint_setup_current_step', 'warehouse');
        
        this.showNotification('✅ Company information saved!', 'success');
        
        setTimeout(() => {
            window.location.hash = '#setup/warehouse';
            window.location.reload();
        }, 1000);
    }
    
    handleWarehouseForm() {
        const name = document.getElementById('warehouseName').value;
        const code = document.getElementById('warehouseCode').value;
        const address = document.getElementById('warehouseAddress').value;
        const isPrimary = document.getElementById('isPrimary').checked;
        
        if (!name) {
            this.showNotification('Warehouse name is required', 'error');
            return;
        }
        
        const warehouseData = {
            id: Date.now(),
            name: name,
            code: code || `WH-${Date.now().toString().slice(-3)}`,
            address: address,
            isPrimary: isPrimary,
            createdAt: new Date().toISOString()
        };
        
        // Get existing warehouses
        const existingWarehouses = JSON.parse(localStorage.getItem('stockmint_warehouses') || '[]');
        
        // If this is primary, unset others
        if (isPrimary) {
            existingWarehouses.forEach(wh => wh.isPrimary = false);
        }
        
        existingWarehouses.push(warehouseData);
        localStorage.setItem('stockmint_warehouses', JSON.stringify(existingWarehouses));
        
        // Clear form
        document.getElementById('warehouseForm').reset();
        
        this.showNotification('✅ Warehouse added successfully!', 'success');
        
        // Update UI
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }
    
    handleSupplierForm() {
        const name = document.getElementById('supplierName').value;
        const code = document.getElementById('supplierCode').value;
        const contact = document.getElementById('supplierContact').value;
        const phone = document.getElementById('supplierPhone').value;
        const email = document.getElementById('supplierEmail').value;
        
        if (!name) {
            this.showNotification('Supplier name is required', 'error');
            return;
        }
        
        const supplierData = {
            id: Date.now(),
            name: name,
            code: code || `SUP-${Date.now().toString().slice(-3)}`,
            contact: contact,
            phone: phone,
            email: email,
            createdAt: new Date().toISOString()
        };
        
        const existingSuppliers = JSON.parse(localStorage.getItem('stockmint_suppliers') || '[]');
        existingSuppliers.push(supplierData);
        localStorage.setItem('stockmint_suppliers', JSON.stringify(existingSuppliers));
        
        document.getElementById('supplierForm').reset();
        this.showNotification('✅ Supplier added successfully!', 'success');
        
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }
    
    handleCustomerForm() {
        const name = document.getElementById('customerName').value;
        const type = document.getElementById('customerType').value;
        const contact = document.getElementById('customerContact').value;
        const phone = document.getElementById('customerPhone').value;
        const email = document.getElementById('customerEmail').value;
        const taxable = document.getElementById('customerTaxable').checked;
        
        if (!name) {
            this.showNotification('Customer name is required', 'error');
            return;
        }
        
        const customerData = {
            id: Date.now(),
            name: name,
            type: type,
            contact: contact,
            phone: phone,
            email: email,
            taxable: taxable,
            createdAt: new Date().toISOString()
        };
        
        const existingCustomers = JSON.parse(localStorage.getItem('stockmint_customers') || '[]');
        existingCustomers.push(customerData);
        localStorage.setItem('stockmint_customers', JSON.stringify(existingCustomers));
        
        document.getElementById('customerForm').reset();
        this.showNotification('✅ Customer added successfully!', 'success');
        
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }
    
    handleCategoryForm() {
        const name = document.getElementById('categoryName').value;
        const code = document.getElementById('categoryCode').value;
        const description = document.getElementById('categoryDescription').value;
        
        if (!name) {
            this.showNotification('Category name is required', 'error');
            return;
        }
        
        const categoryData = {
            id: `CAT-${Date.now().toString().slice(-6)}`,
            name: name,
            code: code || `CAT-${Date.now().toString().slice(-3)}`,
            description: description,
            createdAt: new Date().toISOString()
        };
        
        const existingCategories = JSON.parse(localStorage.getItem('stockmint_categories') || '[]');
        existingCategories.push(categoryData);
        localStorage.setItem('stockmint_categories', JSON.stringify(existingCategories));
        
        document.getElementById('categoryForm').reset();
        this.showNotification('✅ Category added successfully!', 'success');
        
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }
    
    handleProductForm() {
        const name = document.getElementById('productName').value;
        const code = document.getElementById('productCode').value;
        const category = document.getElementById('productCategory').value;
        const unit = document.getElementById('productUnit').value;
        const purchasePrice = parseFloat(document.getElementById('purchasePrice').value) || 0;
        const salePrice = parseFloat(document.getElementById('salePrice').value) || 0;
        const stock = parseInt(document.getElementById('initialStock').value) || 0;
        
        if (!name) {
            this.showNotification('Product name is required', 'error');
            return;
        }
        
        if (!category) {
            this.showNotification('Please select a category', 'error');
            return;
        }
        
        const productData = {
            id: `PROD-${Date.now().toString().slice(-6)}`,
            name: name,
            code: code || `PROD-${Date.now().toString().slice(-3)}`,
            category: category,
            unit: unit || 'pcs',
            purchasePrice: purchasePrice,
            salePrice: salePrice,
            stock: stock,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const existingProducts = JSON.parse(localStorage.getItem('stockmint_products') || '[]');
        existingProducts.push(productData);
        localStorage.setItem('stockmint_products', JSON.stringify(existingProducts));
        
        document.getElementById('productForm').reset();
        this.showNotification('✅ Product added successfully!', 'success');
        
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }
    
    removeItem(type, index) {
        const key = `stockmint_${type}s`;
        const items = JSON.parse(localStorage.getItem(key) || '[]');
        
        if (index >= 0 && index < items.length) {
            items.splice(index, 1);
            localStorage.setItem(key, JSON.stringify(items));
            this.showNotification('✅ Item removed successfully!', 'success');
            
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    }
    
    completeSetup() {
        localStorage.setItem('stockmint_setup_completed', 'true');
        localStorage.removeItem('stockmint_setup_current_step');
        
        this.showNotification('🎉 Setup completed successfully!', 'success');
        
        setTimeout(() => {
            window.location.hash = '#setup/complete';
            window.location.reload();
        }, 1000);
    }
    
    showNotification(message, type = 'info') {
        if (window.StockMintApp && window.StockMintApp.showNotification) {
            window.StockMintApp.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Global
window.SetupWizardMulti = SetupWizardMulti;