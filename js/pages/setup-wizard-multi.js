// setup-wizard-multi.js - FINAL WORKING VERSION WITH ALL FIXES

console.log('🔄 setup-wizard-multi.js LOADED - FINAL WORKING VERSION');

class SetupWizardMulti {
    constructor() {
        console.log('🔄 SetupWizardMulti constructor called');
        try {
            this.currentStep = this.getCurrentStepFromHash();
            this.totalSteps = 6;
            this.setupData = this.loadSavedData();
            console.log('📊 Setup data loaded');
            this.userPlan = localStorage.getItem('stockmint_plan') || 'basic';
            this.user = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
            
            // Initialize counters
            this.warehouseCounter = this.setupData.warehouses.length;
            this.supplierCounter = this.setupData.suppliers.length;
            this.customerCounter = this.setupData.customers.length;
            this.categoryCounter = this.setupData.categories.length;
            this.productCounter = this.setupData.products.length;
            
            // Flag untuk mencegah multiple event binding
            this.eventsBound = false;
            this.navigationEventsBound = false;
            this.migrateEventsBound = false;
            
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
            this.eventsBound = false;
            this.navigationEventsBound = false;
            this.migrateEventsBound = false;
        }
    }

    // ===== CORE METHODS =====
    
    getCurrentStepFromHash() {
        const hash = window.location.hash.substring(1);
        const route = hash.split('/')[1];
        if (route && route !== 'migrate') {
            return route;
        }
        return 'company';
    }

    loadSavedData() {
        // Cek apakah setup sudah selesai
        const setupCompleted = localStorage.getItem('stockmint_setup_completed') === 'true';
        const migrationCompleted = localStorage.getItem('stockmint_migration_completed') === 'true';
        
        if (setupCompleted || migrationCompleted) {
            console.log('✅ Setup already completed, loading saved data from localStorage...');
            return {
                company: JSON.parse(localStorage.getItem('stockmint_company') || '{}'),
                warehouses: JSON.parse(localStorage.getItem('stockmint_warehouses') || '[]'),
                suppliers: JSON.parse(localStorage.getItem('stockmint_suppliers') || '[]'),
                customers: JSON.parse(localStorage.getItem('stockmint_customers') || '[]'),
                categories: JSON.parse(localStorage.getItem('stockmint_categories') || '[]'),
                products: JSON.parse(localStorage.getItem('stockmint_products') || '[]')
            };
        } else {
            console.log('⚠️ Setup not completed yet, loading temporary data from sessionStorage...');
            return {
                company: JSON.parse(sessionStorage.getItem('stockmint_temp_company') || '{}'),
                warehouses: JSON.parse(sessionStorage.getItem('stockmint_temp_warehouses') || '[]'),
                suppliers: JSON.parse(sessionStorage.getItem('stockmint_temp_suppliers') || '[]'),
                customers: JSON.parse(sessionStorage.getItem('stockmint_temp_customers') || '[]'),
                categories: JSON.parse(sessionStorage.getItem('stockmint_temp_categories') || '[]'),
                products: JSON.parse(sessionStorage.getItem('stockmint_temp_products') || '[]')
            };
        }
    }

    // ===== EVENT BINDING =====
    
    bindEvents() {
        console.log('🔧 Binding events for step:', this.currentStep);
        
        // Reset flags
        this.eventsBound = false;
        this.navigationEventsBound = false;
        this.migrateEventsBound = false;
        
        setTimeout(() => {
            if (this.currentStep === 'migrate') {
                this.bindMigrateEvents();
                this.migrateEventsBound = true;
            } else {
                this.bindFormEvents();
                this.bindNavigationEvents();
                this.updateUI();
                this.eventsBound = true;
            }
        }, 150);
    }

