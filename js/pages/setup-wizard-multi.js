// setup-wizard-multi.js - PERBAIKAN LENGKAP

class SetupWizardMulti {
    constructor() {
        try {
            this.currentStep = this.getCurrentStep();
            this.totalSteps = 6;
            this.setupData = this.loadSavedData();
            
            console.log('📊 Loaded setup data:', this.setupData);
            
            this.userPlan = localStorage.getItem('stockmint_plan') || 'basic';
            this.user = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
            
            if (!this.user.isDemo && window.GoogleSheetsAPI) {
                this.googleSheets = new GoogleSheetsAPI();
            }
        } catch (error) {
            console.error('Failed to initialize SetupWizard:', error);
            this.setupData = {
                company: {},
                warehouses: [],
                suppliers: [],
                customers: [],
                categories: [],
                products: []
            };
        }
    }
    
    getCurrentStep() {
        // Check what data exists to determine current step
        if (!this.setupData.company?.name) return 'company';
        if (!this.setupData.warehouses?.length) return 'warehouse';
        if (!this.setupData.suppliers?.length) return 'supplier';
        if (!this.setupData.customers?.length) return 'customer';
        if (!this.setupData.categories?.length) return 'category';
        if (!this.setupData.products?.length) return 'product';
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
    
    // ===== EVENT BINDING =====
    
    bindEvents() {
        console.log('🔧 Binding events for step:', this.currentStep);
        
        setTimeout(() => {
            this.bindFormEvents();
            this.bindNavigationEvents();
            
            // Update UI based on current data
            this.updateUI();
        }, 200);
    }
    
    bindFormEvents() {
        const step = this.currentStep;
        
        switch(step) {
            case 'company':
                this.bindCompanyForm();
                break;
            case 'warehouse':
                this.bindWarehouseForm();
                break;
            case 'supplier':
                this.bindSupplierForm();
                break;
            case 'customer':
                this.bindCustomerForm();
                break;
            case 'category':
                this.bindCategoryForm();
                break;
            case 'product':
                this.bindProductForm();
                break;
        }
    }
    
    bindCompanyForm() {
        const form = document.getElementById('companyForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                try {
                    this.saveCompanyData();
                    // Redirect without alert
                    window.location.hash = '#setup/warehouse';
                } catch (error) {
                    this.showAlert(error.message, 'error');
                }
            });
        }
    }
    
    bindWarehouseForm() {
        const form = document.getElementById('warehouseForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                try {
                    this.saveWarehouseData();
                } catch (error) {
                    this.showAlert(error.message, 'error');
                }
            });
        }
        
        const nextBtn = document.getElementById('nextToSupplier');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.setupData.warehouses.length === 0) {
                    this.showAlert('Please add at least one warehouse', 'error');
                    return;
                }
                window.location.hash = '#setup/supplier';
            });
        }
    }
    
    bindSupplierForm() {
        const form = document.getElementById('supplierForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                try {
                    this.saveSupplierData();
                } catch (error) {
                    this.showAlert(error.message, 'error');
                }
            });
        }
        
        const nextBtn = document.getElementById('nextToCustomer');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.setupData.suppliers.length === 0) {
                    this.showAlert('Please add at least one supplier', 'error');
                    return;
                }
                window.location.hash = '#setup/customer';
            });
        }
    }
    
    bindCustomerForm() {
        const form = document.getElementById('customerForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                try {
                    this.saveCustomerData();
                } catch (error) {
                    this.showAlert(error.message, 'error');
                }
            });
        }
        
        const nextBtn = document.getElementById('nextToCategory');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.setupData.customers.length === 0) {
                    this.showAlert('Please add at least one customer', 'error');
                    return;
                }
                window.location.hash = '#setup/category';
            });
        }
    }
    
    bindCategoryForm() {
        const form = document.getElementById('categoryForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                try {
                    this.saveCategoryData();
                } catch (error) {
                    this.showAlert(error.message, 'error');
                }
            });
        }
        
        const nextBtn = document.getElementById('nextToProduct');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.setupData.categories.length === 0) {
                    this.showAlert('Please add at least one category', 'error');
                    return;
                }
                window.location.hash = '#setup/product';
            });
        }
    }
    
    bindProductForm() {
        const form = document.getElementById('productForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                try {
                    this.saveProductData();
                } catch (error) {
                    this.showAlert(error.message, 'error');
                }
            });
        }
        
        const completeBtn = document.getElementById('completeSetup');
        if (completeBtn) {
            completeBtn.addEventListener('click', async () => {
                if (this.setupData.products.length === 0) {
                    this.showAlert('Please add at least one product', 'error');
                    return;
                }
                await this.completeSetup();
            });
        }
    }
    
    bindNavigationEvents() {
        // Event delegation untuk tombol remove
        document.addEventListener('click', async (e) => {
            const removeBtn = e.target.closest('.btn-remove');
            if (removeBtn) {
                const index = parseInt(removeBtn.dataset.index);
                const type = removeBtn.dataset.type;
                
                if (type === 'warehouse') await this.removeWarehouse(index);
                else if (type === 'supplier') await this.removeSupplier(index);
                else if (type === 'customer') await this.removeCustomer(index);
                else if (type === 'category') await this.removeCategory(index);
                else if (type === 'product') await this.removeProduct(index);
                return;
            }
            
            // Back buttons
            if (e.target.closest('[data-action="back"]')) {
                const step = e.target.closest('[data-action="back"]').dataset.step;
                window.location.hash = `#setup/${step}`;
                return;
            }
            
            // Cancel button
            if (e.target.closest('[data-action="cancel"]')) {
                if (confirm('Are you sure you want to cancel setup? All progress will be lost.')) {
                    window.location.hash = '#dashboard';
                }
                return;
            }
        });
    }
    
    updateUI() {
        // Update semua list dan tombol berdasarkan data
        this.updateWarehouseList();
        this.updateSupplierList();
        this.updateCustomerList();
        this.updateCategoryList();
        this.updateProductList();
        this.updateProductCategoryDropdown();
        
        // Update tombol next berdasarkan data
        setTimeout(() => {
            const warehouseNext = document.getElementById('nextToSupplier');
            const supplierNext = document.getElementById('nextToCustomer');
            const customerNext = document.getElementById('nextToCategory');
            const categoryNext = document.getElementById('nextToProduct');
            const completeBtn = document.getElementById('completeSetup');
            
            if (warehouseNext) {
                warehouseNext.disabled = this.setupData.warehouses.length === 0;
            }
            if (supplierNext) {
                supplierNext.disabled = this.setupData.suppliers.length === 0;
            }
            if (customerNext) {
                customerNext.disabled = this.setupData.customers.length === 0;
            }
            if (categoryNext) {
                categoryNext.disabled = this.setupData.categories.length === 0;
            }
            if (completeBtn) {
                completeBtn.disabled = this.setupData.products.length === 0;
            }
        }, 100);
    }
    
    // ===== DATA SAVING =====
    
    saveCompanyData() {
        const name = document.getElementById('companyName')?.value.trim();
        const taxId = document.getElementById('companyTaxId')?.value.trim() || '';
        const address = document.getElementById('companyAddress')?.value.trim() || '';
        const phone = document.getElementById('companyPhone')?.value.trim() || '';
        const email = document.getElementById('companyEmail')?.value.trim() || '';
        const businessType = document.getElementById('businessType')?.value || '';
        const agreeTerms = document.getElementById('agreeTerms')?.checked || false;
        
        if (!name) throw new Error('Company name is required');
        if (!agreeTerms) throw new Error('You must agree to the Terms of Service');
        
        this.setupData.company = {
            id: 'COMP001',
            name,
            taxId,
            address,
            phone,
            email,
            businessType,
            setupDate: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('stockmint_company', JSON.stringify(this.setupData.company));
        
        return true;
    }
    
    saveWarehouseData() {
        const name = document.getElementById('warehouseName')?.value.trim();
        const address = document.getElementById('warehouseAddress')?.value.trim() || '';
        const isPrimary = document.getElementById('isPrimary')?.checked || false;
        
        if (!name) throw new Error('Warehouse name is required');
        
        // Check plan restrictions
        const warehouseLimit = this.userPlan === 'basic' ? 1 : 
                              this.userPlan === 'pro' ? 3 : 
                              Infinity;
        
        if (this.setupData.warehouses.length >= warehouseLimit) {
            throw new Error(`You can only have ${warehouseLimit} warehouse(s) in your current plan.`);
        }
        
        const warehouse = {
            id: `WH${Date.now()}`,
            name,
            code: `WH${Date.now().toString().slice(-6)}`,
            address,
            isPrimary,
            createdAt: new Date().toISOString()
        };
        
        // Jika ini primary, set yang lain menjadi non-primary
        if (isPrimary) {
            this.setupData.warehouses.forEach(wh => wh.isPrimary = false);
        }
        
        this.setupData.warehouses.push(warehouse);
        localStorage.setItem('stockmint_warehouses', JSON.stringify(this.setupData.warehouses));
        
        // Reset form
        document.getElementById('warehouseForm').reset();
        
        // Update UI
        this.updateWarehouseList();
        
        return true;
    }
    
    saveSupplierData() {
        const name = document.getElementById('supplierName')?.value.trim();
        const contact = document.getElementById('supplierContact')?.value.trim() || '';
        const phone = document.getElementById('supplierPhone')?.value.trim() || '';
        const email = document.getElementById('supplierEmail')?.value.trim() || '';
        
        if (!name) throw new Error('Supplier name is required');
        
        const supplier = {
            id: `SUP${Date.now()}`,
            name,
            code: `SUP${Date.now().toString().slice(-6)}`,
            contact,
            phone,
            email,
            isActive: true,
            createdAt: new Date().toISOString()
        };
        
        this.setupData.suppliers.push(supplier);
        localStorage.setItem('stockmint_suppliers', JSON.stringify(this.setupData.suppliers));
        
        document.getElementById('supplierForm').reset();
        this.updateSupplierList();
        
        return true;
    }
    
    saveCustomerData() {
        const name = document.getElementById('customerName')?.value.trim();
        const type = document.getElementById('customerType')?.value || 'retail';
        const contact = document.getElementById('customerContact')?.value.trim() || '';
        const phone = document.getElementById('customerPhone')?.value.trim() || '';
        const email = document.getElementById('customerEmail')?.value.trim() || '';
        const taxable = document.getElementById('customerTaxable')?.checked || false;
        
        if (!name) throw new Error('Customer name is required');
        
        const customer = {
            id: `CUST${Date.now()}`,
            name,
            type,
            contact,
            phone,
            email,
            taxable,
            isActive: true,
            createdAt: new Date().toISOString()
        };
        
        this.setupData.customers.push(customer);
        localStorage.setItem('stockmint_customers', JSON.stringify(this.setupData.customers));
        
        document.getElementById('customerForm').reset();
        this.updateCustomerList();
        
        return true;
    }
    
    saveCategoryData() {
        const name = document.getElementById('categoryName')?.value.trim();
        const description = document.getElementById('categoryDescription')?.value.trim() || '';
        
        if (!name) throw new Error('Category name is required');
        
        const category = {
            id: `CAT${Date.now()}`,
            name,
            code: `CAT${Date.now().toString().slice(-6)}`,
            description,
            createdAt: new Date().toISOString()
        };
        
        this.setupData.categories.push(category);
        localStorage.setItem('stockmint_categories', JSON.stringify(this.setupData.categories));
        
        document.getElementById('categoryForm').reset();
        this.updateCategoryList();
        this.updateProductCategoryDropdown();
        
        return true;
    }
    
    saveProductData() {
        const name = document.getElementById('productName')?.value.trim();
        const category = document.getElementById('productCategory')?.value;
        const unit = document.getElementById('productUnit')?.value || 'pcs';
        const purchasePrice = parseFloat(document.getElementById('purchasePrice')?.value || 0);
        const salePrice = parseFloat(document.getElementById('salePrice')?.value || 0);
        const initialStock = parseInt(document.getElementById('initialStock')?.value || 0);
        
        if (!name) throw new Error('Product name is required');
        if (!category) throw new Error('Please select a category');
        
        const product = {
            id: `PROD${Date.now()}`,
            name,
            code: `PROD${Date.now().toString().slice(-6)}`,
            categoryId: category,
            category: this.setupData.categories?.find(c => c.id === category)?.name || category,
            unit,
            purchasePrice,
            salePrice,
            stock: initialStock,
            isActive: true,
            createdAt: new Date().toISOString()
        };
        
        this.setupData.products.push(product);
        localStorage.setItem('stockmint_products', JSON.stringify(this.setupData.products));
        
        document.getElementById('productForm').reset();
        this.updateProductList();
        
        return true;
    }
    
    // ===== UPDATE LIST METHODS =====
    
    updateWarehouseList() {
        const savedItems = document.querySelector('.warehouse-items');
        if (!savedItems) return;
        
        const warehouses = this.setupData.warehouses || [];
        const warehouseLimit = this.userPlan === 'basic' ? 1 : 
                              this.userPlan === 'pro' ? 3 : 
                              Infinity;
        
        savedItems.innerHTML = `
            <h4><i class="fas fa-check-circle" style="color: #10b981;"></i> Added Warehouses (${warehouses.length}/${warehouseLimit})</h4>
            <div class="items-list">
                ${warehouses.map((wh, index) => `
                    <div class="item-card">
                        <div class="item-header">
                            <strong>${wh.name}</strong>
                            ${wh.isPrimary ? '<span class="badge-primary">Primary</span>' : ''}
                        </div>
                        <div class="item-details">
                            <small>ID: ${wh.code}</small>
                            ${wh.address ? `<br>${wh.address}` : ''}
                        </div>
                        <button type="button" class="btn-remove" data-index="${index}" data-type="warehouse">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    updateSupplierList() {
        const savedItems = document.querySelector('.supplier-items');
        if (!savedItems) return;
        
        const suppliers = this.setupData.suppliers || [];
        
        savedItems.innerHTML = `
            <h4><i class="fas fa-check-circle" style="color: #10b981;"></i> Added Suppliers (${suppliers.length})</h4>
            <div class="items-list">
                ${suppliers.map((sup, index) => `
                    <div class="item-card">
                        <div class="item-header">
                            <strong>${sup.name}</strong>
                            <small>ID: ${sup.code}</small>
                        </div>
                        <div class="item-details">
                            ${sup.contact ? `Contact: ${sup.contact}` : ''}
                            ${sup.phone ? `<br>Phone: ${sup.phone}` : ''}
                            ${sup.email ? `<br>Email: ${sup.email}` : ''}
                        </div>
                        <button type="button" class="btn-remove" data-index="${index}" data-type="supplier">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    updateCustomerList() {
        const savedItems = document.querySelector('.customer-items');
        if (!savedItems) return;
        
        const customers = this.setupData.customers || [];
        
        savedItems.innerHTML = `
            <h4><i class="fas fa-check-circle" style="color: #10b981;"></i> Added Customers (${customers.length})</h4>
            <div class="items-list">
                ${customers.map((cust, index) => `
                    <div class="item-card">
                        <div class="item-header">
                            <strong>${cust.name}</strong>
                            <span class="badge-customer">${cust.type || 'retail'}</span>
                        </div>
                        <div class="item-details">
                            <small>ID: ${cust.id}</small>
                            ${cust.contact ? `<br>Contact: ${cust.contact}` : ''}
                            ${cust.phone ? `<br>Phone: ${cust.phone}` : ''}
                            ${cust.email ? `<br>Email: ${cust.email}` : ''}
                        </div>
                        <button type="button" class="btn-remove" data-index="${index}" data-type="customer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    updateCategoryList() {
        const savedItems = document.querySelector('.category-items');
        if (!savedItems) return;
        
        const categories = this.setupData.categories || [];
        
        savedItems.innerHTML = `
            <h4><i class="fas fa-check-circle" style="color: #10b981;"></i> Added Categories (${categories.length})</h4>
            <div class="items-list">
                ${categories.map((cat, index) => `
                    <div class="item-card">
                        <div class="item-header">
                            <strong>${cat.name}</strong>
                            <small>ID: ${cat.code}</small>
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
        `;
    }
    
    updateProductList() {
        const savedItems = document.querySelector('.product-items');
        if (!savedItems) return;
        
        const products = this.setupData.products || [];
        
        savedItems.innerHTML = `
            <h4><i class="fas fa-check-circle" style="color: #10b981;"></i> Added Products (${products.length})</h4>
            <div class="items-list">
                ${products.map((prod, index) => `
                    <div class="item-card">
                        <div class="item-header">
                            <strong>${prod.name}</strong>
                            <small>SKU: ${prod.code}</small>
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
        `;
    }
    
    updateProductCategoryDropdown() {
        const dropdown = document.getElementById('productCategory');
        if (dropdown) {
            const categories = this.setupData.categories || [];
            dropdown.innerHTML = `
                <option value="">Select Category</option>
                ${categories.map(cat => `
                    <option value="${cat.id}">${cat.name}</option>
                `).join('')}
            `;
        }
    }
    
    // ===== REMOVE ITEMS =====
    
    async removeWarehouse(index) {
        if (confirm('Are you sure you want to remove this warehouse?')) {
            this.setupData.warehouses.splice(index, 1);
            localStorage.setItem('stockmint_warehouses', JSON.stringify(this.setupData.warehouses));
            this.updateWarehouseList();
        }
    }
    
    async removeSupplier(index) {
        if (confirm('Are you sure you want to remove this supplier?')) {
            this.setupData.suppliers.splice(index, 1);
            localStorage.setItem('stockmint_suppliers', JSON.stringify(this.setupData.suppliers));
            this.updateSupplierList();
        }
    }
    
    async removeCustomer(index) {
        if (confirm('Are you sure you want to remove this customer?')) {
            this.setupData.customers.splice(index, 1);
            localStorage.setItem('stockmint_customers', JSON.stringify(this.setupData.customers));
            this.updateCustomerList();
        }
    }
    
    async removeCategory(index) {
        if (confirm('Are you sure you want to remove this category?')) {
            this.setupData.categories.splice(index, 1);
            localStorage.setItem('stockmint_categories', JSON.stringify(this.setupData.categories));
            this.updateCategoryList();
        }
    }
    
    async removeProduct(index) {
        if (confirm('Are you sure you want to remove this product?')) {
            this.setupData.products.splice(index, 1);
            localStorage.setItem('stockmint_products', JSON.stringify(this.setupData.products));
            this.updateProductList();
        }
    }
    
    // ===== COMPLETE SETUP =====
    
    async completeSetup() {
        try {
            // Mark setup as completed
            localStorage.setItem('stockmint_setup_completed', 'true');
            localStorage.setItem('stockmint_setup_date', new Date().toISOString());
            
            // Create opening stock
            this.createOpeningStock();
            
            // Save to Google Sheets if available
            if (!this.user.isDemo && this.googleSheets) {
                try {
                    await this.googleSheets.saveSetupData(this.setupData);
                    console.log('✅ Data saved to Google Sheets');
                } catch (sheetsError) {
                    console.error('Failed to save to Google Sheets:', sheetsError);
                }
            }
            
            // Show success message
            this.showAlert('🎉 Setup completed successfully! Redirecting to dashboard...', 'success');
            
            // Redirect
            setTimeout(() => {
                window.location.hash = '#dashboard';
                window.location.reload();
            }, 2000);
            
        } catch (error) {
            console.error('Error completing setup:', error);
            this.showAlert(`Failed to complete setup: ${error.message}`, 'error');
        }
    }
    
    createOpeningStock() {
        const warehouses = this.setupData.warehouses || [];
        const products = this.setupData.products || [];
        
        if (warehouses.length === 0 || products.length === 0) return;
        
        const openingStocks = products.map(product => ({
            productId: product.id,
            productName: product.name,
            warehouseId: warehouses[0].id,
            warehouseName: warehouses[0].name,
            quantity: product.stock || 0,
            cost: product.purchasePrice || 0,
            date: new Date().toISOString(),
            type: 'opening',
            createdAt: new Date().toISOString()
        }));
        
        localStorage.setItem('stockmint_opening_stocks', JSON.stringify(openingStocks));
    }
    
    // ===== UI HELPERS =====
    
    showAlert(message, type = 'info') {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.alert-message');
        existingAlerts.forEach(alert => alert.remove());
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert-message alert-${type}`;
        alertDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        const container = document.querySelector('.page-content') || document.body;
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 3000);
    }
    
    // ===== RENDER METHODS =====
    
    render() {
        const hash = window.location.hash.substring(1);
        const route = hash.split('/')[1];
        
        if (route === 'migrate') {
            return this.renderMigratePage();
        }
        
        this.currentStep = route || 'company';
        
        switch(this.currentStep) {
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
            default:
                return this.renderCompanyStep();
        }
    }
    
    // ===== PROGRESS BAR FIXED =====
    
    renderProgressBar() {
        const steps = [
            { id: 'company', label: 'Company', number: 1 },
            { id: 'warehouse', label: 'Warehouse', number: 2 },
            { id: 'supplier', label: 'Supplier', number: 3 },
            { id: 'customer', label: 'Customer', number: 4 },
            { id: 'category', label: 'Category', number: 5 },
            { id: 'product', label: 'Product', number: 6 }
        ];
        
        const currentIndex = steps.findIndex(step => step.id === this.currentStep);
        
        return `
            <div class="setup-progress" style="margin: 20px 0 30px 0;">
                <div style="height: 6px; background: #e9ecef; border-radius: 3px; overflow: hidden;">
                    <div style="height: 100%; width: ${((currentIndex + 1) / steps.length) * 100}%; background: #19BEBB; border-radius: 3px; transition: width 0.3s ease;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 12px; font-weight: 600;">
                    ${steps.map((step, index) => `
                        <span style="color: ${index <= currentIndex ? '#19BEBB' : '#666'}; text-align: center; flex: 1;">
                            ${index < currentIndex ? '✓' : step.number}. ${step.label}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // ===== RENDER STEPS (WITH FIXES) =====
    
    renderCompanyStep() {
        const savedData = this.setupData.company || {};
        
        return `
            <div class="page-content">
                <h1>🏢 Company Information</h1>
                <p class="page-subtitle">Step 1 of ${this.totalSteps}: Setup your company profile</p>
                
                ${this.renderProgressBar()}
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-building"></i> Company Details</h3>
                        <p>This information will appear on your invoices and reports</p>
                    </div>
                    <div class="card-body">
                        <form id="companyForm">
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
                                </select>
                            </div>
                            
                            <div class="form-check">
                                <input type="checkbox" id="agreeTerms" class="form-check-input" required>
                                <label for="agreeTerms" class="form-check-label">
                                    I agree to the Terms of Service and Privacy Policy
                                </label>
                            </div>
                            
                            <div class="setup-actions">
                                <button type="button" class="btn-secondary" data-action="cancel">
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
                
                .form-group {
                    margin-bottom: 20px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: #333;
                }
                
                .form-control {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 16px;
                }
                
                .form-control:focus {
                    outline: none;
                    border-color: #19BEBB;
                }
                
                .setup-actions {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                }
                
                .btn-primary {
                    background: #19BEBB;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .btn-primary:hover {
                    background: #0fa8a6;
                }
                
                .btn-secondary {
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .btn-secondary:hover {
                    background: #5a6268;
                }
                
                .alert-message {
                    padding: 12px 16px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .alert-success {
                    background: #d1fae5;
                    border: 1px solid #a7f3d0;
                    color: #059669;
                }
                
                .alert-error {
                    background: #fee2e2;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                }
            </style>
        `;
    }
    
    renderWarehouseStep() {
        const savedWarehouses = this.setupData.warehouses || [];
        const warehouseLimit = this.userPlan === 'basic' ? 1 : 
                              this.userPlan === 'pro' ? 3 : 
                              Infinity;
        
        return `
            <div class="page-content">
                <h1>🏭 Warehouse Setup</h1>
                <p class="page-subtitle">Step 2 of ${this.totalSteps}: Add at least one warehouse</p>
                
                ${this.renderProgressBar()}
                
                ${this.userPlan === 'basic' && savedWarehouses.length >= 1 ? `
                    <div class="alert alert-warning">
                        <i class="fas fa-info-circle"></i>
                        <strong>BASIC Plan:</strong> Only 1 warehouse allowed. Upgrade to PRO for multiple warehouses.
                    </div>
                ` : ''}
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-warehouse"></i> Add Warehouse</h3>
                        <p>Warehouses are where you store your inventory.</p>
                        <p><small><i class="fas fa-info-circle"></i> Warehouse ID will be auto-generated</small></p>
                    </div>
                    <div class="card-body">
                        <form id="warehouseForm">
                            <div class="form-group">
                                <label for="warehouseName">Warehouse Name *</label>
                                <input type="text" id="warehouseName" class="form-control" required 
                                       placeholder="e.g., Main Warehouse">
                            </div>
                            
                            <div class="form-group">
                                <label for="warehouseAddress">Address (Optional)</label>
                                <textarea id="warehouseAddress" class="form-control" rows="2" 
                                          placeholder="Warehouse address"></textarea>
                            </div>
                            
                            <div class="form-check">
                                <input type="checkbox" id="isPrimary" class="form-check-input" ${savedWarehouses.length === 0 ? 'checked' : ''}>
                                <label for="isPrimary" class="form-check-label">
                                    Set as primary warehouse (default storage location)
                                </label>
                            </div>
                            
                            <button type="submit" class="btn-primary" ${savedWarehouses.length >= warehouseLimit ? 'disabled' : ''}>
                                <i class="fas fa-plus"></i> Add Warehouse
                            </button>
                            
                            ${savedWarehouses.length >= warehouseLimit ? `
                                <p class="text-danger" style="margin-top: 10px;">
                                    <i class="fas fa-exclamation-triangle"></i>
                                    You have reached the maximum number of warehouses for your plan (${warehouseLimit}).
                                </p>
                            ` : ''}
                        </form>
                        
                        <div class="warehouse-items" style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                            ${savedWarehouses.length > 0 ? `
                                <h4><i class="fas fa-check-circle" style="color: #10b981;"></i> Added Warehouses (${savedWarehouses.length}/${warehouseLimit})</h4>
                                <div class="items-list">
                                    ${savedWarehouses.map((wh, index) => `
                                        <div class="item-card">
                                            <div class="item-header">
                                                <strong>${wh.name}</strong>
                                                ${wh.isPrimary ? '<span class="badge-primary">Primary</span>' : ''}
                                            </div>
                                            <div class="item-details">
                                                <small>ID: ${wh.code}</small>
                                                ${wh.address ? `<br>${wh.address}` : ''}
                                            </div>
                                            <button type="button" class="btn-remove" data-index="${index}" data-type="warehouse">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : `
                                <p class="text-muted">No warehouses added yet. Add your first warehouse above.</p>
                            `}
                        </div>
                        
                        <div class="setup-actions">
                            <button type="button" class="btn-secondary" data-action="back" data-step="company">
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
                .item-card {
                    background: white;
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                
                .item-header {
                    flex: 1;
                }
                
                .item-header strong {
                    display: block;
                    margin-bottom: 5px;
                }
                
                .item-details {
                    color: #666;
                    font-size: 14px;
                    margin-top: 5px;
                }
                
                .btn-remove {
                    background: #fee2e2;
                    color: #dc2626;
                    border: none;
                    padding: 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-left: 10px;
                }
                
                .btn-remove:hover {
                    background: #fecaca;
                }
                
                .badge-primary {
                    background: #dbeafe;
                    color: #1e40af;
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    margin-left: 10px;
                }
                
                .alert-warning {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                    padding: 10px 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
            </style>
        `;
    }
    
    renderSupplierStep() {
        const savedSuppliers = this.setupData.suppliers || [];
        
        return `
            <div class="page-content">
                <h1>🤝 Supplier Setup</h1>
                <p class="page-subtitle">Step 3 of ${this.totalSteps}: Add at least one supplier</p>
                
                ${this.renderProgressBar()}
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-truck"></i> Add Supplier</h3>
                        <p>Suppliers are companies that provide you with products.</p>
                        <p><small><i class="fas fa-info-circle"></i> Supplier ID will be auto-generated</small></p>
                    </div>
                    <div class="card-body">
                        <form id="supplierForm">
                            <div class="form-group">
                                <label for="supplierName">Supplier Name *</label>
                                <input type="text" id="supplierName" class="form-control" required 
                                       placeholder="e.g., PT. Supplier Maju">
                            </div>
                            
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="supplierContact">Contact Person (Optional)</label>
                                    <input type="text" id="supplierContact" class="form-control" 
                                           placeholder="e.g., John Doe">
                                </div>
                                
                                <div class="form-group">
                                    <label for="supplierPhone">Phone Number (Optional)</label>
                                    <input type="tel" id="supplierPhone" class="form-control" 
                                           placeholder="e.g., 08123456789">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="supplierEmail">Email (Optional)</label>
                                <input type="email" id="supplierEmail" class="form-control" 
                                       placeholder="e.g., supplier@email.com">
                            </div>
                            
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-plus"></i> Add Supplier
                            </button>
                        </form>
                        
                        <div class="supplier-items" style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                            ${savedSuppliers.length > 0 ? `
                                <h4><i class="fas fa-check-circle" style="color: #10b981;"></i> Added Suppliers (${savedSuppliers.length})</h4>
                                <div class="items-list">
                                    ${savedSuppliers.map((sup, index) => `
                                        <div class="item-card">
                                            <div class="item-header">
                                                <strong>${sup.name}</strong>
                                                <small>ID: ${sup.code}</small>
                                            </div>
                                            <div class="item-details">
                                                ${sup.contact ? `Contact: ${sup.contact}` : ''}
                                                ${sup.phone ? `<br>Phone: ${sup.phone}` : ''}
                                                ${sup.email ? `<br>Email: ${sup.email}` : ''}
                                            </div>
                                            <button type="button" class="btn-remove" data-index="${index}" data-type="supplier">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : `
                                <p class="text-muted">No suppliers added yet. Add your first supplier above.</p>
                            `}
                        </div>
                        
                        <div class="setup-actions">
                            <button type="button" class="btn-secondary" data-action="back" data-step="warehouse">
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
                <h1>👥 Customer Setup</h1>
                <p class="page-subtitle">Step 4 of ${this.totalSteps}: Add at least one customer</p>
                
                ${this.renderProgressBar()}
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-users"></i> Add Customer</h3>
                        <p>Customers are who buy products from you.</p>
                        <p><small><i class="fas fa-info-circle"></i> Customer ID will be auto-generated</small></p>
                    </div>
                    <div class="card-body">
                        <form id="customerForm">
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
                            
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="customerContact">Contact Person (Optional)</label>
                                    <input type="text" id="customerContact" class="form-control" 
                                           placeholder="e.g., Jane Smith">
                                </div>
                                
                                <div class="form-group">
                                    <label for="customerPhone">Phone Number (Optional)</label>
                                    <input type="tel" id="customerPhone" class="form-control" 
                                           placeholder="e.g., 08123456789">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="customerEmail">Email (Optional)</label>
                                <input type="email" id="customerEmail" class="form-control" 
                                       placeholder="e.g., customer@email.com">
                            </div>
                            
                            <div class="form-check">
                                <input type="checkbox" id="customerTaxable" class="form-check-input" checked>
                                <label for="customerTaxable" class="form-check-label">
                                    This customer is taxable
                                </label>
                            </div>
                            
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-plus"></i> Add Customer
                            </button>
                        </form>
                        
                        <div class="customer-items" style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                            ${savedCustomers.length > 0 ? `
                                <h4><i class="fas fa-check-circle" style="color: #10b981;"></i> Added Customers (${savedCustomers.length})</h4>
                                <div class="items-list">
                                    ${savedCustomers.map((cust, index) => `
                                        <div class="item-card">
                                            <div class="item-header">
                                                <strong>${cust.name}</strong>
                                                <span class="badge-customer">${cust.type || 'retail'}</span>
                                            </div>
                                            <div class="item-details">
                                                <small>ID: ${cust.id}</small>
                                                ${cust.contact ? `<br>Contact: ${cust.contact}` : ''}
                                                ${cust.phone ? `<br>Phone: ${cust.phone}` : ''}
                                                ${cust.email ? `<br>Email: ${cust.email}` : ''}
                                            </div>
                                            <button type="button" class="btn-remove" data-index="${index}" data-type="customer">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : `
                                <p class="text-muted">No customers added yet. Add your first customer above.</p>
                            `}
                        </div>
                        
                        <div class="setup-actions">
                            <button type="button" class="btn-secondary" data-action="back" data-step="supplier">
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
        `;
    }
    
    renderCategoryStep() {
        const savedCategories = this.setupData.categories || [];
        
        return `
            <div class="page-content">
                <h1>🏷️ Category Setup</h1>
                <p class="page-subtitle">Step 5 of ${this.totalSteps}: Add at least one category</p>
                
                ${this.renderProgressBar()}
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-tags"></i> Add Product Category</h3>
                        <p>Categories help organize your products.</p>
                        <p><small><i class="fas fa-info-circle"></i> Category ID will be auto-generated</small></p>
                    </div>
                    <div class="card-body">
                        <form id="categoryForm">
                            <div class="form-group">
                                <label for="categoryName">Category Name *</label>
                                <input type="text" id="categoryName" class="form-control" required 
                                       placeholder="e.g., Electronics">
                            </div>
                            
                            <div class="form-group">
                                <label for="categoryDescription">Description (Optional)</label>
                                <textarea id="categoryDescription" class="form-control" rows="2" 
                                          placeholder="Category description"></textarea>
                            </div>
                            
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-plus"></i> Add Category
                            </button>
                        </form>
                        
                        <div class="category-items" style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                            ${savedCategories.length > 0 ? `
                                <h4><i class="fas fa-check-circle" style="color: #10b981;"></i> Added Categories (${savedCategories.length})</h4>
                                <div class="items-list">
                                    ${savedCategories.map((cat, index) => `
                                        <div class="item-card">
                                            <div class="item-header">
                                                <strong>${cat.name}</strong>
                                                <small>ID: ${cat.code}</small>
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
                            ` : `
                                <p class="text-muted">No categories added yet. Add your first category above.</p>
                            `}
                        </div>
                        
                        <div class="setup-actions">
                            <button type="button" class="btn-secondary" data-action="back" data-step="customer">
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
                <h1>📦 Product Setup</h1>
                <p class="page-subtitle">Step 6 of ${this.totalSteps}: Add at least one product</p>
                
                ${this.renderProgressBar()}
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-box"></i> Add Product</h3>
                        <p>Add your first product to complete the setup.</p>
                        <p><small><i class="fas fa-info-circle"></i> Product ID will be auto-generated</small></p>
                    </div>
                    <div class="card-body">
                        <form id="productForm">
                            <div class="form-group">
                                <label for="productName">Product Name *</label>
                                <input type="text" id="productName" class="form-control" required 
                                       placeholder="e.g., Laptop Dell Inspiron">
                            </div>
                            
                            <div class="form-group">
                                <label for="productCategory">Category *</label>
                                <select id="productCategory" class="form-control" required>
                                    <option value="">Select Category</option>
                                    ${categories.map(cat => `
                                        <option value="${cat.id}">${cat.name}</option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="productUnit">Unit</label>
                                <input type="text" id="productUnit" class="form-control" 
                                       value="pcs" placeholder="e.g., pcs, kg, box">
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
                        
                        <div class="product-items" style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                            ${savedProducts.length > 0 ? `
                                <h4><i class="fas fa-check-circle" style="color: #10b981;"></i> Added Products (${savedProducts.length})</h4>
                                <div class="items-list">
                                    ${savedProducts.map((prod, index) => `
                                        <div class="item-card">
                                            <div class="item-header">
                                                <strong>${prod.name}</strong>
                                                <small>SKU: ${prod.code}</small>
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
                            ` : `
                                <p class="text-muted">No products added yet. Add your first product above.</p>
                            `}
                        </div>
                        
                        <div class="setup-actions">
                            <button type="button" class="btn-secondary" data-action="back" data-step="category">
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
    
    renderMigratePage() {
        return `
            <div class="page-content">
                <h1>📤 Data Migration</h1>
                <p class="page-subtitle">Import your existing data</p>
                
                <div class="alert alert-warning">
                    <h4><i class="fas fa-exclamation-triangle"></i> Advanced Feature Warning</h4>
                    <p>This feature is for users who understand database relationships. The Excel template has 12 interconnected sheets with complex relationships.</p>
                    <p><strong>For beginners:</strong> Use "Start New Setup" instead, which guides you step by step.</p>
                    <div style="margin-top: 15px;">
                        <button class="btn-secondary" onclick="window.location.hash='#setup/company'">
                            <i class="fas fa-arrow-left"></i> Back to Setup New
                        </button>
                    </div>
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
                                    <p>Understand the 12 sheets and their relationships</p>
                                </div>
                            </div>
                            
                            <div class="step">
                                <div class="step-number">3</div>
                                <div class="step-content">
                                    <h4>Fill Your Data</h4>
                                    <p>Carefully fill in your data following the exact format</p>
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
                </style>
                
                <script>
                    document.addEventListener('DOMContentLoaded', function() {
                        const uploadBtn = document.getElementById('uploadMigrationFile');
                        const fileInput = document.getElementById('migrationFile');
                        const uploadStatus = document.getElementById('uploadStatus');
                        
                        if (uploadBtn && fileInput) {
                            uploadBtn.addEventListener('click', function() {
                                fileInput.click();
                            });
                            
                            fileInput.addEventListener('change', function(e) {
                                const file = e.target.files[0];
                                if (file) {
                                    const validTypes = ['.xlsx', '.xls', '.csv'];
                                    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
                                    
                                    if (!validTypes.includes(fileExt)) {
                                        uploadStatus.innerHTML = '<div style="color: #ef4444; background: #fee2e2; padding: 10px; border-radius: 5px;">❌ Please upload Excel or CSV files only</div>';
                                        return;
                                    }
                                    
                                    uploadStatus.innerHTML = '<div style="color: #f59e0b; background: #fef3c7; padding: 10px; border-radius: 5px;"><i class="fas fa-spinner fa-spin"></i> Processing file...</div>';
                                    
                                    setTimeout(function() {
                                        localStorage.setItem('stockmint_setup_completed', 'true');
                                        localStorage.setItem('stockmint_data_migrated', 'true');
                                        
                                        uploadStatus.innerHTML = '<div style="color: #10b981; background: #d1fae5; padding: 10px; border-radius: 5px;">✅ Data migration completed successfully!</div>';
                                        
                                        setTimeout(function() {
                                            window.location.hash = '#dashboard';
                                            window.location.reload();
                                        }, 2000);
                                    }, 2000);
                                }
                            });
                        }
                    });
                </script>
            </div>
        `;
    }
}

// Global instance
window.SetupWizardMulti = SetupWizardMulti;
