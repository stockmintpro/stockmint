// setup-wizard-multi.js - VERSI FINAL PERBAIKAN PERSISTENSI & UPLOAD

console.log('🔄 setup-wizard-multi.js LOADED - FINAL FIX VERSION');

class SetupWizardMulti {
    constructor() {
        console.log('🔄 SetupWizardMulti constructor called');
        try {
            this.currentStep = this.getCurrentStepFromHash();
            this.totalSteps = 6;
            
            // PERBAIKAN CRITICAL: Selalu cek localStorage terlebih dahulu untuk data permanen
            this.setupData = this.loadSavedData();
            console.log('📊 Setup data loaded from:', this.isSetupCompleted() ? 'localStorage' : 'sessionStorage');
            
            this.userPlan = localStorage.getItem('stockmint_plan') || 'basic';
            this.user = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
            
            // Initialize counters berdasarkan data yang ada
            this.warehouseCounter = this.setupData.warehouses.length;
            this.supplierCounter = this.setupData.suppliers.length;
            this.customerCounter = this.setupData.customers.length;
            this.categoryCounter = this.setupData.categories.length;
            this.productCounter = this.setupData.products.length;
            
            // Flag untuk mencegah multiple event binding
            this.eventsBound = false;
            this.navigationEventsBound = false;
            this.migrateEventsBound = false;
            this.fileHandlersBound = false;
            
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
            this.fileHandlersBound = false;
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

    isSetupCompleted() {
        return localStorage.getItem('stockmint_setup_completed') === 'true' || 
               localStorage.getItem('stockmint_migration_completed') === 'true';
    }

    loadSavedData() {
        // PERBAIKAN CRITICAL: Selalu prioritaskan data permanen di localStorage
        if (this.isSetupCompleted()) {
            console.log('✅ Setup completed, loading from localStorage...');
            return {
                company: JSON.parse(localStorage.getItem('stockmint_company') || '{}'),
                warehouses: JSON.parse(localStorage.getItem('stockmint_warehouses') || '[]'),
                suppliers: JSON.parse(localStorage.getItem('stockmint_suppliers') || '[]'),
                customers: JSON.parse(localStorage.getItem('stockmint_customers') || '[]'),
                categories: JSON.parse(localStorage.getItem('stockmint_categories') || '[]'),
                products: JSON.parse(localStorage.getItem('stockmint_products') || '[]')
            };
        } else {
            console.log('⚠️ Setup not completed, loading from sessionStorage...');
            return {
                company: JSON.parse(sessionStorage.getItem('stockmint_temp_company') || localStorage.getItem('stockmint_company') || '{}'),
                warehouses: JSON.parse(sessionStorage.getItem('stockmint_temp_warehouses') || localStorage.getItem('stockmint_warehouses') || '[]'),
                suppliers: JSON.parse(sessionStorage.getItem('stockmint_temp_suppliers') || localStorage.getItem('stockmint_suppliers') || '[]'),
                customers: JSON.parse(sessionStorage.getItem('stockmint_temp_customers') || localStorage.getItem('stockmint_customers') || '[]'),
                categories: JSON.parse(sessionStorage.getItem('stockmint_temp_categories') || localStorage.getItem('stockmint_categories') || '[]'),
                products: JSON.parse(sessionStorage.getItem('stockmint_temp_products') || localStorage.getItem('stockmint_products') || '[]')
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
        this.fileHandlersBound = false;
        
        setTimeout(() => {
            this.bindFormEvents();
            this.bindNavigationEvents();
            this.updateUI();
            
            // Set flag berdasarkan step
            if (this.currentStep === 'migrate') {
                this.migrateEventsBound = true;
            } else {
                this.eventsBound = true;
            }
            
            console.log('✅ Events bound successfully');
        }, 100);
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
        if (!form) return;
        
        // Clone untuk menghindari multiple binding
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        document.getElementById('companyForm').addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                this.saveCompanyData();
                window.location.hash = '#setup/warehouse';
            } catch (error) {
                this.showAlert(error.message, 'error');
            }
        });
    }

    bindWarehouseForm() {
        const form = document.getElementById('warehouseForm');
        if (!form) return;
        
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        document.getElementById('warehouseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                if (this.saveWarehouseData()) {
                    this.updateUI();
                    this.showAlert('Warehouse added successfully!', 'success');
                    
                    // Reset form
                    setTimeout(() => {
                        document.getElementById('warehouseForm').reset();
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
    }

    bindSupplierForm() {
        const form = document.getElementById('supplierForm');
        if (!form) return;
        
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        document.getElementById('supplierForm').addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                if (this.saveSupplierData()) {
                    this.updateUI();
                    this.showAlert('Supplier added successfully!', 'success');
                    
                    // Reset form
                    setTimeout(() => {
                        document.getElementById('supplierForm').reset();
                    }, 100);
                }
            } catch (error) {
                this.showAlert(error.message, 'error');
            }
        });
    }

    bindCustomerForm() {
        const form = document.getElementById('customerForm');
        if (!form) return;
        
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        document.getElementById('customerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                if (this.saveCustomerData()) {
                    this.updateUI();
                    this.showAlert('Customer added successfully!', 'success');
                    
                    // Reset form
                    setTimeout(() => {
                        document.getElementById('customerForm').reset();
                    }, 100);
                }
            } catch (error) {
                this.showAlert(error.message, 'error');
            }
        });
    }

    bindCategoryForm() {
        const form = document.getElementById('categoryForm');
        if (!form) return;
        
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        document.getElementById('categoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                if (this.saveCategoryData()) {
                    this.updateUI();
                    this.showAlert('Category added successfully!', 'success');
                    
                    // Reset form
                    setTimeout(() => {
                        document.getElementById('categoryForm').reset();
                    }, 100);
                }
            } catch (error) {
                this.showAlert(error.message, 'error');
            }
        });
    }

    bindProductForm() {
        const form = document.getElementById('productForm');
        if (!form) return;
        
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        document.getElementById('productForm').addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                if (this.saveProductData()) {
                    this.updateUI();
                    this.showAlert('Product added successfully!', 'success');
                    
                    // Reset form
                    setTimeout(() => {
                        document.getElementById('productForm').reset();
                    }, 100);
                }
            } catch (error) {
                this.showAlert(error.message, 'error');
            }
        });
    }

    // ===== NAVIGATION EVENTS =====
    
    bindNavigationEvents() {
        if (this.navigationEventsBound) {
            return;
        }
        
        console.log('🔗 Binding navigation events...');
        
        // Bind next buttons
        this.bindNextButton('nextToSupplier', 'supplier');
        this.bindNextButton('nextToCustomer', 'customer');
        this.bindNextButton('nextToCategory', 'category');
        this.bindNextButton('nextToProduct', 'product');
        
        // Bind complete button
        const completeBtn = document.getElementById('completeSetup');
        if (completeBtn) {
            const newBtn = completeBtn.cloneNode(true);
            completeBtn.parentNode.replaceChild(newBtn, completeBtn);
            
            document.getElementById('completeSetup').addEventListener('click', () => {
                if (this.setupData.products.length === 0) {
                    this.showAlert('Please add at least one product', 'error');
                    return;
                }
                this.completeSetup();
            });
        }
        
        // Bind back buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="back"]')) {
                e.preventDefault();
                const step = e.target.closest('[data-action="back"]').dataset.step;
                window.location.hash = `#setup/${step}`;
            }
            
            if (e.target.closest('[data-action="cancel"]')) {
                e.preventDefault();
                this.showCustomConfirm('Are you sure you want to cancel setup? All progress will be lost.').then(confirmed => {
                    if (confirmed) {
                        this.clearSessionStorage();
                        window.location.hash = '#dashboard';
                    }
                });
            }
            
            // Bind remove buttons
            if (e.target.closest('.btn-remove')) {
                e.preventDefault();
                const btn = e.target.closest('.btn-remove');
                const index = parseInt(btn.dataset.index);
                const type = btn.dataset.type;
                
                this.showCustomConfirm(`Are you sure you want to remove this ${type}?`).then(confirmed => {
                    if (confirmed) {
                        this.removeItem(type, index);
                    }
                });
            }
        });
        
        this.navigationEventsBound = true;
    }

    bindNextButton(buttonId, nextStep) {
        const button = document.getElementById(buttonId);
        if (button) {
            const newBtn = button.cloneNode(true);
            button.parentNode.replaceChild(newBtn, button);
            
            document.getElementById(buttonId).addEventListener('click', () => {
                window.location.hash = `#setup/${nextStep}`;
            });
        }
    }

    // ===== MIGRATE EVENTS - PERBAIKAN BESAR =====
    
    bindMigrateEvents() {
        console.log('📤 Binding migrate events...');
        
        if (this.migrateEventsBound) {
            return;
        }
        
        setTimeout(() => {
            // Elements
            const dropArea = document.getElementById('dropArea');
            const fileInput = document.getElementById('excelFile');
            const browseBtn = document.getElementById('browseFileBtn');
            const uploadBtn = document.getElementById('uploadFileBtn');
            const fileNameSpan = document.getElementById('selectedFileName');
            const downloadLink = document.querySelector('.btn-download');
            
            console.log('🔍 Elements found:', {
                dropArea: !!dropArea,
                fileInput: !!fileInput,
                browseBtn: !!browseBtn,
                uploadBtn: !!uploadBtn,
                fileNameSpan: !!fileNameSpan
            });
            
            // 1. Browse button click
            if (browseBtn && fileInput) {
                browseBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📂 Browse button clicked');
                    fileInput.click();
                };
            }
            
            // 2. File input change
            if (fileInput) {
                fileInput.onchange = (e) => {
                    console.log('📄 File selected via input');
                    const file = e.target.files[0];
                    if (file) {
                        this.handleFileSelection(file);
                    }
                };
            }
            
            // 3. Drag & Drop events - PERBAIKAN CRITICAL
            if (dropArea) {
                // Prevent default drag behaviors
                ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                    dropArea.addEventListener(eventName, (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }, false);
                });
                
                // Highlight on drag
                dropArea.addEventListener('dragenter', () => {
                    console.log('📁 File dragged over drop area');
                    dropArea.style.background = '#e3f2fd';
                    dropArea.style.borderColor = '#0fa8a6';
                    dropArea.style.borderStyle = 'solid';
                });
                
                dropArea.addEventListener('dragover', () => {
                    dropArea.style.background = '#e3f2fd';
                    dropArea.style.borderColor = '#0fa8a6';
                    dropArea.style.borderStyle = 'solid';
                });
                
                dropArea.addEventListener('dragleave', () => {
                    dropArea.style.background = '#f8f9fa';
                    dropArea.style.borderColor = '#19BEBB';
                    dropArea.style.borderStyle = 'dashed';
                });
                
                // Handle drop
                dropArea.addEventListener('drop', (e) => {
                    console.log('📁 File dropped');
                    dropArea.style.background = '#f8f9fa';
                    dropArea.style.borderColor = '#19BEBB';
                    dropArea.style.borderStyle = 'dashed';
                    
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                        const file = files[0];
                        this.handleFileSelection(file);
                        
                        // Set file to input
                        if (fileInput) {
                            const dataTransfer = new DataTransfer();
                            dataTransfer.items.add(file);
                            fileInput.files = dataTransfer.files;
                        }
                    }
                });
                
                // Click on drop area
                dropArea.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📂 Drop area clicked');
                    if (fileInput) {
                        fileInput.click();
                    }
                });
            }
            
            // 4. Upload button
            if (uploadBtn) {
                uploadBtn.onclick = (e) => {
                    e.preventDefault();
                    this.handleExcelUpload();
                };
            }
            
            // 5. Download template
            if (downloadLink) {
                downloadLink.onclick = (e) => {
                    e.preventDefault();
                    console.log('📥 Download template clicked');
                    // Buka template.html di tab baru
                    window.open('template.html', '_blank');
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
        
        if (!file) {
            if (fileNameSpan) {
                fileNameSpan.textContent = 'No file selected';
                fileNameSpan.style.color = '#666';
            }
            if (uploadBtn) uploadBtn.disabled = true;
            return;
        }
        
        // Validasi ekstensi
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
        
        // Validasi ukuran (max 10MB)
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
        }
        if (uploadBtn) uploadBtn.disabled = false;
        
        // Simpan file
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
        
        // Show progress
        const progressContainer = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const resultContainer = document.getElementById('uploadResult');
        const uploadBtn = document.getElementById('uploadFileBtn');
        
        if (progressContainer) progressContainer.style.display = 'block';
        if (resultContainer) resultContainer.style.display = 'none';
        if (uploadBtn) uploadBtn.disabled = true;
        
        // Simulate upload progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            if (progressFill) progressFill.style.width = `${progress}%`;
            if (progressText) progressText.textContent = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                this.processExcelUpload(file);
            }
        }, 200);
    }

    processExcelUpload(file) {
        try {
            console.log('📊 Processing Excel file:', file.name);
            
            // Simulasi pemrosesan
            setTimeout(() => {
                // Simpan data contoh ke localStorage
                this.saveMigrationData();
                
                // Update UI
                const resultContainer = document.getElementById('uploadResult');
                const uploadBtn = document.getElementById('uploadFileBtn');
                const fileNameSpan = document.getElementById('selectedFileName');
                const progressContainer = document.getElementById('uploadProgress');
                
                if (resultContainer) {
                    resultContainer.innerHTML = `
                        <div style="display: flex; gap: 15px; align-items: start;">
                            <i class="fas fa-check-circle" style="color: #10b981; font-size: 24px; margin-top: 2px;"></i>
                            <div>
                                <h4 style="margin: 0 0 10px 0; color: #065f46;">Upload Successful!</h4>
                                <p style="margin: 0 0 5px 0; color: #065f46;">File "${file.name}" has been processed successfully.</p>
                                <p style="margin: 0; color: #065f46;">Sample data has been imported to the system.</p>
                            </div>
                        </div>
                    `;
                    resultContainer.className = 'result-container result-success';
                    resultContainer.style.display = 'block';
                }
                
                if (progressContainer) progressContainer.style.display = 'none';
                if (uploadBtn) uploadBtn.disabled = false;
                if (fileNameSpan) {
                    fileNameSpan.textContent = 'No file selected';
                    fileNameSpan.style.color = '#666';
                }
                
                // Reset file input
                const fileInput = document.getElementById('excelFile');
                if (fileInput) fileInput.value = '';
                
                // Redirect setelah 2 detik
                setTimeout(() => {
                    this.showAlert('Migration completed! Redirecting to dashboard...', 'success');
                    setTimeout(() => {
                        window.location.hash = '#dashboard';
                    }, 1500);
                }, 1000);
                
            }, 1500);
            
        } catch (error) {
            console.error('Error processing Excel file:', error);
            this.showAlert(`Upload failed: ${error.message}`, 'error');
            
            const uploadBtn = document.getElementById('uploadFileBtn');
            const progressContainer = document.getElementById('uploadProgress');
            if (uploadBtn) uploadBtn.disabled = false;
            if (progressContainer) progressContainer.style.display = 'none';
        }
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
        
        // Simpan ke session storage
        sessionStorage.setItem('stockmint_temp_company', JSON.stringify(this.setupData.company));
        
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
        sessionStorage.setItem('stockmint_temp_products', JSON.stringify(this.setupData.products));
        
        return true;
    }

    // ===== COMPLETE SETUP =====
    
    completeSetup() {
        try {
            console.log('✅ Completing setup process...');
            
            // 1. Transfer semua data dari sessionStorage ke localStorage (PERMANEN)
            localStorage.setItem('stockmint_company', JSON.stringify(this.setupData.company));
            localStorage.setItem('stockmint_warehouses', JSON.stringify(this.setupData.warehouses));
            localStorage.setItem('stockmint_suppliers', JSON.stringify(this.setupData.suppliers));
            localStorage.setItem('stockmint_customers', JSON.stringify(this.setupData.customers));
            localStorage.setItem('stockmint_categories', JSON.stringify(this.setupData.categories));
            localStorage.setItem('stockmint_products', JSON.stringify(this.setupData.products));
            
            // 2. Mark setup as completed (FLAG CRITICAL)
            localStorage.setItem('stockmint_setup_completed', 'true');
            localStorage.setItem('stockmint_setup_date', new Date().toISOString());
            
            // 3. Buat opening stock
            this.createOpeningStock();
            
            // 4. Hapus data sementara
            this.clearSessionStorage();
            
            // 5. Show success message
            this.showAlert('🎉 Setup completed successfully! Redirecting to dashboard...', 'success');
            
            console.log('✅ Setup completed, data saved permanently to localStorage');
            
            // 6. Redirect setelah 2 detik
            setTimeout(() => {
                window.location.hash = '#dashboard';
            }, 2000);
            
        } catch (error) {
            console.error('Error completing setup:', error);
            this.showAlert(`Failed to complete setup: ${error.message}`, 'error');
        }
    }

    // ===== MIGRATION DATA =====
    
    saveMigrationData() {
        console.log('💾 Saving migration data to localStorage...');
        
        const sampleData = {
            company: {
                id: 'COMP001',
                name: 'PT. Contoh Usaha Migrasi',
                taxId: '01.234.567.8-912.000',
                address: 'Jl. Migrasi No. 123, Jakarta',
                phone: '021-87654321',
                email: 'info@migrasi.com',
                businessType: 'retail',
                setupDate: new Date().toISOString(),
                createdAt: new Date().toISOString()
            },
            warehouses: [
                {
                    id: 'WH-001',
                    name: 'Gudang Utama',
                    code: 'WH-001',
                    address: 'Jl. Gudang Utama No. 1',
                    isPrimary: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'WH-002',
                    name: 'Gudang Cabang',
                    code: 'WH-002',
                    address: 'Jl. Cabang No. 2',
                    isPrimary: false,
                    createdAt: new Date().toISOString()
                }
            ],
            suppliers: Array.from({length: 5}, (_, i) => ({
                id: `SUP-${String(i+1).padStart(3, '0')}`,
                name: `Supplier Migrasi ${i+1}`,
                code: `SUP-${String(i+1).padStart(3, '0')}`,
                contact: `Contact Person ${i+1}`,
                phone: `021-${1000 + i}`,
                email: `supplier${i+1}@migrasi.com`,
                isActive: true,
                createdAt: new Date().toISOString()
            })),
            customers: Array.from({length: 10}, (_, i) => ({
                id: `CUST-${String(i+1).padStart(3, '0')}`,
                name: `Customer Migrasi ${i+1}`,
                type: i % 3 === 0 ? 'retail' : (i % 3 === 1 ? 'wholesale' : 'corporate'),
                contact: `Customer Contact ${i+1}`,
                phone: `021-${2000 + i}`,
                email: `customer${i+1}@migrasi.com`,
                taxable: i % 2 === 0,
                isActive: true,
                createdAt: new Date().toISOString()
            })),
            categories: Array.from({length: 8}, (_, i) => ({
                id: `CAT-${String(i+1).padStart(3, '0')}`,
                name: `Kategori ${i+1}`,
                code: `CAT-${String(i+1).padStart(3, '0')}`,
                description: `Deskripsi untuk kategori ${i+1}`,
                createdAt: new Date().toISOString()
            })),
            products: Array.from({length: 25}, (_, i) => ({
                id: `PROD-${String(i+1).padStart(3, '0')}`,
                name: `Produk Migrasi ${i+1}`,
                code: `PROD-${String(i+1).padStart(3, '0')}`,
                categoryId: `CAT-${String((i % 8) + 1).padStart(3, '0')}`,
                category: `Kategori ${(i % 8) + 1}`,
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
        
        // Mark migration as completed
        localStorage.setItem('stockmint_migration_completed', 'true');
        localStorage.setItem('stockmint_setup_completed', 'true'); // Juga set flag setup completed
        localStorage.setItem('stockmint_migration_date', new Date().toISOString());
        
        // Buat opening stock
        this.createOpeningStockFromSample(sampleData);
        
        console.log('✅ Migration data saved to localStorage');
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

    // ===== UTILITY METHODS =====
    
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
        
        // Update tombol next
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
        
        // Update tombol add warehouse berdasarkan plan
        const addWarehouseBtn = document.querySelector('#warehouseForm button[type="submit"]');
        if (addWarehouseBtn) {
            const warehouseLimit = this.userPlan === 'basic' ? 1 :
                this.userPlan === 'pro' ? 3 : Infinity;
            addWarehouseBtn.disabled = this.setupData.warehouses.length >= warehouseLimit;
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

    removeItem(type, index) {
        let removed = false;
        
        switch(type) {
            case 'warehouse':
                if (index >= 0 && index < this.setupData.warehouses.length) {
                    const removedWarehouse = this.setupData.warehouses.splice(index, 1)[0];
                    sessionStorage.setItem('stockmint_temp_warehouses', JSON.stringify(this.setupData.warehouses));
                    
                    // Jika warehouse yang dihapus adalah primary, set warehouse pertama sebagai primary
                    if (removedWarehouse.isPrimary && this.setupData.warehouses.length > 0) {
                        this.setupData.warehouses[0].isPrimary = true;
                        sessionStorage.setItem('stockmint_temp_warehouses', JSON.stringify(this.setupData.warehouses));
                    }
                    removed = true;
                }
                break;
                
            case 'supplier':
                if (index >= 0 && index < this.setupData.suppliers.length) {
                    this.setupData.suppliers.splice(index, 1);
                    sessionStorage.setItem('stockmint_temp_suppliers', JSON.stringify(this.setupData.suppliers));
                    removed = true;
                }
                break;
                
            case 'customer':
                if (index >= 0 && index < this.setupData.customers.length) {
                    this.setupData.customers.splice(index, 1);
                    sessionStorage.setItem('stockmint_temp_customers', JSON.stringify(this.setupData.customers));
                    removed = true;
                }
                break;
                
            case 'category':
                if (index >= 0 && index < this.setupData.categories.length) {
                    this.setupData.categories.splice(index, 1);
                    sessionStorage.setItem('stockmint_temp_categories', JSON.stringify(this.setupData.categories));
                    removed = true;
                }
                break;
                
            case 'product':
                if (index >= 0 && index < this.setupData.products.length) {
                    this.setupData.products.splice(index, 1);
                    sessionStorage.setItem('stockmint_temp_products', JSON.stringify(this.setupData.products));
                    removed = true;
                }
                break;
        }
        
        if (removed) {
            this.showAlert(`${type} removed successfully`, 'success');
            this.updateUI();
        }
    }

    // ===== HELPER METHODS =====
    
    showCustomConfirm(message) {
        return new Promise((resolve) => {
            // Hapus modal confirm yang sudah ada
            const existingModal = document.getElementById('customConfirmModal');
            if (existingModal) existingModal.remove();
            
            const modalHTML = `
                <div id="customConfirmModal" style="
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5); display: flex; align-items: center;
                    justify-content: center; z-index: 10000;">
                    <div style="background: white; border-radius: 10px; padding: 25px;
                        max-width: 400px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <div style="font-size: 48px; color: #f59e0b; margin-bottom: 15px;">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <h3 style="margin: 0 0 10px 0; color: #333;">Confirm Action</h3>
                            <p style="color: #666; margin: 0; line-height: 1.5;">${message}</p>
                        </div>
                        <div style="display: flex; gap: 15px; justify-content: center;">
                            <button id="confirmCancel" style="
                                background: #6c757d; color: white; border: none;
                                padding: 10px 20px; border-radius: 6px; font-weight: 600;
                                cursor: pointer; flex: 1;">Cancel</button>
                            <button id="confirmOk" style="
                                background: #f59e0b; color: white; border: none;
                                padding: 10px 20px; border-radius: 6px; font-weight: 600;
                                cursor: pointer; flex: 1;">OK</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            const modal = document.getElementById('customConfirmModal');
            const confirmOk = document.getElementById('confirmOk');
            const confirmCancel = document.getElementById('confirmCancel');
            
            const handleConfirm = (result) => {
                modal.remove();
                resolve(result);
            };
            
            confirmOk.addEventListener('click', () => handleConfirm(true));
            confirmCancel.addEventListener('click', () => handleConfirm(false));
            
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'customConfirmModal') handleConfirm(false);
            });
            
            // ESC key to cancel
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') handleConfirm(false);
            };
            document.addEventListener('keydown', handleKeyDown);
            
            // Cleanup
            setTimeout(() => {
                document.removeEventListener('keydown', handleKeyDown);
            }, 100);
        });
    }

    showAlert(message, type = 'info') {
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 15px 20px;
            border-radius: 8px; z-index: 9999; min-width: 300px; max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideIn 0.3s ease;
            display: flex; align-items: center; gap: 10px;
        `;
        
        // Set color based on type
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
            <div style="flex: 1;">${message}</div>
            <button class="alert-close" style="background: none; border: none; color: ${textColor}; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to document
        document.body.appendChild(alertDiv);
        
        // Add close button event
        alertDiv.querySelector('.alert-close').addEventListener('click', () => {
            alertDiv.remove();
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
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
                                ${isBasicPlan && isFirstWarehouse ? 'checked disabled' : ''}>
                            <label for="isPrimary" class="form-check-label">
                                Set as primary warehouse (default storage location)
                            </label>
                        </div>
                        <button type="submit" class="btn-primary" ${savedWarehouses.length >= warehouseLimit ? 'disabled' : ''}>
                            <i class="fas fa-plus"></i> Add Warehouse
                        </button>
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
                        <p class="text-muted">No warehouses added yet.</p>
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
                    <h4>Important Notice</h4>
                    <p>This migration tool will import sample data for demonstration purposes.</p>
                    <p><strong>Note:</strong> Your existing data will be replaced with sample data.</p>
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
                            <h4>Upload Excel File</h4>
                            <p>Upload your Excel file here</p>
                            <div class="upload-section">
                                <div class="file-input-container">
                                    <div class="drop-area" id="dropArea">
                                        <i class="fas fa-cloud-upload-alt"></i>
                                        <h4>Drag & Drop Excel File Here</h4>
                                        <p>or click to browse</p>
                                        <button type="button" id="browseFileBtn" class="btn-browse">
                                            <i class="fas fa-folder-open"></i> Browse Excel File
                                        </button>
                                        <input type="file" id="excelFile" accept=".xlsx, .xls">
                                    </div>
                                    
                                    <div class="file-name-display">
                                        <span id="selectedFileName">No file selected</span>
                                    </div>
                                </div>
                                
                                <button type="button" id="uploadFileBtn" class="btn-upload" disabled>
                                    <i class="fas fa-upload"></i> Upload & Process
                                </button>
                                
                                <div id="uploadProgress" class="progress-container">
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
        
        .drop-area {
            border: 2px dashed #19BEBB;
            border-radius: 10px;
            padding: 40px 20px;
            text-align: center;
            margin-bottom: 20px;
            cursor: pointer;
            transition: all 0.3s;
            background: #f8f9fa;
            position: relative;
        }
        
        .drop-area i {
            font-size: 48px;
            color: #19BEBB;
            margin-bottom: 15px;
        }
        
        .drop-area h4 {
            margin: 0 0 10px 0;
            color: #333;
        }
        
        .drop-area p {
            color: #666;
            margin: 0 0 20px 0;
            font-size: 14px;
        }
        
        #excelFile {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: pointer;
        }
        
        .file-name-display {
            text-align: center;
            margin-top: 15px;
        }
        
        #selectedFileName {
            display: inline-block;
            padding: 10px 20px;
            background: #f8f9fa;
            border-radius: 6px;
            margin: 10px 0;
            color: #666;
            border: 1px solid #ddd;
            min-width: 200px;
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
            text-decoration: none;
        }
        
        .btn-download:hover {
            background: #0fa8a6;
        }
        
        .btn-browse {
            background: #6c757d;
            color: white;
            padding: 12px 24px;
            font-size: 16px;
            position: relative;
            z-index: 2;
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
        
        .progress-container {
            margin-top: 20px;
            display: none;
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
        </style>
        `;
    }
}

// Create global instance
window.SetupWizardMulti = SetupWizardMulti;
console.log('✅ SetupWizardMulti loaded successfully - FINAL FIX VERSION');
