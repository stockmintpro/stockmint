// setup-wizard-multi.js - VERSI PERBAIKAN FINAL
console.log('🔄 setup-wizard-multi.js LOADED - PERBAIKAN FINAL');

class SetupWizardMulti {
    constructor() {
        console.log('🔄 SetupWizardMulti constructor called');
        
        try {
            this.currentStep = this.getCurrentStepFromHash();
            this.totalSteps = 6;
            this.setupData = this.loadSavedData();
            console.log('📊 Loaded setup data:', this.setupData);
            
            this.userPlan = localStorage.getItem('stockmint_plan') || 'basic';
            this.user = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
            
            // Initialize counters
            this.warehouseCounter = this.setupData.warehouses.length;
            this.supplierCounter = this.setupData.suppliers.length;
            this.customerCounter = this.setupData.customers.length;
            this.categoryCounter = this.setupData.categories.length;
            this.productCounter = this.setupData.products.length;
            
        } catch (error) {
            console.error('❌ Failed to initialize SetupWizard:', error);
            this.setupData = {
                company: {},
                warehouses: [],
                suppliers: [],
                customers: [],
                categories: [],
                products: []
            };
            this.warehouseCounter = 0;
            this.supplierCounter = 0;
            this.customerCounter = 0;
            this.categoryCounter = 0;
            this.productCounter = 0;
        }
    }

    getCurrentStepFromHash() {
        const hash = window.location.hash.substring(1);
        const route = hash.split('/')[1];
        
        if (route && route !== 'migrate') {
            return route;
        }
        
        // Default to company if no route
        return 'company';
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
        
        // Clear any existing event listeners first
        this.unbindEvents();
        
        setTimeout(() => {
            this.bindFormEvents();
            this.bindNavigationEvents();
            this.updateUI();
            console.log('✅ Events bound successfully');
        }, 100);
    }

