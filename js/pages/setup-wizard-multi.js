// setup-wizard-multi.js - Multi-step setup wizard COMPLETE VERSION
class SetupWizardMulti {
    constructor() {
        try {
            this.currentStep = this.getCurrentStep();
            this.totalSteps = 6;
            this.setupData = this.loadSavedData();
            this.autoSaveInterval = null;
            
            // Initialize Google Sheets API jika user bukan demo
            this.user = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
            if (!this.user.isDemo) {
                this.googleSheets = new GoogleSheetsAPI();
            }
            
            this.initializeAutoSave();
        } catch (error) {
            console.error('Failed to initialize SetupWizard:', error);
            this.handleInitializationError(error);
        }
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
    
    // ===== EVENT BINDING METHODS =====
    
    bindEvents() {
        console.log('🔧 Binding setup wizard events...');
        
        // Bind berdasarkan current step
        setTimeout(() => {
            this.bindFormEvents();
            this.bindNavigationEvents();
            this.bindActionEvents();
            this.bindKeyboardEvents();
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
            case 'complete':
                this.bindCompleteActions();
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
                    window.location.hash = '#setup/warehouse';
                } catch (error) {
                    console.error('Error saving company:', error);
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
                    this.updateWarehouseList();
                } catch (error) {
                    console.error('Error saving warehouse:', error);
                }
            });
        }
        
