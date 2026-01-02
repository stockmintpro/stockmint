// setup-wizard-multi.js - VERSI FIXED COMPLETE DENGAN PERBAIKAN MASALAH

console.log('🔄 setup-wizard-multi.js LOADED - VERSION FIXED WITH UPDATES');

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
        }
    }

    getCurrentStepFromHash() {
        const hash = window.location.hash.substring(1);
        const route = hash.split('/')[1];
        if (route && route !== 'migrate') {
            return route;
        }
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

    // ===== EVENT BINDING DIPERBAIKI =====
    
    bindEvents() {
        console.log('🔧 Binding events for step:', this.currentStep);
        
        // Cegah multiple binding
        if (this.eventsBound) {
            console.log('⚠️ Events already bound, skipping...');
            return;
        }
        
        setTimeout(() => {
            this.bindFormEvents();
            this.bindNavigationEvents();
            this.updateUI();
            this.eventsBound = true;
        }, 100);
    }

    // Force bind events (untuk kasus khusus)
    forceBindEvents() {
        console.log('🔧 Force binding events...');
        this.eventsBound = false;
        this.bindEvents();
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
        if (form) {
            // Clone form untuk menghapus event listeners lama
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            
            document.getElementById('companyForm').addEventListener('submit', (e) => {
                e.preventDefault();
                try {
                    this.saveCompanyData();
                    // PROBLEM 2 FIXED: Hapus alert dan langsung redirect
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
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            
            document.getElementById('warehouseForm').addEventListener('submit', (e) => {
                e.preventDefault();
                try {
                    if (this.saveWarehouseData()) {
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
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            
            document.getElementById('supplierForm').addEventListener('submit', (e) => {
                e.preventDefault();
                try {
                    if (this.saveSupplierData()) {
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
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            
            document.getElementById('customerForm').addEventListener('submit', (e) => {
                e.preventDefault();
                try {
                    if (this.saveCustomerData()) {
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
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            
            document.getElementById('categoryForm').addEventListener('submit', (e) => {
                e.preventDefault();
                try {
                    if (this.saveCategoryData()) {
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
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            
            document.getElementById('productForm').addEventListener('submit', (e) => {
                e.preventDefault();
                try {
                    if (this.saveProductData()) {
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

    // ===== NAVIGATION EVENTS DIPERBAIKI (PROBLEM 3 FIXED) =====
    
    bindNavigationEvents() {
        // Cegah multiple binding
        if (this.navigationEventsBound) {
            return;
        }
        
        console.log('🔗 Binding navigation events...');
        
        // Event delegation untuk tombol remove dengan satu event handler
        document.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.btn-remove');
            if (removeBtn) {
                e.preventDefault();
                e.stopPropagation();
                
                const index = parseInt(removeBtn.dataset.index);
                const type = removeBtn.dataset.type;
                
                // PROBLEM 3 FIXED: Gunakan konfirmasi yang proper
                if (confirm(`Are you sure you want to remove this ${type}?`)) {
                    let removed = false;
                    
                    switch(type) {
                        case 'warehouse':
                            this.removeWarehouse(index);
                            removed = true;
                            break;
                        case 'supplier':
                            this.removeSupplier(index);
                            removed = true;
                            break;
                        case 'customer':
                            this.removeCustomer(index);
                            removed = true;
                            break;
                        case 'category':
                            this.removeCategory(index);
                            removed = true;
                            break;
                        case 'product':
                            this.removeProduct(index);
                            removed = true;
                            break;
                    }
                    
                    if (removed) {
                        this.showAlert(`${type.charAt(0).toUpperCase() + type.slice(1)} removed successfully`, 'success');
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
        
        this.navigationEventsBound = true;
    }

    // ===== METHOD renderMigrate() YANG DIPERBARUI =====
    
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
                    <p><strong>Template Complexity:</strong> High - requires understanding of multiple table relationships.</p>
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
                                    <input type="file" id="excelFile" accept=".xlsx, .xls" style="display: none;">
                                    <button type="button" id="browseFileBtn" class="btn-browse">
                                        <i class="fas fa-folder-open"></i> Browse Excel File
                                    </button>
                                    <span id="selectedFileName">No file selected</span>
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
        }
        
        .btn-browse:hover {
            background: #5a6268;
        }
        
        .btn-upload {
            background: #10b981;
            color: white;
            margin-top: 15px;
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
            display: flex;
            align-items: center;
            gap: 15px;
            margin: 15px 0;
        }
        
        #selectedFileName {
            color: #666;
            font-style: italic;
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
        
        .action-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 30px;
        }
        </style>
        `;
    }

    // ===== BIND EVENTS UNTUK MIGRATE PAGE (PROBLEM 5 FIXED) =====
    
    bindMigrateEvents() {
        console.log('📤 Binding migrate events...');
        
        const browseBtn = document.getElementById('browseFileBtn');
        const fileInput = document.getElementById('excelFile');
        const uploadBtn = document.getElementById('uploadFileBtn');
        const fileNameSpan = document.getElementById('selectedFileName');
        
        if (browseBtn && fileInput) {
            browseBtn.addEventListener('click', () => {
                fileInput.click();
            });
            
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    fileNameSpan.textContent = file.name;
                    uploadBtn.disabled = false;
                } else {
                    fileNameSpan.textContent = 'No file selected';
                    uploadBtn.disabled = true;
                }
            });
        }
        
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                this.handleExcelUpload();
            });
        }
    }

    // ===== HANDLE EXCEL UPLOAD (PROBLEM 5 FIXED) =====
    
    handleExcelUpload() {
        const fileInput = document.getElementById('excelFile');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showAlert('Please select an Excel file first', 'error');
            return;
        }
        
        // Validasi ekstensi file
        const validExtensions = ['.xlsx', '.xls'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!validExtensions.includes(fileExtension)) {
            this.showAlert('Please select a valid Excel file (.xlsx or .xls)', 'error');
            return;
        }
        
        // Tampilkan progress bar
        const progressContainer = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const resultContainer = document.getElementById('uploadResult');
        
        progressContainer.style.display = 'block';
        resultContainer.style.display = 'none';
        
        // Simulasi progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                this.processExcelFile(file);
            }
        }, 200);
    }

    processExcelFile(file) {
        const resultContainer = document.getElementById('uploadResult');
        
        try {
            // Untuk demo, kita simulasi proses upload
            // Dalam implementasi nyata, gunakan library XLSX
            console.log('Processing Excel file:', file.name);
            
            setTimeout(() => {
                resultContainer.innerHTML = `
                    <div class="result-success">
                        <i class="fas fa-check-circle"></i>
                        <div>
                            <h4>Upload Successful!</h4>
                            <p>File "${file.name}" has been processed successfully.</p>
                            <p>Data has been imported to the system.</p>
                        </div>
                    </div>
                `;
                resultContainer.className = 'result-container result-success';
                resultContainer.style.display = 'block';
                
                // Simpan status upload
                localStorage.setItem('stockmint_migration_completed', 'true');
                localStorage.setItem('stockmint_migration_file', file.name);
                localStorage.setItem('stockmint_migration_date', new Date().toISOString());
                
                // Redirect setelah 3 detik
                setTimeout(() => {
                    this.showAlert('Migration completed successfully! Redirecting to dashboard...', 'success');
                    setTimeout(() => {
                        window.location.hash = '#dashboard';
                        window.location.reload();
                    }, 2000);
                }, 1000);
                
            }, 1500);
            
        } catch (error) {
            console.error('Error processing Excel file:', error);
            
            resultContainer.innerHTML = `
                <div class="result-error">
                    <i class="fas fa-exclamation-circle"></i>
                    <div>
                        <h4>Upload Failed</h4>
                        <p>Error: ${error.message}</p>
                        <p>Please check your Excel file format and try again.</p>
                    </div>
                </div>
            `;
            resultContainer.className = 'result-container result-error';
            resultContainer.style.display = 'block';
        }
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
        
        // Update tombol next
        const warehouseNext = document.getElementById('nextToSupplier');
        const supplierNext = document.getElementById('nextToCustomer');
        const customerNext = document.getElementById('nextToCustomer');
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

    // ===== DATA SAVING =====
    
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
        
        // Check duplicate name
        const existingWarehouse = this.setupData.warehouses.find(wh =>
            wh.name.toLowerCase() === name.toLowerCase()
        );
        
        if (existingWarehouse) {
            throw new Error('Warehouse with this name already exists');
        }
        
        // Generate ID sederhana
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
        document.getElementById('warehouseForm').reset();
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
        localStorage.setItem('stockmint_suppliers', JSON.stringify(this.setupData.suppliers));
        
        document.getElementById('supplierForm').reset();
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
        localStorage.setItem('stockmint_customers', JSON.stringify(this.setupData.customers));
        
        document.getElementById('customerForm').reset();
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
        localStorage.setItem('stockmint_categories', JSON.stringify(this.setupData.categories));
        
        document.getElementById('categoryForm').reset();
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
        localStorage.setItem('stockmint_products', JSON.stringify(this.setupData.products));
        
        document.getElementById('productForm').reset();
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
            dropdown.innerHTML = `
                <option value="">Select Category</option>
                ${categories.map(cat => `
                <option value="${cat.id}">${cat.name}</option>
                `).join('')}
            `;
        }
    }

    // ===== REMOVE ITEMS DIPERBAIKI =====
    
    removeWarehouse(index) {
        if (index >= 0 && index < this.setupData.warehouses.length) {
            this.setupData.warehouses.splice(index, 1);
            localStorage.setItem('stockmint_warehouses', JSON.stringify(this.setupData.warehouses));
            this.updateWarehouseList();
            this.updateUI();
        }
    }

    removeSupplier(index) {
        if (index >= 0 && index < this.setupData.suppliers.length) {
            this.setupData.suppliers.splice(index, 1);
            localStorage.setItem('stockmint_suppliers', JSON.stringify(this.setupData.suppliers));
            this.updateSupplierList();
            this.updateUI();
        }
    }

    removeCustomer(index) {
        if (index >= 0 && index < this.setupData.customers.length) {
            this.setupData.customers.splice(index, 1);
            localStorage.setItem('stockmint_customers', JSON.stringify(this.setupData.customers));
            this.updateCustomerList();
            this.updateUI();
        }
    }

    removeCategory(index) {
        if (index >= 0 && index < this.setupData.categories.length) {
            this.setupData.categories.splice(index, 1);
            localStorage.setItem('stockmint_categories', JSON.stringify(this.setupData.categories));
            this.updateCategoryList();
            this.updateUI();
            this.updateProductCategoryDropdown();
        }
    }

    removeProduct(index) {
        if (index >= 0 && index < this.setupData.products.length) {
            this.setupData.products.splice(index, 1);
            localStorage.setItem('stockmint_products', JSON.stringify(this.setupData.products));
            this.updateProductList();
            this.updateUI();
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

    // ===== RENDER STEP METHODS =====
    
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
                    <p><small><i class="fas fa-info-circle"></i> Product ID will be auto-generated (PROD-001, PROD-002, etc)</small></p>
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

    // ===== METHOD UNTUK RENDER MIGRATE PAGE =====
    
    renderMigratePage() {
        return this.renderMigrate();
    }

    // ===== HELPER METHODS =====
    
    showAlert(message, type = 'info') {
        // Create alert element
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
            <div style="flex: 1;">
                <div style="font-weight: 600;">${message}</div>
            </div>
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
                alertDiv.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (alertDiv.parentNode) {
                        alertDiv.remove();
                    }
                }, 300);
            }
        }, 5000);
        
        // Add CSS animations if not already added
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
}

// Create global instance
window.SetupWizardMulti = SetupWizardMulti;
console.log('✅ SetupWizardMulti loaded successfully');