    unbindEvents() {
        // Remove existing event listeners by cloning and replacing forms
        const forms = ['companyForm', 'warehouseForm', 'supplierForm', 'customerForm', 'categoryForm', 'productForm'];
        forms.forEach(formId => {
            const form = document.getElementById(formId);
            if (form) {
                const newForm = form.cloneNode(true);
                form.parentNode.replaceChild(newForm, form);
            }
        });
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
                    console.log('✅ Company data saved, redirecting to warehouse');
                    window.location.hash = '#setup/warehouse';
                } catch (error) {
                    this.showAlert(error.message, 'error');
                }
            });
        }
        
        // Auto-save on input
        if (form) {
            form.addEventListener('input', () => {
                try {
                    this.saveCompanyData(false);
                    console.log('💾 Company data auto-saved');
                } catch (error) {
                    // Ignore validation errors during auto-save
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
                    const success = this.saveWarehouseData();
                    if (success) {
                        // Update UI immediately after adding
                        this.updateUI();
                    }
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
                    const success = this.saveSupplierData();
                    if (success) {
                        this.updateUI();
                    }
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
                    const success = this.saveCustomerData();
                    if (success) {
                        this.updateUI();
                    }
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
                    const success = this.saveCategoryData();
                    if (success) {
                        this.updateUI();
                    }
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
                    const success = this.saveProductData();
                    if (success) {
                        this.updateUI();
                    }
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
        // Event delegation untuk tombol remove dengan ONE-TIME CLICK
        document.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.btn-remove');
            if (removeBtn) {
                e.preventDefault();
                e.stopPropagation();
                
                const index = parseInt(removeBtn.dataset.index);
                const type = removeBtn.dataset.type;
                
                // Show confirmation ONCE
                if (confirm(`Are you sure you want to remove this ${type}?`)) {
                    switch(type) {
                        case 'warehouse':
                            this.removeWarehouse(index);
                            break;
                        case 'supplier':
                            this.removeSupplier(index);
                            break;
                        case 'customer':
                            this.removeCustomer(index);
                            break;
                        case 'category':
                            this.removeCategory(index);
                            break;
                        case 'product':
                            this.removeProduct(index);
                            break;
                    }
                }
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
                    localStorage.removeItem('stockmint_company');
                    localStorage.removeItem('stockmint_warehouses');
                    localStorage.removeItem('stockmint_suppliers');
                    localStorage.removeItem('stockmint_customers');
                    localStorage.removeItem('stockmint_categories');
                    localStorage.removeItem('stockmint_products');
                    window.location.hash = '#dashboard';
                }
                return;
            }
        });
    }

    updateUI() {
        console.log('🔄 Updating UI...');
        
        // Update semua list
        this.updateWarehouseList();
        this.updateSupplierList();
        this.updateCustomerList();
        this.updateCategoryList();
        this.updateProductList();
        this.updateProductCategoryDropdown();
        
        // Update tombol next berdasarkan data - TANPA setTimeout
        const warehouseNext = document.getElementById('nextToSupplier');
        const supplierNext = document.getElementById('nextToCustomer');
        const customerNext = document.getElementById('nextToCategory');
        const categoryNext = document.getElementById('nextToProduct');
        const completeBtn = document.getElementById('completeSetup');
        
        if (warehouseNext) {
            const isDisabled = this.setupData.warehouses.length === 0;
            warehouseNext.disabled = isDisabled;
            warehouseNext.classList.toggle('disabled', isDisabled);
            console.log('🏭 Warehouse next button:', isDisabled ? 'disabled' : 'enabled');
        }
        
        if (supplierNext) {
            const isDisabled = this.setupData.suppliers.length === 0;
            supplierNext.disabled = isDisabled;
            supplierNext.classList.toggle('disabled', isDisabled);
            console.log('🤝 Supplier next button:', isDisabled ? 'disabled' : 'enabled');
        }
        
        if (customerNext) {
            const isDisabled = this.setupData.customers.length === 0;
            customerNext.disabled = isDisabled;
            customerNext.classList.toggle('disabled', isDisabled);
            console.log('👥 Customer next button:', isDisabled ? 'disabled' : 'enabled');
        }
        
        if (categoryNext) {
            const isDisabled = this.setupData.categories.length === 0;
            categoryNext.disabled = isDisabled;
            categoryNext.classList.toggle('disabled', isDisabled);
            console.log('📁 Category next button:', isDisabled ? 'disabled' : 'enabled');
        }
        
        if (completeBtn) {
            const isDisabled = this.setupData.products.length === 0;
            completeBtn.disabled = isDisabled;
            completeBtn.classList.toggle('disabled', isDisabled);
            console.log('✅ Complete button:', isDisabled ? 'disabled' : 'enabled');
        }
        
        // Update tombol add warehouse berdasarkan plan
        const addWarehouseBtn = document.querySelector('#warehouseForm button[type="submit"]');
        if (addWarehouseBtn) {
            const warehouseLimit = this.userPlan === 'basic' ? 1 : 
                                 this.userPlan === 'pro' ? 3 : Infinity;
            const canAddMore = this.setupData.warehouses.length < warehouseLimit;
            addWarehouseBtn.disabled = !canAddMore;
            addWarehouseBtn.classList.toggle('disabled', !canAddMore);
        }
    }

    // ===== DATA SAVING dengan VALIDASI DUPLIKAT =====
    saveCompanyData(validate = true) {
        const name = document.getElementById('companyName')?.value.trim();
        const taxId = document.getElementById('companyTaxId')?.value.trim() || '';
        const address = document.getElementById('companyAddress')?.value.trim() || '';
        const phone = document.getElementById('companyPhone')?.value.trim() || '';
        const email = document.getElementById('companyEmail')?.value.trim() || '';
        const businessType = document.getElementById('businessType')?.value || '';
        const agreeTerms = document.getElementById('agreeTerms')?.checked || false;
        
        if (validate) {
            if (!name) throw new Error('Company name is required');
            if (!agreeTerms) throw new Error('You must agree to the Terms of Service');
        }
        
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
        console.log('💾 Company data saved');
        return true;
    }

    saveWarehouseData() {
        const name = document.getElementById('warehouseName')?.value.trim();
        const address = document.getElementById('warehouseAddress')?.value.trim() || '';
        const isPrimary = document.getElementById('isPrimary')?.checked || false;
        
        if (!name) throw new Error('Warehouse name is required');
        
        // Check plan restrictions
        const warehouseLimit = this.userPlan === 'basic' ? 1 : 
                             this.userPlan === 'pro' ? 3 : Infinity;
        
        if (this.setupData.warehouses.length >= warehouseLimit) {
            throw new Error(`You can only have ${warehouseLimit} warehouse(s) in your current plan.`);
        }
        
        // VALIDASI: Cek duplikat nama warehouse
        const existingWarehouse = this.setupData.warehouses.find(wh => 
            wh.name.toLowerCase() === name.toLowerCase()
        );
        
        if (existingWarehouse) {
            throw new Error('Warehouse with this name already exists');
        }
        
        // Generate ID sederhana: WH-001, WH-002, dst
        this.warehouseCounter++;
        const warehouseCode = `WH-${this.warehouseCounter.toString().padStart(3, '0')}`;
        
        const warehouse = {
            id: warehouseCode,
            name,
            code: warehouseCode,
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
        const form = document.getElementById('warehouseForm');
        if (form) {
            form.reset();
            // Reset primary checkbox jika sudah ada warehouse
            if (this.setupData.warehouses.length > 0) {
                document.getElementById('isPrimary').checked = false;
            }
        }
        
        console.log('💾 Warehouse added:', warehouse.name);
        return true;
    }

    saveSupplierData() {
        const name = document.getElementById('supplierName')?.value.trim();
        const contact = document.getElementById('supplierContact')?.value.trim() || '';
        const phone = document.getElementById('supplierPhone')?.value.trim() || '';
        const email = document.getElementById('supplierEmail')?.value.trim() || '';
        
        if (!name) throw new Error('Supplier name is required');
        
        // VALIDASI: Cek duplikat nama supplier
        const existingSupplier = this.setupData.suppliers.find(sup => 
            sup.name.toLowerCase() === name.toLowerCase()
        );
        
        if (existingSupplier) {
            throw new Error('Supplier with this name already exists');
        }
        
        this.supplierCounter++;
        const supplierCode = `SUP-${this.supplierCounter.toString().padStart(3, '0')}`;
        
        const supplier = {
            id: supplierCode,
            name,
            code: supplierCode,
            contact,
            phone,
            email,
            isActive: true,
            createdAt: new Date().toISOString()
        };
        
        this.setupData.suppliers.push(supplier);
        localStorage.setItem('stockmint_suppliers', JSON.stringify(this.setupData.suppliers));
        
        const form = document.getElementById('supplierForm');
        if (form) form.reset();
        
        console.log('💾 Supplier added:', supplier.name);
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
        
        // VALIDASI: Cek duplikat nama customer
        const existingCustomer = this.setupData.customers.find(cust => 
            cust.name.toLowerCase() === name.toLowerCase()
        );
        
        if (existingCustomer) {
            throw new Error('Customer with this name already exists');
        }
        
        this.customerCounter++;
        const customerCode = `CUST-${this.customerCounter.toString().padStart(3, '0')}`;
        
        const customer = {
            id: customerCode,
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
        
        const form = document.getElementById('customerForm');
        if (form) form.reset();
        
        console.log('💾 Customer added:', customer.name);
        return true;
    }

    saveCategoryData() {
        const name = document.getElementById('categoryName')?.value.trim();
        const description = document.getElementById('categoryDescription')?.value.trim() || '';
        
        if (!name) throw new Error('Category name is required');
        
        // VALIDASI: Cek duplikat nama kategori
        const existingCategory = this.setupData.categories.find(cat => 
            cat.name.toLowerCase() === name.toLowerCase()
        );
        
        if (existingCategory) {
            throw new Error('Category with this name already exists');
        }
        
        this.categoryCounter++;
        const categoryCode = `CAT-${this.categoryCounter.toString().padStart(3, '0')}`;
        
        const category = {
            id: categoryCode,
            name,
            code: categoryCode,
            description,
            createdAt: new Date().toISOString()
        };
        
        this.setupData.categories.push(category);
        localStorage.setItem('stockmint_categories', JSON.stringify(this.setupData.categories));
        
        const form = document.getElementById('categoryForm');
        if (form) form.reset();
        
        console.log('💾 Category added:', category.name);
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
        
        // VALIDASI: Cek duplikat nama product
        const existingProduct = this.setupData.products.find(prod => 
            prod.name.toLowerCase() === name.toLowerCase()
        );
        
        if (existingProduct) {
            throw new Error('Product with this name already exists');
        }
        
        this.productCounter++;
        const productCode = `PROD-${this.productCounter.toString().padStart(3, '0')}`;
        
        const product = {
            id: productCode,
            name,
            code: productCode,
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
        
        const form = document.getElementById('productForm');
        if (form) form.reset();
        
        console.log('💾 Product added:', product.name);
        return true;
    }

    // ===== UPDATE LIST METHODS =====
    updateWarehouseList() {
        const savedItems = document.querySelector('.warehouse-items');
        if (!savedItems) return;
        
        const warehouses = this.setupData.warehouses || [];
        const warehouseLimit = this.userPlan === 'basic' ? 1 : 
                             this.userPlan === 'pro' ? 3 : Infinity;
        
        savedItems.innerHTML = `
            <h4><i class="fas fa-check-circle" style="color: #10b981;"></i> Added Warehouses (${warehouses.length}/${warehouseLimit})</h4>
            ${warehouses.length > 0 ? `
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
            ` : `
                <p class="text-muted">No warehouses added yet.</p>
            `}
        `;
    }

    updateSupplierList() {
        const savedItems = document.querySelector('.supplier-items');
        if (!savedItems) return;
        
        const suppliers = this.setupData.suppliers || [];
        
        savedItems.innerHTML = `
            <h4><i class="fas fa-check-circle" style="color: #10b981;"></i> Added Suppliers (${suppliers.length})</h4>
            ${suppliers.length > 0 ? `
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
            ` : `
                <p class="text-muted">No suppliers added yet.</p>
            `}
        `;
    }

    updateCustomerList() {
        const savedItems = document.querySelector('.customer-items');
        if (!savedItems) return;
        
        const customers = this.setupData.customers || [];
        
        savedItems.innerHTML = `
            <h4><i class="fas fa-check-circle" style="color: #10b981;"></i> Added Customers (${customers.length})</h4>
            ${customers.length > 0 ? `
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
            ` : `
                <p class="text-muted">No customers added yet.</p>
            `}
        `;
    }

    updateCategoryList() {
        const savedItems = document.querySelector('.category-items');
        if (!savedItems) return;
        
        const categories = this.setupData.categories || [];
        
        savedItems.innerHTML = `
            <h4><i class="fas fa-check-circle" style="color: #10b981;"></i> Added Categories (${categories.length})</h4>
            ${categories.length > 0 ? `
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
            ` : `
                <p class="text-muted">No categories added yet.</p>
            `}
        `;
    }

    updateProductList() {
        const savedItems = document.querySelector('.product-items');
        if (!savedItems) return;
        
        const products = this.setupData.products || [];
        
        savedItems.innerHTML = `
            <h4><i class="fas fa-check-circle" style="color: #10b981;"></i> Added Products (${products.length})</h4>
            ${products.length > 0 ? `
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
            ` : `
                <p class="text-muted">No products added yet.</p>
            `}
        `;
    }

    updateProductCategoryDropdown() {
        const dropdown = document.getElementById('productCategory');
        if (dropdown) {
            const categories = this.setupData.categories || [];
            // Remove duplicates by name
            const uniqueCategories = [];
            const seenNames = new Set();
            
            categories.forEach(cat => {
                if (!seenNames.has(cat.name.toLowerCase())) {
                    seenNames.add(cat.name.toLowerCase());
                    uniqueCategories.push(cat);
                }
            });
            
            dropdown.innerHTML = `
                <option value="">Select Category</option>
                ${uniqueCategories.map(cat => `
                    <option value="${cat.id}">${cat.name}</option>
                `).join('')}
            `;
        }
    }

    // ===== REMOVE ITEMS (SINGLE CONFIRMATION) =====
    removeWarehouse(index) {
        this.setupData.warehouses.splice(index, 1);
        localStorage.setItem('stockmint_warehouses', JSON.stringify(this.setupData.warehouses));
        this.updateWarehouseList();
        this.updateUI();
        console.log('🗑️ Warehouse removed');
    }

    removeSupplier(index) {
        this.setupData.suppliers.splice(index, 1);
        localStorage.setItem('stockmint_suppliers', JSON.stringify(this.setupData.suppliers));
        this.updateSupplierList();
        this.updateUI();
        console.log('🗑️ Supplier removed');
    }

    removeCustomer(index) {
        this.setupData.customers.splice(index, 1);
        localStorage.setItem('stockmint_customers', JSON.stringify(this.setupData.customers));
        this.updateCustomerList();
        this.updateUI();
        console.log('🗑️ Customer removed');
    }

    removeCategory(index) {
        this.setupData.categories.splice(index, 1);
        localStorage.setItem('stockmint_categories', JSON.stringify(this.setupData.categories));
        this.updateCategoryList();
        this.updateUI();
        this.updateProductCategoryDropdown();
        console.log('🗑️ Category removed');
    }

    removeProduct(index) {
        this.setupData.products.splice(index, 1);
        localStorage.setItem('stockmint_products', JSON.stringify(this.setupData.products));
        this.updateProductList();
        this.updateUI();
        console.log('🗑️ Product removed');
    }

    // ===== COMPLETE SETUP =====
    async completeSetup() {
        try {
            // Mark setup as completed
            localStorage.setItem('stockmint_setup_completed', 'true');
            localStorage.setItem('stockmint_setup_date', new Date().toISOString());
            
            // Create opening stock
            this.createOpeningStock();
            
            // Show success message
            this.showAlert('🎉 Setup completed successfully! Redirecting to dashboard...', 'success');
            
            // Redirect to dashboard
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
        console.log('📦 Opening stock created:', openingStocks.length, 'items');
    }

    // ===== RESET DATA FUNCTION =====
    resetSetupData() {
        if (confirm('Reset setup data? This will remove company, warehouse, supplier, customer, category, and product data, but keep your user account.')) {
            // Remove setup data
            localStorage.removeItem('stockmint_setup_completed');
            localStorage.removeItem('stockmint_company');
            localStorage.removeItem('stockmint_warehouses');
            localStorage.removeItem('stockmint_suppliers');
            localStorage.removeItem('stockmint_customers');
            localStorage.removeItem('stockmint_categories');
            localStorage.removeItem('stockmint_products');
            localStorage.removeItem('stockmint_opening_stocks');
            localStorage.removeItem('stockmint_setup_current_step');
            
            // Redirect to setup page
            window.location.hash = '#setup/start-new';
            window.location.reload();
        }
    }

    // ===== RENDER MIGRATE PAGE (with back button) =====
    renderMigratePage() {
        return `
            <div class="page-content">
                <h1>📊 Data Migration</h1>
                <p class="page-subtitle">Import your existing data from Excel</p>
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-database"></i> Migration Guide</h3>
                        <p>For advanced users who understand database relationships</p>
                    </div>
                    
                    <div class="card-body">
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle"></i>
                            <strong>Warning:</strong> This feature is for advanced users. 
                            Incorrect data format may cause system errors.
                        </div>
                        
                        <div class="migration-steps">
                            <h4>Step-by-Step Migration:</h4>
                            <ol>
                                <li>Download the migration template</li>
                                <li>Fill in your data following the format</li>
                                <li>Upload the completed Excel file</li>
                                <li>Review and confirm the import</li>
                            </ol>
                        </div>
                        
                        <div class="migration-actions" style="display: flex; flex-direction: column; gap: 15px;">
                            <button class="btn-secondary" onclick="window.location.hash='#setup/start-new'">
                                <i class="fas fa-arrow-left"></i> Back to New Setup
                            </button>
                            
                            <a href="template.html" target="_blank" class="btn-primary" style="text-align: center;">
                                <i class="fas fa-download"></i> Download Template
                            </a>
                            
                            <div class="file-upload-area" id="fileUploadArea" 
                                 style="border: 2px dashed #ddd; border-radius: 10px; padding: 40px 20px; text-align: center;">
                                <i class="fas fa-cloud-upload-alt" style="font-size: 48px; color: #19BEBB;"></i>
                                <p>Drag & drop your Excel file here or click to browse</p>
                                <input type="file" id="migrationFile" accept=".xlsx,.xls" hidden>
                                <button class="btn-upload" onclick="document.getElementById('migrationFile').click()"
                                        style="background: #19BEBB; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-top: 15px;">
                                    Browse Files
                                </button>
                                <p class="file-info" id="fileInfo" style="margin-top: 10px; color: #666;">No file selected</p>
                            </div>
                            
                            <button class="btn-success" id="processMigration" disabled
                                    style="background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; cursor: pointer;">
                                <i class="fas fa-play"></i> Process Migration
                            </button>
                        </div>
                        
                        <div id="migrationStatus" style="margin-top: 20px;"></div>
                    </div>
                </div>
            </div>
            
            <script>
                document.addEventListener('DOMContentLoaded', function() {
                    const fileInput = document.getElementById('migrationFile');
                    const fileInfo = document.getElementById('fileInfo');
                    const processBtn = document.getElementById('processMigration');
                    const uploadArea = document.getElementById('fileUploadArea');
                    
                    // File drag and drop
                    uploadArea.addEventListener('dragover', (e) => {
                        e.preventDefault();
                        uploadArea.style.borderColor = '#19BEBB';
                        uploadArea.style.background = '#f0f9f9';
                    });
                    
                    uploadArea.addEventListener('dragleave', (e) => {
                        e.preventDefault();
                        uploadArea.style.borderColor = '#ddd';
                        uploadArea.style.background = '#fafafa';
                    });
                    
                    uploadArea.addEventListener('drop', (e) => {
                        e.preventDefault();
                        uploadArea.style.borderColor = '#ddd';
                        uploadArea.style.background = '#fafafa';
                        
                        if (e.dataTransfer.files.length) {
                            fileInput.files = e.dataTransfer.files;
                            handleFileSelect();
                        }
                    });
                    
                    fileInput.addEventListener('change', handleFileSelect);
                    
                    function handleFileSelect() {
                        if (fileInput.files.length) {
                            const file = fileInput.files[0];
                            fileInfo.textContent = \`Selected: \${file.name} (\${(file.size / 1024).toFixed(1)} KB)\`;
                            fileInfo.style.color = '#10b981';
                            processBtn.disabled = false;
                        }
                    }
                    
                    // Process migration button
                    processBtn.addEventListener('click', function() {
                        if (!fileInput.files.length) {
                            alert('Please select a file first');
                            return;
                        }
                        
                        const statusDiv = document.getElementById('migrationStatus');
                        statusDiv.innerHTML = '<div class="alert alert-info"><i class="fas fa-spinner fa-spin"></i> Processing migration file...</div>';
                        
                        // Simulate processing
                        setTimeout(() => {
                            statusDiv.innerHTML = \`
                                <div class="alert alert-success">
                                    <i class="fas fa-check-circle"></i>
                                    Migration completed successfully! 25 records imported.
                                </div>
                                <button class="btn-primary" onclick="window.location.hash='#dashboard'" 
                                        style="background: #19BEBB; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                                    Go to Dashboard
                                </button>
                            \`;
                        }, 2000);
                    });
                });
            </script>
        `;
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

    // ===== PROGRESS BAR =====
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

    // ===== RENDER STEPS =====
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
                                    value="${this.escapeHtml(savedData.name || '')}" required
                                    placeholder="e.g., PT. Usaha Maju Jaya">
                            </div>
                            
                            <div class="form-group">
                                <label for="companyTaxId">Tax ID (NPWP)</label>
                                <input type="text" id="companyTaxId" class="form-control"
                                    value="${this.escapeHtml(savedData.taxId || '')}"
                                    placeholder="e.g., 01.234.567.8-912.000">
                            </div>
                            
                            <div class="form-group">
                                <label for="companyAddress">Business Address</label>
                                <textarea id="companyAddress" class="form-control" rows="3"
                                    placeholder="Full business address">${this.escapeHtml(savedData.address || '')}</textarea>
                            </div>
                            
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="companyPhone">Phone Number</label>
                                    <input type="tel" id="companyPhone" class="form-control"
                                        value="${this.escapeHtml(savedData.phone || '')}"
                                        placeholder="e.g., 021-12345678">
                                </div>
                                
                                <div class="form-group">
                                    <label for="companyEmail">Email Address</label>
                                    <input type="email" id="companyEmail" class="form-control"
                                        value="${this.escapeHtml(savedData.email || '')}"
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
                                <input type="checkbox" id="agreeTerms" class="form-check-input" required ${savedData.name ? 'checked' : ''}>
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
        `;
    }

    renderWarehouseStep() {
        const savedWarehouses = this.setupData.warehouses || [];
        const warehouseLimit = this.userPlan === 'basic' ? 1 : 
                             this.userPlan === 'pro' ? 3 : Infinity;
        
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
                        <p><small><i class="fas fa-info-circle"></i> Warehouse ID will be auto-generated (WH-001, WH-002, etc)</small></p>
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
        `;
    }

    // ... [Render methods lainnya tetap sama dengan sebelumnya, hanya perlu tambah escapeHtml] ...

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Create global instance
window.SetupWizardMulti = SetupWizardMulti;
console.log('✅ SetupWizardMulti loaded and ready');