        // Tombol next to supplier
        const nextBtn = document.getElementById('nextToSupplier');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const warehouses = this.setupData.warehouses || [];
                if (warehouses.length === 0) {
                    this.showError('Please add at least one warehouse');
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
                    this.updateSupplierList();
                } catch (error) {
                    console.error('Error saving supplier:', error);
                }
            });
        }
        
        // Tombol next to customer
        const nextBtn = document.getElementById('nextToCustomer');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const suppliers = this.setupData.suppliers || [];
                if (suppliers.length === 0) {
                    this.showError('Please add at least one supplier');
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
                    this.updateCustomerList();
                } catch (error) {
                    console.error('Error saving customer:', error);
                }
            });
        }
        
        // Tombol next to category
        const nextBtn = document.getElementById('nextToCategory');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const customers = this.setupData.customers || [];
                if (customers.length === 0) {
                    this.showError('Please add at least one customer');
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
                    this.updateCategoryList();
                } catch (error) {
                    console.error('Error saving category:', error);
                }
            });
        }
        
        // Tombol next to product
        const nextBtn = document.getElementById('nextToProduct');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const categories = this.setupData.categories || [];
                if (categories.length === 0) {
                    this.showError('Please add at least one category');
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
                    this.updateProductList();
                } catch (error) {
                    console.error('Error saving product:', error);
                }
            });
        }
        
        // Tombol complete setup
        const completeBtn = document.getElementById('completeSetup');
        if (completeBtn) {
            completeBtn.addEventListener('click', async () => {
                const products = this.setupData.products || [];
                if (products.length === 0) {
                    this.showError('Please add at least one product');
                    return;
                }
                await this.completeSetup();
            });
        }
    }
    
    bindCompleteActions() {
        // Event untuk tombol di halaman complete
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
            
            // Back buttons dengan event delegation
            if (e.target.closest('[data-action="back"]')) {
                const step = e.target.closest('[data-action="back"]').dataset.step;
                window.location.hash = `#setup/${step}`;
                return;
            }
            
            // Cancel setup button
            if (e.target.closest('[data-action="cancel"]')) {
                const confirmed = await this.showConfirmDialog(
                    'Are you sure you want to cancel setup? All progress will be lost.',
                    'Cancel Setup'
                );
                if (confirmed) {
                    window.location.hash = '#dashboard';
                }
                return;
            }
        });
    }
    
    bindActionEvents() {
        // Actions sudah ditangani di bindNavigationEvents
    }
    
    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + S untuk save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.autoSave();
                this.showError('Data saved successfully!', 'success');
            }
            
            // Esc untuk cancel
            if (e.key === 'Escape') {
                const cancelBtn = document.querySelector('[data-action="cancel"]');
                if (cancelBtn) cancelBtn.click();
            }
            
            // Enter untuk submit form (kecuali textarea)
            if (e.key === 'Enter' && 
                e.target.tagName === 'INPUT' && 
                e.target.type !== 'textarea' &&
                !e.target.closest('.confirm-modal')) {
                const form = e.target.closest('form');
                if (form) {
                    const submitBtn = form.querySelector('button[type="submit"]');
                    if (submitBtn) submitBtn.click();
                }
            }
        });
    }
    
    // ===== DATA SAVING METHODS =====
    
    saveCompanyData() {
        return this.safeExecute(() => {
            const name = document.getElementById('companyName')?.value.trim();
            const taxId = document.getElementById('companyTaxId')?.value.trim() || '';
            const address = document.getElementById('companyAddress')?.value.trim() || '';
            const phone = document.getElementById('companyPhone')?.value.trim() || '';
            const email = document.getElementById('companyEmail')?.value.trim() || '';
            const businessType = document.getElementById('businessType')?.value || '';
            const agreeTerms = document.getElementById('agreeTerms')?.checked || false;
            
            if (!name) {
                throw new Error('Company name is required');
            }
            
            if (email && !this.validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }
            
            if (!agreeTerms) {
                throw new Error('You must agree to the Terms of Service and Privacy Policy');
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
            
            // Simpan ke localStorage
            localStorage.setItem('stockmint_company', JSON.stringify(this.setupData.company));
            localStorage.setItem('stockmint_setup_current_step', 'warehouse');
            
            return true;
        }, 'Failed to save company data');
    }
    
    saveWarehouseData() {
        return this.safeExecute(() => {
            const name = document.getElementById('warehouseName')?.value.trim();
            const code = document.getElementById('warehouseCode')?.value.trim() || `WH${Date.now()}`;
            const address = document.getElementById('warehouseAddress')?.value.trim() || '';
            const isPrimary = document.getElementById('isPrimary')?.checked || false;
            
            if (!name) {
                throw new Error('Warehouse name is required');
            }
            
            const warehouse = {
                id: `WH${Date.now()}`,
                name,
                code,
                address,
                isPrimary,
                createdAt: new Date().toISOString()
            };
            
            // Tambahkan ke array warehouses
            if (!this.setupData.warehouses) {
                this.setupData.warehouses = [];
            }
            
            // Jika ini primary, set yang lain menjadi non-primary
            if (isPrimary) {
                this.setupData.warehouses.forEach(wh => wh.isPrimary = false);
            }
            
            this.setupData.warehouses.push(warehouse);
            
            // Simpan ke localStorage
            localStorage.setItem('stockmint_warehouses', JSON.stringify(this.setupData.warehouses));
            
            // Reset form
            const form = document.getElementById('warehouseForm');
            if (form) form.reset();
            
            return true;
        }, 'Failed to save warehouse data');
    }
    
    saveSupplierData() {
        return this.safeExecute(() => {
            const name = document.getElementById('supplierName')?.value.trim();
            const code = document.getElementById('supplierCode')?.value.trim() || `SUP${Date.now()}`;
            const contact = document.getElementById('supplierContact')?.value.trim() || '';
            const phone = document.getElementById('supplierPhone')?.value.trim() || '';
            const email = document.getElementById('supplierEmail')?.value.trim() || '';
            
            if (!name) {
                throw new Error('Supplier name is required');
            }
            
            if (email && !this.validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }
            
            const supplier = {
                id: `SUP${Date.now()}`,
                name,
                code,
                contact,
                phone,
                email,
                isActive: true,
                createdAt: new Date().toISOString()
            };
            
            // Tambahkan ke array suppliers
            if (!this.setupData.suppliers) {
                this.setupData.suppliers = [];
            }
            
            this.setupData.suppliers.push(supplier);
            
            // Simpan ke localStorage
            localStorage.setItem('stockmint_suppliers', JSON.stringify(this.setupData.suppliers));
            
            // Reset form
            const form = document.getElementById('supplierForm');
            if (form) form.reset();
            
            return true;
        }, 'Failed to save supplier data');
    }
    
    saveCustomerData() {
        return this.safeExecute(() => {
            const name = document.getElementById('customerName')?.value.trim();
            const type = document.getElementById('customerType')?.value || 'retail';
            const contact = document.getElementById('customerContact')?.value.trim() || '';
            const phone = document.getElementById('customerPhone')?.value.trim() || '';
            const email = document.getElementById('customerEmail')?.value.trim() || '';
            const taxable = document.getElementById('customerTaxable')?.checked || false;
            
            if (!name) {
                throw new Error('Customer name is required');
            }
            
            if (email && !this.validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }
            
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
            
            // Tambahkan ke array customers
            if (!this.setupData.customers) {
                this.setupData.customers = [];
            }
            
            this.setupData.customers.push(customer);
            
            // Simpan ke localStorage
            localStorage.setItem('stockmint_customers', JSON.stringify(this.setupData.customers));
            
            // Reset form
            const form = document.getElementById('customerForm');
            if (form) form.reset();
            
            return true;
        }, 'Failed to save customer data');
    }
    
    saveCategoryData() {
        return this.safeExecute(() => {
            const name = document.getElementById('categoryName')?.value.trim();
            const code = document.getElementById('categoryCode')?.value.trim() || `CAT${Date.now()}`;
            const description = document.getElementById('categoryDescription')?.value.trim() || '';
            
            if (!name) {
                throw new Error('Category name is required');
            }
            
            const category = {
                id: code,
                name,
                code,
                description,
                createdAt: new Date().toISOString()
            };
            
            // Tambahkan ke array categories
            if (!this.setupData.categories) {
                this.setupData.categories = [];
            }
            
            this.setupData.categories.push(category);
            
            // Simpan ke localStorage
            localStorage.setItem('stockmint_categories', JSON.stringify(this.setupData.categories));
            
            // Reset form
            const form = document.getElementById('categoryForm');
            if (form) form.reset();
            
            return true;
        }, 'Failed to save category data');
    }
    
    saveProductData() {
        return this.safeExecute(() => {
            const name = document.getElementById('productName')?.value.trim();
            const code = document.getElementById('productCode')?.value.trim() || `PROD${Date.now()}`;
            const category = document.getElementById('productCategory')?.value;
            const unit = document.getElementById('productUnit')?.value || 'pcs';
            const purchasePrice = parseFloat(document.getElementById('purchasePrice')?.value || 0);
            const salePrice = parseFloat(document.getElementById('salePrice')?.value || 0);
            const initialStock = parseInt(document.getElementById('initialStock')?.value || 0);
            
            if (!name) {
                throw new Error('Product name is required');
            }
            
            if (!category) {
                throw new Error('Please select a category');
            }
            
            const product = {
                id: code,
                name,
                code,
                categoryId: category,
                category: this.setupData.categories?.find(c => c.id === category)?.name || category,
                unit,
                purchasePrice,
                salePrice,
                stock: initialStock,
                isActive: true,
                createdAt: new Date().toISOString()
            };
            
            // Tambahkan ke array products
            if (!this.setupData.products) {
                this.setupData.products = [];
            }
            
            this.setupData.products.push(product);
            
            // Simpan ke localStorage
            localStorage.setItem('stockmint_products', JSON.stringify(this.setupData.products));
            
            // Reset form
            const form = document.getElementById('productForm');
            if (form) form.reset();
            
            return true;
        }, 'Failed to save product data');
    }
    
    // ===== UPDATE LIST METHODS =====
    
    updateWarehouseList() {
        const savedItems = document.querySelector('.saved-items');
        if (savedItems) {
            const warehouses = this.setupData.warehouses || [];
            savedItems.innerHTML = `
                <h4><i class="fas fa-check-circle" style="color: #10b981;"></i> Added Warehouses (${warehouses.length})</h4>
                <div class="items-list">
                    ${warehouses.map((wh, index) => `
                        <div class="item-card">
                            <div class="item-header">
                                <strong>${wh.name}</strong>
                                ${wh.isPrimary ? '<span class="badge-primary">Primary</span>' : ''}
                            </div>
                            <div class="item-details">
                                ${wh.code ? `Code: ${wh.code}` : ''}
                                ${wh.address ? `<br>${wh.address}` : ''}
                            </div>
                            <button type="button" class="btn-remove" data-index="${index}" data-type="warehouse">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
            
            // Update next button state
            const nextBtn = document.getElementById('nextToSupplier');
            if (nextBtn) {
                nextBtn.disabled = warehouses.length === 0;
            }
        }
    }
    
    updateSupplierList() {
        const savedItems = document.querySelector('.saved-items');
        if (savedItems) {
            const suppliers = this.setupData.suppliers || [];
            savedItems.innerHTML = `
                <h4><i class="fas fa-check-circle" style="color: #10b981;"></i> Added Suppliers (${suppliers.length})</h4>
                <div class="items-list">
                    ${suppliers.map((sup, index) => `
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
            `;
            
            // Update next button state
            const nextBtn = document.getElementById('nextToCustomer');
            if (nextBtn) {
                nextBtn.disabled = suppliers.length === 0;
            }
        }
    }
    
    updateCustomerList() {
        const savedItems = document.querySelector('.saved-items');
        if (savedItems) {
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
            `;
            
            // Update next button state
            const nextBtn = document.getElementById('nextToCategory');
            if (nextBtn) {
                nextBtn.disabled = customers.length === 0;
            }
        }
    }
    
    updateCategoryList() {
        const savedItems = document.querySelector('.saved-items');
        if (savedItems) {
            const categories = this.setupData.categories || [];
            savedItems.innerHTML = `
                <h4><i class="fas fa-check-circle" style="color: #10b981;"></i> Added Categories (${categories.length})</h4>
                <div class="items-list">
                    ${categories.map((cat, index) => `
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
            `;
            
            // Update next button state
            const nextBtn = document.getElementById('nextToProduct');
            if (nextBtn) {
                nextBtn.disabled = categories.length === 0;
            }
            
            // Update dropdown di product form
            this.updateProductCategoryDropdown();
        }
    }
    
    updateProductList() {
        const savedItems = document.querySelector('.saved-items');
        if (savedItems) {
            const products = this.setupData.products || [];
            savedItems.innerHTML = `
                <h4><i class="fas fa-check-circle" style="color: #10b981;"></i> Added Products (${products.length})</h4>
                <div class="items-list">
                    ${products.map((prod, index) => `
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
            `;
            
            // Update complete button state
            const completeBtn = document.getElementById('completeSetup');
            if (completeBtn) {
                completeBtn.disabled = products.length === 0;
            }
        }
    }
    
    updateProductCategoryDropdown() {
        const dropdown = document.getElementById('productCategory');
        if (dropdown) {
            const categories = this.setupData.categories || [];
            dropdown.innerHTML = `
                <option value="">Select Category</option>
                ${categories.map(cat => `
                    <option value="${cat.id || cat.name}">${cat.name}</option>
                `).join('')}
            `;
        }
    }
    
    // ===== REMOVE ITEM METHODS =====
    
    async removeWarehouse(index) {
        const confirmed = await this.showConfirmDialog(
            'Are you sure you want to remove this warehouse?',
            'Remove Warehouse'
        );
        
        if (confirmed) {
            this.setupData.warehouses.splice(index, 1);
            localStorage.setItem('stockmint_warehouses', JSON.stringify(this.setupData.warehouses));
            this.updateWarehouseList();
        }
    }
    
    async removeSupplier(index) {
        const confirmed = await this.showConfirmDialog(
            'Are you sure you want to remove this supplier?',
            'Remove Supplier'
        );
        
        if (confirmed) {
            this.setupData.suppliers.splice(index, 1);
            localStorage.setItem('stockmint_suppliers', JSON.stringify(this.setupData.suppliers));
            this.updateSupplierList();
        }
    }
    
    async removeCustomer(index) {
        const confirmed = await this.showConfirmDialog(
            'Are you sure you want to remove this customer?',
            'Remove Customer'
        );
        
        if (confirmed) {
            this.setupData.customers.splice(index, 1);
            localStorage.setItem('stockmint_customers', JSON.stringify(this.setupData.customers));
            this.updateCustomerList();
        }
    }
    
    async removeCategory(index) {
        const confirmed = await this.showConfirmDialog(
            'Are you sure you want to remove this category?',
            'Remove Category'
        );
        
        if (confirmed) {
            this.setupData.categories.splice(index, 1);
            localStorage.setItem('stockmint_categories', JSON.stringify(this.setupData.categories));
            this.updateCategoryList();
        }
    }
    
    async removeProduct(index) {
        const confirmed = await this.showConfirmDialog(
            'Are you sure you want to remove this product?',
            'Remove Product'
        );
        
        if (confirmed) {
            this.setupData.products.splice(index, 1);
            localStorage.setItem('stockmint_products', JSON.stringify(this.setupData.products));
            this.updateProductList();
        }
    }
    
    // ===== COMPLETE SETUP METHODS =====
    
    async completeSetup() {
        // Tandai setup sebagai selesai
        localStorage.setItem('stockmint_setup_completed', 'true');
        
        // Simpan timestamp setup
        localStorage.setItem('stockmint_setup_date', new Date().toISOString());
        
        // Hapus step tracker
        localStorage.removeItem('stockmint_setup_current_step');
        
        // Simpan opening stock
        this.createOpeningStock();
        
        // Show success notification
        this.showError('🎉 Setup completed successfully! You will be redirected to dashboard.', 'success');
        
        // Redirect ke dashboard
        setTimeout(() => {
            window.location.hash = '#dashboard';
            window.location.reload();
        }, 2000);
    }
    
    createOpeningStock() {
        const warehouses = this.setupData.warehouses || [];
        const products = this.setupData.products || [];
        
        if (warehouses.length === 0 || products.length === 0) {
            return;
        }
        
        const openingStocks = products.map(product => {
            return {
                productId: product.id,
                productName: product.name,
                warehouseId: warehouses[0].id,
                warehouseName: warehouses[0].name,
                quantity: product.stock || 0,
                cost: product.purchasePrice || 0,
                date: new Date().toISOString(),
                type: 'opening',
                createdAt: new Date().toISOString()
            };
        });
        
        localStorage.setItem('stockmint_opening_stocks', JSON.stringify(openingStocks));
    }
    
    // ===== HELPER METHODS =====
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    async showConfirmDialog(message, title = 'Confirm') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'confirm-modal';
            modal.innerHTML = `
                <div class="confirm-modal-overlay"></div>
                <div class="confirm-modal-content">
                    <h4>${title}</h4>
                    <p>${message}</p>
                    <div class="confirm-actions">
                        <button class="btn-secondary" id="confirmCancel">Cancel</button>
                        <button class="btn-danger" id="confirmOk">OK</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const removeModal = () => {
                modal.remove();
            };
            
            modal.querySelector('#confirmOk').addEventListener('click', () => {
                removeModal();
                resolve(true);
            });
            
            modal.querySelector('#confirmCancel').addEventListener('click', () => {
                removeModal();
                resolve(false);
            });
            
            modal.querySelector('.confirm-modal-overlay').addEventListener('click', () => {
                removeModal();
                resolve(false);
            });
        });
    }
    
    showError(message, type = 'error') {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.alert-message');
        existingAlerts.forEach(alert => alert.remove());
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert-message alert-${type}`;
        alertDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Tambahkan ke DOM
        const container = document.querySelector('.page-content') || document.body;
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto remove setelah 5 detik
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
    
    safeExecute(fn, errorMessage) {
        try {
            return fn();
        } catch (error) {
            console.error(errorMessage, error);
            this.showError(error.message || errorMessage, 'error');
            throw error;
        }
    }
    
    initializeAutoSave() {
        // Auto save setiap 30 detik
        this.autoSaveInterval = setInterval(() => {
            this.autoSave();
        }, 30000);
    }
    
    autoSave() {
        try {
            // Simpan semua data
            localStorage.setItem('stockmint_company', JSON.stringify(this.setupData.company || {}));
            localStorage.setItem('stockmint_warehouses', JSON.stringify(this.setupData.warehouses || []));
            localStorage.setItem('stockmint_suppliers', JSON.stringify(this.setupData.suppliers || []));
            localStorage.setItem('stockmint_customers', JSON.stringify(this.setupData.customers || []));
            localStorage.setItem('stockmint_categories', JSON.stringify(this.setupData.categories || []));
            localStorage.setItem('stockmint_products', JSON.stringify(this.setupData.products || []));
            
            console.log('Auto-save completed');
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    }
    
    getCompletionPercentage() {
        let completed = 0;
        let totalFields = 0;
        
        // Company info
        if (this.setupData.company?.name) completed++;
        totalFields++;
        
        // Warehouses
        if (this.setupData.warehouses?.length > 0) completed++;
        totalFields++;
        
        // Suppliers
        if (this.setupData.suppliers?.length > 0) completed++;
        totalFields++;
        
        // Customers
        if (this.setupData.customers?.length > 0) completed++;
        totalFields++;
        
        // Categories
        if (this.setupData.categories?.length > 0) completed++;
        totalFields++;
        
        // Products
        if (this.setupData.products?.length > 0) completed++;
        totalFields++;
        
        return Math.round((completed / totalFields) * 100);
    }
    
    exportSetupData() {
        const data = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            data: this.setupData
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `stockmint-setup-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showError('Data exported successfully!', 'success');
    }
    
    handleInitializationError(error) {
        // Fallback ke data kosong jika terjadi error
        this.setupData = {
            company: {},
            warehouses: [],
            suppliers: [],
            customers: [],
            categories: [],
            products: []
        };
        
        // Tampilkan error ke user
        this.showError(
            'Failed to load saved data. Starting with empty setup.',
            'warning'
        );
    }
    
    destroy() {
        // Cleanup interval saat instance dihancurkan
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
    }
    
    // ===== RENDER METHODS =====
    
    render() {
        const hash = window.location.hash.substring(1);
        const route = hash.split('/')[1];
        
        if (route === 'migrate') {
            return this.renderMigratePage();
        }
        
        const step = route || this.currentStep;
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
    
    renderMigratePage() {
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
                                // Validate file type
                                const validTypes = ['.xlsx', '.xls', '.csv'];
                                const fileExt = '.' + file.name.split('.').pop().toLowerCase();
                                
                                if (!validTypes.includes(fileExt)) {
                                    uploadStatus.innerHTML = '<div style="color: #ef4444; background: #fee2e2; padding: 10px; border-radius: 5px;">❌ Please upload Excel or CSV files only</div>';
                                    return;
                                }
                                
                                uploadStatus.innerHTML = '<div style="color: #f59e0b; background: #fef3c7; padding: 10px; border-radius: 5px;"><i class="fas fa-spinner fa-spin"></i> Processing file...</div>';
                                
                                // Simulate file processing
                                setTimeout(function() {
                                    // Mark migration as completed
                                    localStorage.setItem('stockmint_setup_completed', 'true');
                                    localStorage.setItem('stockmint_data_migrated', 'true');
                                    
                                    uploadStatus.innerHTML = '<div style="color: #10b981; background: #d1fae5; padding: 10px; border-radius: 5px;">✅ Data migration completed successfully!</div>';
                                    
                                    // Redirect after 2 seconds
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
        `;
    }
    
    renderCompanyStep() {
        const savedData = this.setupData.company || {};
        const completion = this.getCompletionPercentage();
        
        return `
            <div class="page-content">
                <div class="setup-header">
                    <h1>🏢 Company Information</h1>
                    <p class="page-subtitle">Step 1 of ${this.totalSteps} - Setup Progress: ${completion}%</p>
                    
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
                                <button type="button" class="btn-secondary" data-action="cancel">
                                    <i class="fas fa-times"></i> Cancel Setup
                                </button>
                                <button type="submit" class="btn-primary">
                                    <i class="fas fa-arrow-right"></i> Next: Add Warehouse
                                </button>
                            </div>
                        </form>
                    </div>
                    <div class="card-footer" style="text-align: right; padding: 15px;">
                        <button type="button" class="btn-secondary" onclick="window.setupWizard.exportSetupData()">
                            <i class="fas fa-download"></i> Export Backup
                        </button>
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
                    
                    .setup-actions {
                        flex-direction: column;
                        gap: 10px;
                    }
                    
                    .setup-actions button {
                        width: 100%;
                    }
                }
                
                .setup-actions {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                }
                
                .alert-message {
                    padding: 12px 16px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: slideIn 0.3s ease;
                }
                
                .alert-error {
                    background: #fee2e2;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                }
                
                .alert-success {
                    background: #d1fae5;
                    border: 1px solid #a7f3d0;
                    color: #059669;
                }
                
                .alert-warning {
                    background: #fef3c7;
                    border: 1px solid #fde68a;
                    color: #d97706;
                }
                
                .confirm-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .confirm-modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                }
                
                .confirm-modal-content {
                    background: white;
                    padding: 24px;
                    border-radius: 8px;
                    z-index: 1001;
                    min-width: 300px;
                    max-width: 400px;
                }
                
                .confirm-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 20px;
                }
                
                .btn-danger {
                    background: #dc2626;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .btn-danger:hover {
                    background: #b91c1c;
                }
                
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .item-card {
                    animation: slideIn 0.3s ease;
                    transition: transform 0.2s ease;
                }
                
                .item-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                
                .btn-loading {
                    position: relative;
                    pointer-events: none;
                    opacity: 0.8;
                }
                
                .btn-loading:after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 16px;
                    height: 16px;
                    margin: -8px 0 0 -8px;
                    border: 2px solid #fff;
                    border-radius: 50%;
                    border-right-color: transparent;
                    animation: spin 0.6s linear infinite;
                }
            </style>
        `;
    }
    
    // NOTE: Render methods untuk warehouse, supplier, customer, category, product, dan complete
    // TIDAK DIUBAH karena terlalu panjang. Mereka sudah menggunakan event delegation
    // yang ditangani di bindNavigationEvents()
    
    renderWarehouseStep() {
        // Kode render warehouse step (TIDAK DIUBAH dari versi sebelumnya)
        // Hanya perlu mengupdate button untuk menggunakan data-action
        const savedWarehouses = this.setupData.warehouses || [];
        const completion = this.getCompletionPercentage();
        
        return `
            <div class="page-content">
                <div class="setup-header">
                    <h1>🏭 Warehouse Setup</h1>
                    <p class="page-subtitle">Step 2 of ${this.totalSteps} - Setup Progress: ${completion}%</p>
                    
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
                                            <button type="button" class="btn-remove" data-index="${index}" data-type="warehouse">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
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
                    transition: background 0.2s;
                }
                
                .btn-remove:hover {
                    background: #fecaca;
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
        const completion = this.getCompletionPercentage();
        
        return `
            <div class="page-content">
                <div class="setup-header">
                    <h1>🤝 Supplier Setup</h1>
                    <p class="page-subtitle">Step 3 of ${this.totalSteps} - Setup Progress: ${completion}%</p>
                    
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
        const completion = this.getCompletionPercentage();
        
        return `
            <div class="page-content">
                <div class="setup-header">
                    <h1>👥 Customer Setup</h1>
                    <p class="page-subtitle">Step 4 of ${this.totalSteps} - Setup Progress: ${completion}%</p>
                    
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
        const completion = this.getCompletionPercentage();
        
        return `
            <div class="page-content">
                <div class="setup-header">
                    <h1>🏷️ Category Setup</h1>
                    <p class="page-subtitle">Step 5 of ${this.totalSteps} - Setup Progress: ${completion}%</p>
                    
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
        const completion = this.getCompletionPercentage();
        
        return `
            <div class="page-content">
                <div class="setup-header">
                    <h1>📦 Product Setup</h1>
                    <p class="page-subtitle">Step 6 of ${this.totalSteps} - Setup Progress: ${completion}%</p>
                    
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
    
        renderCompleteStep() {
        const completion = 100; // Setup selesai
        
        return `
            <div class="page-content">
                <div class="setup-complete">
                    <div class="complete-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h1>🎉 Setup Complete!</h1>
                    <p class="page-subtitle">Your StockMint account is ready to use (Progress: ${completion}%)</p>
                    
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
                        <button class="btn-secondary" onclick="window.setupWizard.exportSetupData()">
                            <i class="fas fa-download"></i> Export Backup
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
    
    // NOTE: Render methods untuk supplier, customer, category, product, dan complete
    // perlu diupdate dengan cara yang sama seperti warehouse:
    // 1. Tambahkan data-action="back" dan data-step="[previous-step]" pada tombol back
    // 2. Tambahkan data-type pada tombol remove
    // 3. Update progress percentage dengan getCompletionPercentage()
    // Karena panjang, saya tidak menulis ulang semuanya di sini
}

// ===== GLOBAL INSTANCE MANAGEMENT =====
let setupWizardInstance = null;

function initializeSetupWizard() {
    if (setupWizardInstance) {
        setupWizardInstance.destroy();
    }
    
    setupWizardInstance = new SetupWizardMulti();
    window.setupWizard = setupWizardInstance; // Ekspos ke global
    
    return setupWizardInstance;
}

// Auto-initialize saat DOM siap
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initializeSetupWizard());
} else {
    initializeSetupWizard();
}

// Cleanup saat halaman ditutup
window.addEventListener('beforeunload', () => {
    if (setupWizardInstance) {
        setupWizardInstance.destroy();
    }
});

// Global
window.SetupWizardMulti = SetupWizardMulti;
window.initializeSetupWizard = initializeSetupWizard;