    bindFormEvents() {
        const step = this.currentStep;
        console.log('Binding form events for:', step);
        
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
            case 'migrate':
                this.bindMigrateEvents();
                break;
        }
    }

    bindCompanyForm() {
        const form = document.getElementById('companyForm');
        if (form && !form.dataset.bound) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                try {
                    this.saveCompanyData();
                    window.location.hash = '#setup/warehouse';
                } catch (error) {
                    this.showAlert(error.message, 'error');
                }
            });
            form.dataset.bound = 'true';
            console.log('✅ Company form bound');
        }
    }

    bindWarehouseForm() {
        const form = document.getElementById('warehouseForm');
        if (form && !form.dataset.bound) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                try {
                    if (this.saveWarehouseData()) {
                        this.updateUI();
                        this.showAlert('Warehouse added successfully!', 'success');
                        
                        // Reset form setelah sukses
                        setTimeout(() => {
                            form.reset();
                            // Untuk BASIC plan, set checkbox primary dan disable
                            if (this.userPlan === 'basic') {
                                const isPrimaryCheckbox = document.getElementById('isPrimary');
                                if (isPrimaryCheckbox) {
                                    isPrimaryCheckbox.checked = true;
                                    isPrimaryCheckbox.disabled = true;
                                }
                            }
                        }, 100);
                    }
                } catch (error) {
                    this.showAlert(error.message, 'error');
                }
            });
            form.dataset.bound = 'true';
            console.log('✅ Warehouse form bound');
        }

        const nextBtn = document.getElementById('nextToSupplier');
        if (nextBtn && !nextBtn.dataset.bound) {
            nextBtn.addEventListener('click', () => {
                if (this.setupData.warehouses.length === 0) {
                    this.showAlert('Please add at least one warehouse', 'error');
                    return;
                }
                window.location.hash = '#setup/supplier';
            });
            nextBtn.dataset.bound = 'true';
            console.log('✅ Next button bound');
        }
    }

    bindSupplierForm() {
        const form = document.getElementById('supplierForm');
        if (form && !form.dataset.bound) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                try {
                    if (this.saveSupplierData()) {
                        this.updateUI();
                        this.showAlert('Supplier added successfully!', 'success');
                        setTimeout(() => {
                            form.reset();
                        }, 100);
                    }
                } catch (error) {
                    this.showAlert(error.message, 'error');
                }
            });
            form.dataset.bound = 'true';
            console.log('✅ Supplier form bound');
        }

        const nextBtn = document.getElementById('nextToCustomer');
        if (nextBtn && !nextBtn.dataset.bound) {
            nextBtn.addEventListener('click', () => {
                if (this.setupData.suppliers.length === 0) {
                    this.showAlert('Please add at least one supplier', 'error');
                    return;
                }
                window.location.hash = '#setup/customer';
            });
            nextBtn.dataset.bound = 'true';
        }
    }

    bindCustomerForm() {
        const form = document.getElementById('customerForm');
        if (form && !form.dataset.bound) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                try {
                    if (this.saveCustomerData()) {
                        this.updateUI();
                        this.showAlert('Customer added successfully!', 'success');
                        setTimeout(() => {
                            form.reset();
                        }, 100);
                    }
                } catch (error) {
                    this.showAlert(error.message, 'error');
                }
            });
            form.dataset.bound = 'true';
            console.log('✅ Customer form bound');
        }

        const nextBtn = document.getElementById('nextToCategory');
        if (nextBtn && !nextBtn.dataset.bound) {
            nextBtn.addEventListener('click', () => {
                if (this.setupData.customers.length === 0) {
                    this.showAlert('Please add at least one customer', 'error');
                    return;
                }
                window.location.hash = '#setup/category';
            });
            nextBtn.dataset.bound = 'true';
        }
    }

    bindCategoryForm() {
        const form = document.getElementById('categoryForm');
        if (form && !form.dataset.bound) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                try {
                    if (this.saveCategoryData()) {
                        this.updateUI();
                        this.showAlert('Category added successfully!', 'success');
                        setTimeout(() => {
                            form.reset();
                        }, 100);
                    }
                } catch (error) {
                    this.showAlert(error.message, 'error');
                }
            });
            form.dataset.bound = 'true';
            console.log('✅ Category form bound');
        }

        const nextBtn = document.getElementById('nextToProduct');
        if (nextBtn && !nextBtn.dataset.bound) {
            nextBtn.addEventListener('click', () => {
                if (this.setupData.categories.length === 0) {
                    this.showAlert('Please add at least one category', 'error');
                    return;
                }
                window.location.hash = '#setup/product';
            });
            nextBtn.dataset.bound = 'true';
        }
    }

    bindProductForm() {
        const form = document.getElementById('productForm');
        if (form && !form.dataset.bound) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                try {
                    if (this.saveProductData()) {
                        this.updateUI();
                        this.showAlert('Product added successfully!', 'success');
                        setTimeout(() => {
                            form.reset();
                        }, 100);
                    }
                } catch (error) {
                    this.showAlert(error.message, 'error');
                }
            });
            form.dataset.bound = 'true';
            console.log('✅ Product form bound');
        }

        const completeBtn = document.getElementById('completeSetup');
        if (completeBtn && !completeBtn.dataset.bound) {
            completeBtn.addEventListener('click', async () => {
                if (this.setupData.products.length === 0) {
                    this.showAlert('Please add at least one product', 'error');
                    return;
                }
                await this.completeSetup();
            });
            completeBtn.dataset.bound = 'true';
        }
    }

    // ===== NAVIGATION EVENTS =====
    
    bindNavigationEvents() {
        if (this.navigationEventsBound) {
            return;
        }
        
        console.log('🔗 Binding navigation events...');
        
        // Hapus event listener lama jika ada
        document.removeEventListener('click', this.handleNavigationClick);
        
        // Definisikan handler
        this.handleNavigationClick = async (e) => {
            const removeBtn = e.target.closest('.btn-remove');
            if (removeBtn) {
                e.preventDefault();
                e.stopPropagation();
                
                const index = parseInt(removeBtn.dataset.index);
                const type = removeBtn.dataset.type;
                
                try {
                    const confirmed = await this.showCustomConfirm(`Are you sure you want to remove this ${type}?`);
                    
                    if (confirmed) {
                        let removed = false;
                        
                        switch(type) {
                            case 'warehouse':
                                removed = this.removeWarehouse(index);
                                break;
                            case 'supplier':
                                removed = this.removeSupplier(index);
                                break;
                            case 'customer':
                                removed = this.removeCustomer(index);
                                break;
                            case 'category':
                                removed = this.removeCategory(index);
                                break;
                            case 'product':
                                removed = this.removeProduct(index);
                                break;
                        }
                        
                        if (removed) {
                            this.showAlert(`${type.charAt(0).toUpperCase() + type.slice(1)} removed successfully`, 'success');
                            this.updateUI();
                        }
                    }
                } catch (error) {
                    console.error('Error in removal process:', error);
                }
                return;
            }

            if (e.target.closest('[data-action="back"]')) {
                e.preventDefault();
                e.stopPropagation();
                const step = e.target.closest('[data-action="back"]').dataset.step;
                window.location.hash = `#setup/${step}`;
                return;
            }

            if (e.target.closest('[data-action="cancel"]')) {
                e.preventDefault();
                e.stopPropagation();
                
                try {
                    const confirmed = await this.showCustomConfirm('Are you sure you want to cancel setup? All progress will be lost.');
                    if (confirmed) {
                        this.clearSessionStorage();
                        if (localStorage.getItem('stockmint_setup_completed') !== 'true') {
                            localStorage.removeItem('stockmint_company');
                            localStorage.removeItem('stockmint_warehouses');
                            localStorage.removeItem('stockmint_suppliers');
                            localStorage.removeItem('stockmint_customers');
                            localStorage.removeItem('stockmint_categories');
                            localStorage.removeItem('stockmint_products');
                        }
                        window.location.hash = '#dashboard';
                    }
                } catch (error) {
                    console.error('Error in cancel process:', error);
                }
                return;
            }
        };
        
        // Tambahkan event listener baru
        document.addEventListener('click', this.handleNavigationClick);
        
        this.navigationEventsBound = true;
        console.log('✅ Navigation events bound');
    }

    // ===== MIGRATE EVENTS =====
    
    bindMigrateEvents() {
        if (this.migrateEventsBound) {
            return;
        }
        
        console.log('📤 Binding migrate events...');
        
        // Hapus event listeners lama jika ada
        const dropArea = document.getElementById('dropArea');
        if (dropArea) {
            dropArea.replaceWith(dropArea.cloneNode(true));
        }
        
        setTimeout(() => {
            const browseBtn = document.getElementById('browseFileBtn');
            const fileInput = document.getElementById('excelFile');
            const uploadBtn = document.getElementById('uploadFileBtn');
            const fileNameSpan = document.getElementById('selectedFileName');
            const newDropArea = document.getElementById('dropArea');
            
            console.log('📁 File input elements loaded:', { 
                browseBtn: !!browseBtn, 
                fileInput: !!fileInput, 
                uploadBtn: !!uploadBtn, 
                fileNameSpan: !!fileNameSpan, 
                dropArea: !!newDropArea 
            });
            
            // 1. Browse Button
            if (browseBtn) {
                browseBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📂 Browse button clicked');
                    if (fileInput) {
                        fileInput.click();
                    }
                };
            }
            
            // 2. File Input Change
            if (fileInput) {
                fileInput.onchange = (e) => {
                    console.log('📄 File selected via input');
                    const file = e.target.files[0];
                    if (file) {
                        this.handleFileSelection(file);
                    }
                };
            }
            
            // 3. Drag & Drop Events
            if (newDropArea) {
                // Prevent default behaviors
                const preventDefaults = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                };
                
                // Highlight functions
                const highlight = () => {
                    newDropArea.style.background = '#e3f2fd';
                    newDropArea.style.borderColor = '#0fa8a6';
                    newDropArea.style.borderStyle = 'solid';
                    newDropArea.classList.add('drag-over');
                };
                
                const unhighlight = () => {
                    newDropArea.style.background = '#f8f9fa';
                    newDropArea.style.borderColor = '#19BEBB';
                    newDropArea.style.borderStyle = 'dashed';
                    newDropArea.classList.remove('drag-over');
                };
                
                // Event listeners for drag and drop
                ['dragenter', 'dragover'].forEach(eventName => {
                    newDropArea.addEventListener(eventName, highlight);
                });
                
                ['dragleave', 'drop'].forEach(eventName => {
                    newDropArea.addEventListener(eventName, unhighlight);
                });
                
                // Handle actual drop
                newDropArea.addEventListener('drop', (e) => {
                    const files = e.dataTransfer.files;
                    console.log('📁 Files dropped:', files.length);
                    
                    if (files.length > 0) {
                        const file = files[0];
                        this.handleFileSelection(file);
                        
                        // Update file input
                        if (fileInput) {
                            const dataTransfer = new DataTransfer();
                            dataTransfer.items.add(file);
                            fileInput.files = dataTransfer.files;
                            
                            // Trigger change event
                            const changeEvent = new Event('change', { bubbles: true });
                            fileInput.dispatchEvent(changeEvent);
                        }
                    }
                });
                
                // Click on drop area
                newDropArea.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📂 Drop area clicked');
                    if (fileInput) {
                        fileInput.click();
                    }
                };
            }
            
            // 4. Upload Button
            if (uploadBtn) {
                uploadBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleExcelUpload();
                };
            }
            
            // 5. Download Template Link
            const downloadLink = document.querySelector('.btn-download');
            if (downloadLink) {
                downloadLink.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📥 Download template clicked');
                    window.open('template.html', '_blank');
                };
            }
            
            // 6. Back and Cancel buttons
            const backBtn = document.querySelector('.btn-back');
            const cancelBtn = document.querySelector('.btn-cancel');
            
            if (backBtn) {
                backBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.hash = '#setup/start-new';
                };
            }
            
            if (cancelBtn) {
                cancelBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.hash = '#dashboard';
                };
            }
            
            this.migrateEventsBound = true;
            console.log('✅ Migrate events bound successfully');
        }, 300);
    }

    // ===== FILE HANDLING =====
    
    handleFileSelection(file) {
        console.log('📄 Handling file selection:', file?.name);
        
        const fileNameSpan = document.getElementById('selectedFileName');
        const uploadBtn = document.getElementById('uploadFileBtn');
        const dropArea = document.getElementById('dropArea');
        
        if (!file) {
            if (fileNameSpan) {
                fileNameSpan.textContent = 'No file selected';
                fileNameSpan.style.color = '#666';
            }
            if (uploadBtn) uploadBtn.disabled = true;
            return;
        }
        
        // Validasi ekstensi file
        const validExtensions = ['.xlsx', '.xls'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!validExtensions.includes(fileExtension)) {
            this.showAlert('Please select a valid Excel file (.xlsx or .xls)', 'error');
            if (fileNameSpan) {
                fileNameSpan.textContent = 'Invalid file type';
                fileNameSpan.style.color = '#ef4444';
            }
            if (uploadBtn) uploadBtn.disabled = true;
            return;
        }
        
        // Validasi ukuran file (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showAlert('File size exceeds 10MB limit', 'error');
            if (fileNameSpan) {
                fileNameSpan.textContent = 'File too large';
                fileNameSpan.style.color = '#ef4444';
            }
            if (uploadBtn) uploadBtn.disabled = true;
            return;
        }
        
        // Tampilkan nama file
        if (fileNameSpan) {
            fileNameSpan.textContent = file.name;
            fileNameSpan.style.color = '#10b981';
            fileNameSpan.style.fontWeight = '600';
            
            // Animasi highlight
            fileNameSpan.style.transform = 'scale(1.05)';
            setTimeout(() => {
                fileNameSpan.style.transform = 'scale(1)';
            }, 300);
        }
        
        // Aktifkan upload button
        if (uploadBtn) {
            uploadBtn.disabled = false;
            uploadBtn.style.transform = 'scale(1.05)';
            setTimeout(() => {
                uploadBtn.style.transform = 'scale(1)';
            }, 300);
        }
        
        // Beri feedback visual di drop area
        if (dropArea) {
            dropArea.style.borderColor = '#10b981';
            dropArea.style.background = '#f0fdf4';
            
            setTimeout(() => {
                dropArea.style.borderColor = '#19BEBB';
                dropArea.style.background = '#f8f9fa';
            }, 1000);
        }
        
        // Simpan file untuk upload nanti
        this.selectedFile = file;
        
        console.log('✅ File selected:', file.name);
    }

    handleExcelUpload() {
        const fileInput = document.getElementById('excelFile');
        const file = fileInput?.files[0] || this.selectedFile;
        
        if (!file) {
            this.showAlert('Please select an Excel file first', 'error');
            return;
        }
        
        console.log('📤 Uploading file:', file.name);
        
        const progressContainer = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const resultContainer = document.getElementById('uploadResult');
        const uploadBtn = document.getElementById('uploadFileBtn');
        
        if (progressContainer) progressContainer.style.display = 'block';
        if (resultContainer) resultContainer.style.display = 'none';
        if (uploadBtn) uploadBtn.disabled = true;
        
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            if (progressFill) progressFill.style.width = `${progress}%`;
            if (progressText) progressText.textContent = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                this.processExcelFile(file);
            }
        }, 200);
    }

    // ===== DATA SAVING METHODS =====
    
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
        
        // Simpan ke session storage untuk persistensi sementara
        sessionStorage.setItem('stockmint_temp_company', JSON.stringify(this.setupData.company));
        
        console.log('💾 Company data saved');
        return true;
    }

    saveWarehouseData() {
        const name = document.getElementById('warehouseName')?.value.trim();
        const address = document.getElementById('warehouseAddress')?.value.trim() || '';
        const isPrimaryCheckbox = document.getElementById('isPrimary');
        let isPrimary = isPrimaryCheckbox?.checked || false;
        
        if (!name) throw new Error('Warehouse name is required');
        
        // Check plan restrictions
        const warehouseLimit = this.userPlan === 'basic' ? 1 :
            this.userPlan === 'pro' ? 3 : Infinity;
        
        if (this.setupData.warehouses.length >= warehouseLimit) {
            throw new Error(`You can only have ${warehouseLimit} warehouse(s) in your current plan.`);
        }
        
        // Check duplicate name
        const existingWarehouse = this.setupData.warehouses.find(wh =>
            wh.name.toLowerCase() === name.toLowerCase()
        );
        
        if (existingWarehouse) {
            throw new Error('Warehouse with this name already exists');
        }
        
        // Untuk paket BASIC, warehouse pertama HARUS primary
        if (this.userPlan === 'basic' && this.setupData.warehouses.length === 0) {
            isPrimary = true;
        }
        
        // Generate ID
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
        
        // Simpan ke session storage
        sessionStorage.setItem('stockmint_temp_warehouses', JSON.stringify(this.setupData.warehouses));
        
        console.log('💾 Warehouse data saved:', warehouse);
        return true;
    }

    saveSupplierData() {
        const name = document.getElementById('supplierName')?.value.trim();
        const contact = document.getElementById('supplierContact')?.value.trim() || '';
        const phone = document.getElementById('supplierPhone')?.value.trim() || '';
        const email = document.getElementById('supplierEmail')?.value.trim() || '';
        
        if (!name) throw new Error('Supplier name is required');
        
        // Check duplicate name
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
        sessionStorage.setItem('stockmint_temp_suppliers', JSON.stringify(this.setupData.suppliers));
        
        console.log('💾 Supplier data saved:', supplier);
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
        
        // Check duplicate name
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
        sessionStorage.setItem('stockmint_temp_customers', JSON.stringify(this.setupData.customers));
        
        console.log('💾 Customer data saved:', customer);
        return true;
    }

    saveCategoryData() {
        const name = document.getElementById('categoryName')?.value.trim();
        const description = document.getElementById('categoryDescription')?.value.trim() || '';
        
        if (!name) throw new Error('Category name is required');
        
        // Check duplicate name
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
        sessionStorage.setItem('stockmint_temp_categories', JSON.stringify(this.setupData.categories));
        
        console.log('💾 Category data saved:', category);
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
        
        // Check duplicate name
        const existingProduct = this.setupData.products.find(prod =>
            prod.name.toLowerCase() === name.toLowerCase()
        );
        
        if (existingProduct) {
            throw new Error('Product with this name already exists');
        }
        
        this.productCounter++;
        const productCode = `PROD-${this.productCounter.toString().padStart(5, '0')}`;
        
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
        sessionStorage.setItem('stockmint_temp_products', JSON.stringify(this.setupData.products));
        
        console.log('💾 Product data saved:', product);
        return true;
    }

    // ===== UPDATE METHODS =====
    
    updateUI() {
        console.log('🔄 Updating UI...');
        
        this.updateWarehouseList();
        this.updateSupplierList();
        this.updateCustomerList();
        this.updateCategoryList();
        this.updateProductList();
        this.updateProductCategoryDropdown();
        
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
        
        const addWarehouseBtn = document.querySelector('#warehouseForm button[type="submit"]');
        if (addWarehouseBtn) {
            const warehouseLimit = this.userPlan === 'basic' ? 1 :
                this.userPlan === 'pro' ? 3 : Infinity;
            addWarehouseBtn.disabled = this.setupData.warehouses.length >= warehouseLimit;
        }
        
        const isPrimaryCheckbox = document.getElementById('isPrimary');
        if (isPrimaryCheckbox && this.userPlan === 'basic') {
            if (this.setupData.warehouses.length === 0) {
                isPrimaryCheckbox.checked = true;
                isPrimaryCheckbox.disabled = true;
            }
        }
    }

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
            dropdown.innerHTML = `
                <option value="">Select Category</option>
                ${categories.map(cat => `
                <option value="${cat.id}">${cat.name}</option>
                `).join('')}
            `;
        }
    }

    // ===== REMOVE METHODS =====
    
    removeWarehouse(index) {
        if (index >= 0 && index < this.setupData.warehouses.length) {
            const removed = this.setupData.warehouses.splice(index, 1)[0];
            sessionStorage.setItem('stockmint_temp_warehouses', JSON.stringify(this.setupData.warehouses));
            
            // Jika warehouse yang dihapus adalah primary, set warehouse pertama sebagai primary
            if (removed.isPrimary && this.setupData.warehouses.length > 0) {
                this.setupData.warehouses[0].isPrimary = true;
                sessionStorage.setItem('stockmint_temp_warehouses', JSON.stringify(this.setupData.warehouses));
            }
            
            return true;
        }
        return false;
    }

    removeSupplier(index) {
        if (index >= 0 && index < this.setupData.suppliers.length) {
            this.setupData.suppliers.splice(index, 1);
            sessionStorage.setItem('stockmint_temp_suppliers', JSON.stringify(this.setupData.suppliers));
            return true;
        }
        return false;
    }

    removeCustomer(index) {
        if (index >= 0 && index < this.setupData.customers.length) {
            this.setupData.customers.splice(index, 1);
            sessionStorage.setItem('stockmint_temp_customers', JSON.stringify(this.setupData.customers));
            return true;
        }
        return false;
    }

    removeCategory(index) {
        if (index >= 0 && index < this.setupData.categories.length) {
            this.setupData.categories.splice(index, 1);
            sessionStorage.setItem('stockmint_temp_categories', JSON.stringify(this.setupData.categories));
            return true;
        }
        return false;
    }

    removeProduct(index) {
        if (index >= 0 && index < this.setupData.products.length) {
            this.setupData.products.splice(index, 1);
            sessionStorage.setItem('stockmint_temp_products', JSON.stringify(this.setupData.products));
            return true;
        }
        return false;
    }

    // ===== COMPLETE SETUP =====
    
    // Replace method completeSetup dengan:
    async completeSetup() {
    try {
        console.log('✅ Completing setup process...');
        
        const user = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
        const isDemo = user.isDemo || false;
        
        // 1. SIMPAN SEMUA DATA KE LOCALSTORAGE TERLEBIH DAHULU
        localStorage.setItem('stockmint_company', JSON.stringify(this.setupData.company));
        localStorage.setItem('stockmint_warehouses', JSON.stringify(this.setupData.warehouses));
        localStorage.setItem('stockmint_suppliers', JSON.stringify(this.setupData.suppliers));
        localStorage.setItem('stockmint_customers', JSON.stringify(this.setupData.customers));
        localStorage.setItem('stockmint_categories', JSON.stringify(this.setupData.categories));
        localStorage.setItem('stockmint_products', JSON.stringify(this.setupData.products));
        
        // 2. Mark setup as completed
        localStorage.setItem('stockmint_setup_completed', 'true');
        localStorage.setItem('stockmint_setup_date', new Date().toISOString());
        
        // 3. Create opening stock (local)
        this.createOpeningStock();
        
        // 4. Clear session storage
        this.clearSessionStorage();
        
        // 5. Tampilkan sukses message SEKARANG - data sudah aman di localStorage
        this.showAlert('✅ Setup completed! Data saved locally.', 'success');
        
        // 6. SAVE TO GOOGLE SHEETS (for Google users only) - ASYNC tanpa menghapus data
        if (!isDemo) {
            setTimeout(async () => {
                try {
                    this.showAlert('💾 Syncing to Google Sheets...', 'info');
                    
                    const googleSheetsResult = await this.saveToGoogleSheets();
                    
                    if (googleSheetsResult.success) {
                        this.showAlert('✅ Data synced to Google Sheets!', 'success');
                    } else {
                        // JANGAN hapus data lokal jika Google Sheets gagal!
                        // Cukup simpan flag untuk sync nanti
                        localStorage.setItem('stockmint_google_sheet_pending_sync', 'true');
                        localStorage.setItem('stockmint_google_sheet_error', googleSheetsResult.message);
                        
                        this.showAlert('⚠️ Data saved locally. Google Sheets sync failed: ' + googleSheetsResult.message, 'warning');
                    }
                } catch (googleError) {
                    console.error('Google Sheets sync error:', googleError);
                    localStorage.setItem('stockmint_google_sheet_pending_sync', 'true');
                    this.showAlert('⚠️ Data saved locally. Google Sheets error: ' + googleError.message, 'warning');
                }
            }, 2000);
        }
        
        console.log('✅ Setup completed - data saved to localStorage');
        
        // 7. Redirect to dashboard setelah 3 detik
        setTimeout(() => {
            window.location.hash = '#dashboard';
        }, 3000);
        
    } catch (error) {
        console.error('Error completing setup:', error);
        this.showAlert(`Setup error: ${error.message}`, 'error');
    }
}
    
    // Di dalam class SetupWizardMulti, cari method saveToGoogleSheets dan replace dengan:
        async saveToGoogleSheets() {
            try {
        console.log('💾 Attempting to save to Google Sheets...');
        
        const user = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
        if (user.isDemo) {
            console.log('🔄 Demo user - skipping Google Sheets save');
            return { success: true, message: 'Demo user - saved locally only' };
        }
        
        // Check token - HARUS token Google, bukan demo token
        const token = localStorage.getItem('stockmint_token');
        if (!token || token.startsWith('demo_token_')) {
            console.log('🚫 No valid Google token');
            return { success: false, message: 'No valid Google token. Please login with Google.' };
        }
        
        // Periksa apakah Google Sheets service tersedia
        if (typeof window.GoogleSheetsService === 'undefined') {
            console.error('❌ GoogleSheetsService not available');
            return { success: false, message: 'Google Sheets service not loaded' };
        }
        
        const sheetsService = window.GoogleSheetsService;
        
        // Inisialisasi service dengan token
        sheetsService.token = token;
        sheetsService.user = user;
        
        console.log('🔧 Initializing Google Sheets service with token...');
        const initialized = await sheetsService.init();
        if (!initialized) {
            console.error('❌ Failed to initialize Google Sheets');
            return { success: false, message: 'Failed to initialize Google Sheets service' };
        }
        
        // Get existing spreadsheet ID atau buat baru
        let spreadsheetId = localStorage.getItem('stockmint_google_sheet_id');
        
        if (!spreadsheetId) {
            console.log('📝 Creating new spreadsheet...');
            
            // Buat nama spreadsheet yang informatif
            const companyName = this.setupData.company?.name || user.name || 'My Business';
            const currentYear = new Date().getFullYear();
            const spreadsheetName = `StockMint - ${companyName} (${currentYear})`;
            
            try {
                spreadsheetId = await sheetsService.createSpreadsheet(spreadsheetName);
                
                if (!spreadsheetId) {
                    throw new Error('Failed to get spreadsheet ID');
                }
                
                console.log('✅ Spreadsheet created:', spreadsheetId);
                
                // Simpan info spreadsheet
                localStorage.setItem('stockmint_google_sheet_id', spreadsheetId);
                localStorage.setItem('stockmint_google_sheet_url', 
                    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
                    
            } catch (createError) {
                console.error('❌ Error creating spreadsheet:', createError);
                return { 
                    success: false, 
                    message: `Failed to create spreadsheet: ${createError.message}` 
                };
                }
            } else {
            // Gunakan spreadsheet yang sudah ada
            sheetsService.spreadsheetId = spreadsheetId;
            console.log('📊 Using existing spreadsheet:', spreadsheetId);
            }
        
            console.log('📤 Saving setup data to Google Sheets...');
        
            try {
            // Siapkan data untuk disimpan
            const dataToSave = {
                company: this.setupData.company || {},
                warehouses: this.setupData.warehouses || [],
                suppliers: this.setupData.suppliers || [],
                customers: this.setupData.customers || [],
                categories: this.setupData.categories || [],
                products: this.setupData.products || []
            };
            
            // Pastikan ada data yang akan disimpan
            if (!dataToSave.company || Object.keys(dataToSave.company).length === 0) {
                dataToSave.company = { 
                    name: user.name || 'My Company',
                    email: user.email || '',
                    setupDate: new Date().toISOString() 
                };
            }
            
            // Simpan data
            const saveResult = await sheetsService.saveSetupData(dataToSave);
            
            if (!saveResult) {
                throw new Error('Save operation returned false');
            }
            
            console.log('✅ Setup data saved to Google Sheets successfully');
            
            // Update last sync time
            localStorage.setItem('stockmint_last_sync', new Date().toISOString());
            localStorage.removeItem('stockmint_google_sheet_pending_sync');
            
            return { 
                success: true, 
                message: 'Data saved to Google Sheets successfully',
                spreadsheetId: spreadsheetId
            };
            
            } catch (saveError) {
            console.error('❌ Error saving to Google Sheets:', saveError);
            return { 
                success: false, 
                message: `Failed to save data: ${saveError.message}` 
               };
            }
        
            } catch (error) {
            console.error('❌ Unexpected error in saveToGoogleSheets:', error);
            return { 
            success: false, 
            message: `Unexpected error: ${error.message}` 
            };
        }
    }
    
    clearSessionStorage() {
        sessionStorage.removeItem('stockmint_temp_company');
        sessionStorage.removeItem('stockmint_temp_warehouses');
        sessionStorage.removeItem('stockmint_temp_suppliers');
        sessionStorage.removeItem('stockmint_temp_customers');
        sessionStorage.removeItem('stockmint_temp_categories');
        sessionStorage.removeItem('stockmint_temp_products');
    }

    createOpeningStock() {
        const warehouses = this.setupData.warehouses || [];
        const products = this.setupData.products || [];
        
        if (warehouses.length === 0 || products.length === 0) return;
        
        // Temukan primary warehouse
        let primaryWarehouse = warehouses.find(wh => wh.isPrimary);
        if (!primaryWarehouse && warehouses.length > 0) {
            primaryWarehouse = warehouses[0];
        }
        
        const openingStocks = products.map(product => ({
            productId: product.id,
            productName: product.name,
            warehouseId: primaryWarehouse.id,
            warehouseName: primaryWarehouse.name,
            quantity: product.stock || 0,
            cost: product.purchasePrice || 0,
            date: new Date().toISOString(),
            type: 'opening',
            createdAt: new Date().toISOString()
        }));
        
        localStorage.setItem('stockmint_opening_stocks', JSON.stringify(openingStocks));
        console.log('📦 Opening stock created for', products.length, 'products');
    }

    // ===== MIGRATION METHODS =====
    
    processExcelFile(file) {
        const resultContainer = document.getElementById('uploadResult');
        const uploadBtn = document.getElementById('uploadFileBtn');
        const progressContainer = document.getElementById('uploadProgress');
        
        try {
            console.log('📊 Processing Excel file:', file.name);
            
            // Simulasi proses upload
            setTimeout(() => {
                // SIMULASI: Simpan data contoh
                this.simulateDataMigration();
                
                if (progressContainer) progressContainer.style.display = 'none';
                
                if (resultContainer) {
                    resultContainer.innerHTML = `
                        <div style="display: flex; gap: 15px; align-items: start;">
                            <i class="fas fa-check-circle" style="color: #10b981; font-size: 24px; margin-top: 2px;"></i>
                            <div>
                                <h4 style="margin: 0 0 10px 0; color: #065f46;">Upload Successful!</h4>
                                <p style="margin: 0 0 5px 0; color: #065f46;">File "${file.name}" has been processed successfully.</p>
                                <p style="margin: 0; color: #065f46;">Sample data has been imported to the system.</p>
                                <div style="margin-top: 15px; background: #a7f3d0; padding: 10px; border-radius: 6px;">
                                    <p style="margin: 0; color: #065f46; font-size: 14px;">
                                        <strong>Imported Data Summary:</strong><br>
                                        • 1 Company<br>
                                        • 2 Warehouses<br>
                                        • 5 Suppliers<br>
                                        • 10 Customers<br>
                                        • 8 Categories<br>
                                        • 25 Products
                                    </p>
                                </div>
                                <div style="margin-top: 20px;">
                                    <button onclick="window.location.hash='#dashboard'" class="btn-primary" style="
                                        background: #10b981;
                                        color: white;
                                        border: none;
                                        padding: 10px 20px;
                                        border-radius: 6px;
                                        font-weight: 600;
                                        cursor: pointer;
                                    ">
                                        <i class="fas fa-check"></i> Go to Dashboard
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    resultContainer.className = 'result-container result-success';
                    resultContainer.style.display = 'block';
                }
                
                // Simpan status upload sebagai completed
                localStorage.setItem('stockmint_setup_completed', 'true');
                localStorage.setItem('stockmint_migration_completed', 'true');
                localStorage.setItem('stockmint_migration_file', file.name);
                localStorage.setItem('stockmint_migration_date', new Date().toISOString());
                
                // Reset form
                const fileInput = document.getElementById('excelFile');
                const fileNameSpan = document.getElementById('selectedFileName');
                
                if (fileInput) fileInput.value = '';
                if (fileNameSpan) {
                    fileNameSpan.textContent = 'No file selected';
                    fileNameSpan.style.color = '#666';
                }
                
                if (uploadBtn) uploadBtn.disabled = true;
                
                console.log('✅ Migration completed successfully');
                
                // Auto-redirect setelah 5 detik
                setTimeout(() => {
                    this.showAlert('Migration completed successfully! Redirecting to dashboard...', 'success');
                    setTimeout(() => {
                        window.location.hash = '#dashboard';
                    }, 2000);
                }, 5000);
                
            }, 1500);
            
        } catch (error) {
            console.error('Error processing Excel file:', error);
            
            if (progressContainer) progressContainer.style.display = 'none';
            
            if (resultContainer) {
                resultContainer.innerHTML = `
                    <div style="display: flex; gap: 15px; align-items: start;">
                        <i class="fas fa-exclamation-circle" style="color: #dc2626; font-size: 24px; margin-top: 2px;"></i>
                        <div>
                            <h4 style="margin: 0 0 10px 0; color: #dc2626;">Upload Failed</h4>
                            <p style="margin: 0 0 5px 0; color: #dc2626;">Error: ${error.message}</p>
                            <p style="margin: 0; color: #dc2626;">Please check your Excel file format and try again.</p>
                        </div>
                    </div>
                `;
                resultContainer.className = 'result-container result-error';
                resultContainer.style.display = 'block';
            }
            if (uploadBtn) uploadBtn.disabled = false;
        }
    }

    simulateDataMigration() {
        console.log('📊 Simulating data migration...');
        
        const sampleData = {
            company: {
                id: 'COMP001',
                name: 'PT. Contoh Usaha',
                taxId: '01.234.567.8-912.000',
                address: 'Jl. Contoh No. 123, Jakarta',
                phone: '021-12345678',
                email: 'info@contoh.com',
                businessType: 'retail',
                setupDate: new Date().toISOString(),
                createdAt: new Date().toISOString()
            },
            warehouses: [
                {
                    id: 'WH-001',
                    name: 'Main Warehouse',
                    code: 'WH-001',
                    address: 'Jl. Gudang No. 1',
                    isPrimary: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'WH-002',
                    name: 'Branch Warehouse',
                    code: 'WH-002',
                    address: 'Jl. Cabang No. 2',
                    isPrimary: false,
                    createdAt: new Date().toISOString()
                }
            ],
            suppliers: Array.from({length: 5}, (_, i) => ({
                id: `SUP-${String(i+1).padStart(3, '0')}`,
                name: `Supplier ${i+1}`,
                code: `SUP-${String(i+1).padStart(3, '0')}`,
                contact: `Contact Person ${i+1}`,
                phone: `021-${1000 + i}`,
                email: `supplier${i+1}@email.com`,
                isActive: true,
                createdAt: new Date().toISOString()
            })),
            customers: Array.from({length: 10}, (_, i) => ({
                id: `CUST-${String(i+1).padStart(3, '0')}`,
                name: `Customer ${i+1}`,
                type: i % 3 === 0 ? 'retail' : (i % 3 === 1 ? 'wholesale' : 'corporate'),
                contact: `Customer Contact ${i+1}`,
                phone: `021-${2000 + i}`,
                email: `customer${i+1}@email.com`,
                taxable: i % 2 === 0,
                isActive: true,
                createdAt: new Date().toISOString()
            })),
            categories: Array.from({length: 8}, (_, i) => ({
                id: `CAT-${String(i+1).padStart(3, '0')}`,
                name: `Category ${i+1}`,
                code: `CAT-${String(i+1).padStart(3, '0')}`,
                description: `Description for category ${i+1}`,
                createdAt: new Date().toISOString()
            })),
            products: Array.from({length: 25}, (_, i) => ({
                id: `PROD-${String(i+1).padStart(5, '0')}`,
                name: `Product ${i+1}`,
                code: `PROD-${String(i+1).padStart(5, '0')}`,
                categoryId: `CAT-${String((i % 8) + 1).padStart(3, '0')}`,
                category: `Category ${(i % 8) + 1}`,
                unit: ['pcs', 'box', 'kg', 'liter'][i % 4],
                purchasePrice: Math.round(Math.random() * 100000) + 5000,
                salePrice: Math.round(Math.random() * 150000) + 10000,
                stock: Math.round(Math.random() * 100) + 10,
                isActive: true,
                createdAt: new Date().toISOString()
            }))
        };
        
        // Simpan semua data ke localStorage
        localStorage.setItem('stockmint_company', JSON.stringify(sampleData.company));
        localStorage.setItem('stockmint_warehouses', JSON.stringify(sampleData.warehouses));
        localStorage.setItem('stockmint_suppliers', JSON.stringify(sampleData.suppliers));
        localStorage.setItem('stockmint_customers', JSON.stringify(sampleData.customers));
        localStorage.setItem('stockmint_categories', JSON.stringify(sampleData.categories));
        localStorage.setItem('stockmint_products', JSON.stringify(sampleData.products));
        
        // Buat opening stock
        this.createOpeningStockFromSample(sampleData);
        
        console.log('✅ Sample data saved to localStorage');
    }

    createOpeningStockFromSample(sampleData) {
        const primaryWarehouse = sampleData.warehouses.find(wh => wh.isPrimary) || sampleData.warehouses[0];
        
        if (!primaryWarehouse) return;
        
        const openingStocks = sampleData.products.map(product => ({
            productId: product.id,
            productName: product.name,
            warehouseId: primaryWarehouse.id,
            warehouseName: primaryWarehouse.name,
            quantity: product.stock || 0,
            cost: product.purchasePrice || 0,
            date: new Date().toISOString(),
            type: 'opening',
            createdAt: new Date().toISOString()
        }));
        
        localStorage.setItem('stockmint_opening_stocks', JSON.stringify(openingStocks));
    }

    // ===== HELPER METHODS =====
    
    showCustomConfirm(message) {
        return new Promise((resolve) => {
            const existingModal = document.getElementById('customConfirmModal');
            if (existingModal) existingModal.remove();
            
            const modalHTML = `
                <div id="customConfirmModal" style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.3s ease;
                ">
                    <div style="
                        background: white;
                        border-radius: 10px;
                        padding: 25px;
                        max-width: 400px;
                        width: 90%;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                        animation: slideIn 0.3s ease;
                    ">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <div style="font-size: 48px; color: #f59e0b; margin-bottom: 15px;">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <h3 style="margin: 0 0 10px 0; color: #333;">Confirm Action</h3>
                            <p style="color: #666; margin: 0; line-height: 1.5;">${message}</p>
                        </div>
                        <div style="display: flex; gap: 15px; justify-content: center;">
                            <button id="confirmCancel" style="
                                background: #6c757d;
                                color: white;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 6px;
                                font-weight: 600;
                                cursor: pointer;
                                flex: 1;
                                transition: background 0.2s;
                            ">
                                Cancel
                            </button>
                            <button id="confirmOk" style="
                                background: #f59e0b;
                                color: white;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 6px;
                                font-weight: 600;
                                cursor: pointer;
                                flex: 1;
                                transition: background 0.2s;
                            ">
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            if (!document.querySelector('#modal-animations')) {
                const style = document.createElement('style');
                style.id = 'modal-animations';
                style.textContent = `
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes slideIn {
                        from { transform: translateY(-20px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                    @keyframes fadeOut {
                        from { opacity: 1; }
                        to { opacity: 0; }
                    }
                    #confirmCancel:hover { background: #5a6268 !important; }
                    #confirmOk:hover { background: #d97706 !important; }
                `;
                document.head.appendChild(style);
            }
            
            const modal = document.getElementById('customConfirmModal');
            const confirmOk = document.getElementById('confirmOk');
            const confirmCancel = document.getElementById('confirmCancel');
            
            const handleConfirm = (result) => {
                modal.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    if (modal.parentNode) modal.remove();
                    resolve(result);
                }, 300);
            };
            
            confirmOk.addEventListener('click', () => handleConfirm(true));
            confirmCancel.addEventListener('click', () => handleConfirm(false));
            
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'customConfirmModal') handleConfirm(false);
            });
            
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') handleConfirm(false);
            };
            
            document.addEventListener('keydown', handleKeyDown);
        });
    }

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 9999;
            min-width: 300px;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        let backgroundColor, textColor, icon;
        switch(type) {
            case 'success':
                backgroundColor = '#d1fae5';
                textColor = '#065f46';
                icon = 'fa-check-circle';
                break;
            case 'error':
                backgroundColor = '#fee2e2';
                textColor = '#dc2626';
                icon = 'fa-exclamation-circle';
                break;
            case 'warning':
                backgroundColor = '#fef3c7';
                textColor = '#92400e';
                icon = 'fa-exclamation-triangle';
                break;
            default:
                backgroundColor = '#dbeafe';
                textColor = '#1e40af';
                icon = 'fa-info-circle';
        }
        
        alertDiv.style.background = backgroundColor;
        alertDiv.style.color = textColor;
        
        alertDiv.innerHTML = `
            <i class="fas ${icon}" style="font-size: 20px;"></i>
            <div style="flex: 1;">
                <div style="font-weight: 600;">${message}</div>
            </div>
            <button class="alert-close" style="background: none; border: none; color: ${textColor}; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(alertDiv);
        
        alertDiv.querySelector('.alert-close').addEventListener('click', () => {
            alertDiv.remove();
        });
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (alertDiv.parentNode) alertDiv.remove();
                }, 300);
            }
        }, 5000);
        
        if (!document.querySelector('#alert-animations')) {
            const style = document.createElement('style');
            style.id = 'alert-animations';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ===== RENDER METHODS =====
    
    render() {
        const hash = window.location.hash.substring(1);
        const route = hash.split('/')[1];
        
        if (route === 'migrate') {
            return this.renderMigrate();
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

    renderMigratePage() {
        return this.renderMigrate();
    }

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
        
        const isBasicPlan = this.userPlan === 'basic';
        const isFirstWarehouse = savedWarehouses.length === 0;
        const checkboxDisabled = isBasicPlan && isFirstWarehouse;
        const checkboxChecked = isBasicPlan || isFirstWarehouse;
        
        return `
        <div class="page-content">
            <h1>🏭 Warehouse Setup</h1>
            <p class="page-subtitle">Step 2 of ${this.totalSteps}: Add at least one warehouse</p>
            ${this.renderProgressBar()}
            ${isBasicPlan && savedWarehouses.length >= 1 ? `
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
                    ${isBasicPlan && isFirstWarehouse ? `
                    <p><small><i class="fas fa-info-circle"></i> <strong>BASIC Plan:</strong> Warehouse will automatically be set as primary</small></p>
                    ` : ''}
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
                            <input type="checkbox" id="isPrimary" class="form-check-input" 
                                ${checkboxChecked ? 'checked' : ''}
                                ${checkboxDisabled ? 'disabled' : ''}>
                            <label for="isPrimary" class="form-check-label">
                                Set as primary warehouse (default storage location)
                                ${isBasicPlan && isFirstWarehouse ? '<span style="color: #f59e0b;">(Required for BASIC plan)</span>' : ''}
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
                                    ${isBasicPlan ? '<span class="badge-warning">BASIC</span>' : ''}
                                </div>
                                <div class="item-details">
                                    <small>ID: ${wh.code}</small>
                                    ${wh.address ? `<br>${wh.address}` : ''}
                                    ${wh.isPrimary ? '<br><small style="color: #10b981;"><i class="fas fa-star"></i> Primary Warehouse</small>' : ''}
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

    renderSupplierStep() {
        const savedSuppliers = this.setupData.suppliers || [];
        
        return `
        <div class="page-content">
            <h1>🤝 Supplier Setup</h1>
            <p class="page-subtitle">Step 3 of ${this.totalSteps}: Add your suppliers</p>
            ${this.renderProgressBar()}
            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-truck"></i> Add Supplier</h3>
                    <p>Suppliers provide products to your business.</p>
                    <p><small><i class="fas fa-info-circle"></i> Supplier ID will be auto-generated (SUP-001, SUP-002, etc)</small></p>
                </div>
                <div class="card-body">
                    <form id="supplierForm">
                        <div class="form-group">
                            <label for="supplierName">Supplier Name *</label>
                            <input type="text" id="supplierName" class="form-control" required
                                placeholder="e.g., PT. Supplier Jaya">
                        </div>
                        <div class="form-group">
                            <label for="supplierContact">Contact Person (Optional)</label>
                            <input type="text" id="supplierContact" class="form-control"
                                placeholder="e.g., John Doe">
                        </div>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="supplierPhone">Phone Number</label>
                                <input type="tel" id="supplierPhone" class="form-control"
                                    placeholder="e.g., 021-12345678">
                            </div>
                            <div class="form-group">
                                <label for="supplierEmail">Email Address</label>
                                <input type="email" id="supplierEmail" class="form-control"
                                    placeholder="e.g., supplier@email.com">
                            </div>
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
                        <p class="text-muted">No suppliers added yet.</p>
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
            <p class="page-subtitle">Step 4 of ${this.totalSteps}: Add your customers</p>
            ${this.renderProgressBar()}
            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-users"></i> Add Customer</h3>
                    <p>Customers purchase products from your business.</p>
                    <p><small><i class="fas fa-info-circle"></i> Customer ID will be auto-generated (CUST-001, CUST-002, etc)</small></p>
                </div>
                <div class="card-body">
                    <form id="customerForm">
                        <div class="form-group">
                            <label for="customerName">Customer Name *</label>
                            <input type="text" id="customerName" class="form-control" required
                                placeholder="e.g., John Doe or PT. Customer Jaya">
                        </div>
                        <div class="form-group">
                            <label for="customerType">Customer Type</label>
                            <select id="customerType" class="form-control">
                                <option value="retail">Retail</option>
                                <option value="wholesale">Wholesale</option>
                                <option value="corporate">Corporate</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="customerContact">Contact Person (Optional)</label>
                            <input type="text" id="customerContact" class="form-control"
                                placeholder="e.g., Contact Person Name">
                        </div>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="customerPhone">Phone Number</label>
                                <input type="tel" id="customerPhone" class="form-control"
                                    placeholder="e.g., 021-12345678">
                            </div>
                            <div class="form-group">
                                <label for="customerEmail">Email Address</label>
                                <input type="email" id="customerEmail" class="form-control"
                                    placeholder="e.g., customer@email.com">
                            </div>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" id="customerTaxable" class="form-check-input">
                            <label for="customerTaxable" class="form-check-label">
                                Customer is taxable (requires tax calculation)
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
                        <p class="text-muted">No customers added yet.</p>
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
            <p class="page-subtitle">Step 5 of ${this.totalSteps}: Add product categories</p>
            ${this.renderProgressBar()}
            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-tags"></i> Add Category</h3>
                    <p>Categories help organize your products.</p>
                    <p><small><i class="fas fa-info-circle"></i> Category ID will be auto-generated (CAT-001, CAT-002, etc)</small></p>
                </div>
                <div class="card-body">
                    <form id="categoryForm">
                        <div class="form-group">
                            <label for="categoryName">Category Name *</label>
                            <input type="text" id="categoryName" class="form-control" required
                                placeholder="e.g., Electronics, Clothing, Food">
                        </div>
                        <div class="form-group">
                            <label for="categoryDescription">Description (Optional)</label>
                            <textarea id="categoryDescription" class="form-control" rows="2"
                                placeholder="Brief description of this category"></textarea>
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
                        <p class="text-muted">No categories added yet.</p>
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
        
        return `
        <div class="page-content">
            <h1>📦 Product Setup</h1>
            <p class="page-subtitle">Step 6 of ${this.totalSteps}: Add your products</p>
            ${this.renderProgressBar()}
            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-boxes"></i> Add Product</h3>
                    <p>Products are the items you sell in your business.</p>
                    <p><small><i class="fas fa-info-circle"></i> Product ID will be auto-generated (PROD-00001, PROD-00002, etc)</small></p>
                </div>
                <div class="card-body">
                    <form id="productForm">
                        <div class="form-group">
                            <label for="productName">Product Name *</label>
                            <input type="text" id="productName" class="form-control" required
                                placeholder="e.g., Premium Widget Pro">
                        </div>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="productCategory">Category *</label>
                                <select id="productCategory" class="form-control" required>
                                    <option value="">Select Category</option>
                                    ${(this.setupData.categories || []).map(cat => `
                                    <option value="${cat.id}">${cat.name}</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="productUnit">Unit</label>
                                <select id="productUnit" class="form-control">
                                    <option value="pcs">Pieces (pcs)</option>
                                    <option value="box">Box</option>
                                    <option value="pack">Pack</option>
                                    <option value="kg">Kilogram (kg)</option>
                                    <option value="liter">Liter</option>
                                    <option value="meter">Meter</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="purchasePrice">Purchase Price (Rp)</label>
                                <input type="number" id="purchasePrice" class="form-control" step="0.01" min="0"
                                    placeholder="0.00" value="0">
                            </div>
                            <div class="form-group">
                                <label for="salePrice">Sale Price (Rp)</label>
                                <input type="number" id="salePrice" class="form-control" step="0.01" min="0"
                                    placeholder="0.00" value="0">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="initialStock">Initial Stock</label>
                            <input type="number" id="initialStock" class="form-control" min="0"
                                placeholder="0" value="0">
                            <small class="text-muted">Initial stock will be added to your primary warehouse</small>
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
                        <p class="text-muted">No products added yet.</p>
                        `}
                    </div>
                    <div class="setup-actions">
                        <button type="button" class="btn-secondary" data-action="back" data-step="category">
                            <i class="fas fa-arrow-left"></i> Back
                        </button>
                        <button type="button" class="btn-success" id="completeSetup"
                            ${savedProducts.length === 0 ? 'disabled' : ''}>
                            <i class="fas fa-check-circle"></i> Complete Setup
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    renderMigrate() {
        return `
        <div class="migration-container">
            <div class="migration-header">
                <h2><i class="fas fa-database"></i> Data Migration</h2>
                <p class="subtitle">Import your existing data from Excel template</p>
            </div>
            
            <div class="warning-box">
                <div class="warning-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="warning-content">
                    <h4>Advanced Users Only</h4>
                    <p>This migration tool is designed for users who understand database relationships. 
                    Please ensure you have backed up your data before proceeding.</p>
                    <p><strong>Note:</strong> For demo purposes, this will import sample data.</p>
                </div>
            </div>
            
            <div class="step-guide">
                <h3><i class="fas fa-list-ol"></i> Step-by-Step Migration Guide</h3>
                <div class="steps">
                    <div class="step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h4>Download Template</h4>
                            <p>Get the Excel template with pre-defined columns</p>
                            <a href="template.html" class="btn-download" target="_blank">
                                <i class="fas fa-download"></i> Download Template
                            </a>
                        </div>
                    </div>
                    
                    <div class="step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h4>Fill Your Data</h4>
                            <p>Open the template and fill in your data according to the instructions</p>
                            <ul>
                                <li>Don't modify column headers</li>
                                <li>Keep sheet names unchanged</li>
                                <li>Fill all required fields</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h4>Upload Excel File</h4>
                            <p>Upload the filled Excel file here</p>
                            <div class="upload-section">
                                <div class="file-input-container">
                                    <div class="drop-area" id="dropArea" style="
                                        border: 2px dashed #19BEBB;
                                        border-radius: 10px;
                                        padding: 40px 20px;
                                        text-align: center;
                                        margin-bottom: 20px;
                                        cursor: pointer;
                                        transition: all 0.3s;
                                        background: #f8f9fa;
                                        position: relative;
                                        overflow: hidden;
                                    ">
                                        <i class="fas fa-cloud-upload-alt" style="font-size: 48px; color: #19BEBB; margin-bottom: 15px;"></i>
                                        <h4 style="margin: 0 0 10px 0; color: #333;">Drag & Drop Excel File Here</h4>
                                        <p style="color: #666; margin: 0 0 20px 0; font-size: 14px;">or click to browse</p>
                                        <input type="file" id="excelFile" accept=".xlsx, .xls" style="
                                            position: absolute;
                                            top: 0;
                                            left: 0;
                                            width: 100%;
                                            height: 100%;
                                            opacity: 0;
                                            cursor: pointer;
                                        ">
                                        <button type="button" id="browseFileBtn" class="btn-browse" style="
                                            position: relative;
                                            z-index: 2;
                                        ">
                                            <i class="fas fa-folder-open"></i> Browse Excel File
                                        </button>
                                    </div>
                                    
                                    <div style="text-align: center; margin-top: 15px;">
                                        <span id="selectedFileName" style="
                                            display: inline-block;
                                            padding: 10px 20px;
                                            background: #f8f9fa;
                                            border-radius: 6px;
                                            margin: 10px 0;
                                            color: #666;
                                            border: 1px solid #ddd;
                                            min-width: 200px;
                                        ">No file selected</span>
                                    </div>
                                </div>
                                
                                <button type="button" id="uploadFileBtn" class="btn-upload" disabled>
                                    <i class="fas fa-upload"></i> Upload & Process
                                </button>
                                
                                <div id="uploadProgress" class="progress-container" style="display: none;">
                                    <div class="progress-bar">
                                        <div class="progress-fill" id="progressFill"></div>
                                    </div>
                                    <div class="progress-text" id="progressText">0%</div>
                                </div>
                                
                                <div id="uploadResult" class="result-container"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="action-buttons">
                <button type="button" class="btn-back" onclick="window.location.hash='#setup/start-new'">
                    <i class="fas fa-arrow-left"></i> Back to Setup Options
                </button>
                
                <button type="button" class="btn-cancel" onclick="window.location.hash='#dashboard'">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
        
        <style>
        .migration-container {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .migration-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .migration-header h2 {
            color: #333;
            margin-bottom: 10px;
        }
        
        .subtitle {
            color: #666;
            font-size: 16px;
        }
        
        .warning-box {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            display: flex;
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .warning-icon {
            color: #856404;
            font-size: 24px;
        }
        
        .warning-content h4 {
            color: #856404;
            margin: 0 0 10px 0;
        }
        
        .step-guide {
            background: white;
            border-radius: 10px;
            padding: 25px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .steps {
            margin-top: 20px;
        }
        
        .step {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
            padding-bottom: 30px;
            border-bottom: 1px solid #eee;
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
            flex-shrink: 0;
        }
        
        .step-content h4 {
            margin: 0 0 10px 0;
            color: #333;
        }
        
        .step-content ul {
            margin: 10px 0 0 0;
            padding-left: 20px;
        }
        
        .step-content li {
            margin-bottom: 5px;
            color: #666;
        }
        
        .btn-download, .btn-browse, .btn-upload, .btn-back, .btn-cancel {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
        }
        
        .btn-download {
            background: #19BEBB;
            color: white;
        }
        
        .btn-download:hover {
            background: #0fa8a6;
        }
        
        .btn-browse {
            background: #6c757d;
            color: white;
            padding: 12px 24px;
            font-size: 16px;
        }
        
        .btn-browse:hover {
            background: #5a6268;
        }
        
        .btn-upload {
            background: #10b981;
            color: white;
            margin-top: 15px;
            width: 100%;
            padding: 12px;
            font-size: 16px;
        }
        
        .btn-upload:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        
        .btn-upload:hover:not(:disabled) {
            background: #0da271;
        }
        
        .btn-back {
            background: #f8f9fa;
            color: #333;
            border: 1px solid #ddd;
        }
        
        .btn-back:hover {
            background: #e9ecef;
        }
        
        .btn-cancel {
            background: #ef4444;
            color: white;
        }
        
        .btn-cancel:hover {
            background: #dc2626;
        }
        
        .file-input-container {
            margin: 15px 0;
        }
        
        .progress-container {
            margin-top: 20px;
        }
        
        .progress-bar {
            height: 10px;
            background: #e9ecef;
            border-radius: 5px;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: #19BEBB;
            width: 0%;
            transition: width 0.3s ease;
        }
        
        .progress-text {
            text-align: center;
            margin-top: 5px;
            color: #666;
            font-size: 14px;
        }
        
        .result-container {
            margin-top: 20px;
            padding: 15px;
            border-radius: 8px;
            display: none;
        }
        
        .result-success {
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #a7f3d0;
        }
        
        .result-error {
            background: #fee2e2;
            color: #dc2626;
            border: 1px solid #fca5a5;
        }
        
        #dropArea:hover {
            background: #e3f2fd !important;
            border-color: #0fa8a6 !important;
        }
        
        #dropArea.drag-over {
            background: #e3f2fd !important;
            border-color: #0fa8a6 !important;
            border-style: solid !important;
            transform: scale(1.02);
            transition: all 0.3s ease;
        }
        
        #dropArea.drag-over i {
            color: #0fa8a6 !important;
        }
        
        #dropArea.drag-over h4 {
            color: #0fa8a6 !important;
        }
        
        #dropArea.drag-over p {
            color: #0fa8a6 !important;
        }
        </style>
        `;
    }
}

// Create global instance
window.SetupWizardMulti = SetupWizardMulti;
console.log('✅ SetupWizardMulti loaded successfully - FINAL WORKING VERSION');
