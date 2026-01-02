// setup-wizard-multi.js - PERBAIKAN FINAL UNTUK 3 MASALAH TERAKHIR

console.log('🔄 setup-wizard-multi.js LOADED - FINAL FIXES');

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

    // ... (methods yang sama sampai bindNavigationEvents)

    // ===== NAVIGATION EVENTS DIPERBAIKI (MASALAH 2 FIXED) =====
    
    bindNavigationEvents() {
        // Cegah multiple binding
        if (this.navigationEventsBound) {
            console.log('⚠️ Navigation events already bound, skipping...');
            return;
        }
        
        console.log('🔗 Binding navigation events...');
        
        // Event delegation untuk tombol remove dengan PROMISE yang benar
        document.addEventListener('click', async (e) => {
            // Cek jika klik pada tombol remove
            const removeBtn = e.target.closest('.btn-remove');
            if (removeBtn) {
                e.preventDefault();
                e.stopPropagation();
                
                const index = parseInt(removeBtn.dataset.index);
                const type = removeBtn.dataset.type;
                
                // PERBAIKAN MASALAH 2: Gunakan async/await untuk menunggu konfirmasi
                try {
                    const confirmed = await this.showCustomConfirm(`Are you sure you want to remove this ${type}?`);
                    
                    if (confirmed) {
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
                    } else {
                        console.log('User cancelled removal');
                    }
                } catch (error) {
                    console.error('Error in removal process:', error);
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
                try {
                    const confirmed = await this.showCustomConfirm('Are you sure you want to cancel setup? All progress will be lost.');
                    if (confirmed) {
                        localStorage.removeItem('stockmint_company');
                        localStorage.removeItem('stockmint_warehouses');
                        localStorage.removeItem('stockmint_suppliers');
                        localStorage.removeItem('stockmint_customers');
                        localStorage.removeItem('stockmint_categories');
                        localStorage.removeItem('stockmint_products');
                        window.location.hash = '#dashboard';
                    }
                } catch (error) {
                    console.error('Error in cancel process:', error);
                }
                return;
            }
        });
        
        this.navigationEventsBound = true;
    }

    // ===== PERBAIKAN FILE UPLOAD (MASALAH 1 FIXED) =====
    
    bindMigrateEvents() {
        console.log('📤 Binding migrate events...');
        
        // Cegah multiple binding
        if (this.migrateEventsBound) {
            console.log('⚠️ Migrate events already bound, skipping...');
            return;
        }
        
        // Gunakan setTimeout untuk memastikan DOM sudah dirender
        setTimeout(() => {
            const browseBtn = document.getElementById('browseFileBtn');
            const fileInput = document.getElementById('excelFile');
            const uploadBtn = document.getElementById('uploadFileBtn');
            const fileNameSpan = document.getElementById('selectedFileName');
            const dropArea = document.getElementById('dropArea');
            
            console.log('📁 File input elements:', { browseBtn, fileInput, uploadBtn, fileNameSpan, dropArea });
            
            // PERBAIKAN MASALAH 1: Pastikan event binding untuk file input
            if (browseBtn && fileInput) {
                // Hapus event listener lama jika ada
                browseBtn.replaceWith(browseBtn.cloneNode(true));
                fileInput.replaceWith(fileInput.cloneNode(true));
                
                const newBrowseBtn = document.getElementById('browseFileBtn');
                const newFileInput = document.getElementById('excelFile');
                
                newBrowseBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📂 Browse button clicked');
                    newFileInput.click();
                });
                
                newFileInput.addEventListener('change', (e) => {
                    console.log('📄 File selected via input');
                    this.handleFileSelection(e.target.files[0], fileNameSpan, uploadBtn);
                });
            }
            
            // PERBAIKAN MASALAH 1: Drag & drop functionality dengan event delegation
            if (dropArea) {
                // Hapus event listener lama jika ada
                dropArea.replaceWith(dropArea.cloneNode(true));
                const newDropArea = document.getElementById('dropArea');
                
                // Prevent default drag behaviors
                ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                    newDropArea.addEventListener(eventName, (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    });
                });
                
                // Highlight drop area when item is dragged over it
                newDropArea.addEventListener('dragenter', () => {
                    newDropArea.classList.add('drag-over');
                    console.log('📁 File dragged over drop area');
                });
                
                newDropArea.addEventListener('dragover', () => {
                    newDropArea.classList.add('drag-over');
                });
                
                newDropArea.addEventListener('dragleave', () => {
                    newDropArea.classList.remove('drag-over');
                });
                
                newDropArea.addEventListener('drop', (e) => {
                    newDropArea.classList.remove('drag-over');
                    const files = e.dataTransfer.files;
                    console.log('📁 Files dropped:', files.length);
                    if (files.length > 0) {
                        this.handleFileSelection(files[0], fileNameSpan, uploadBtn);
                    }
                });
                
                // Click on drop area also triggers file input
                newDropArea.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📂 Drop area clicked');
                    if (fileInput) fileInput.click();
                });
            }
            
            // Upload button event
            if (uploadBtn) {
                uploadBtn.addEventListener('click', () => {
                    this.handleExcelUpload();
                });
            }
            
            this.migrateEventsBound = true;
            this.fileHandlersBound = true;
            console.log('✅ Migrate events bound successfully');
        }, 300);
    }

    // ===== PERBAIKAN TOMBOL NEXT (MASALAH 3 FIXED) =====
    
    updateUI() {
        console.log('🔄 Updating UI...');
        
        // Update semua list
        this.updateWarehouseList();
        this.updateSupplierList();
        this.updateCustomerList();
        this.updateCategoryList();
        this.updateProductList();
        this.updateProductCategoryDropdown();
        
        // PERBAIKAN MASALAH 3: Update tombol next dengan kondisi yang benar
        const warehouseNext = document.getElementById('nextToSupplier');
        const supplierNext = document.getElementById('nextToCustomer');
        const customerNext = document.getElementById('nextToCategory');
        const categoryNext = document.getElementById('nextToProduct');
        const completeBtn = document.getElementById('completeSetup');
        
        console.log('🔄 Checking warehouse count:', this.setupData.warehouses.length);
        console.log('🔄 Next button element:', warehouseNext);
        
        if (warehouseNext) {
            const hasWarehouses = this.setupData.warehouses.length > 0;
            warehouseNext.disabled = !hasWarehouses;
            console.log(`🔄 Warehouse next button: ${hasWarehouses ? 'ENABLED' : 'DISABLED'}`);
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
        
        // PERBAIKAN TAMBAHAN: Pastikan checkbox primary untuk BASIC plan
        const isPrimaryCheckbox = document.getElementById('isPrimary');
        if (isPrimaryCheckbox && this.userPlan === 'basic') {
            if (this.setupData.warehouses.length === 0) {
                isPrimaryCheckbox.checked = true;
                isPrimaryCheckbox.disabled = true;
            }
        }
    }

    // ===== METHOD RENDER WAREHOUSE STEP DIPERBAIKI =====
    
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

    // ===== METHOD SAVE WAREHOUSE DATA DIPERBAIKI =====
    
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
        
        // PERBAIKAN: Untuk paket BASIC, warehouse pertama HARUS primary
        if (this.userPlan === 'basic' && this.setupData.warehouses.length === 0) {
            isPrimary = true; // Force primary untuk BASIC plan warehouse pertama
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
        const warehouseForm = document.getElementById('warehouseForm');
        if (warehouseForm) {
            warehouseForm.reset();
        }
        
        // PERBAIKAN: Update checkbox untuk BASIC plan
        if (this.userPlan === 'basic' && isPrimaryCheckbox) {
            isPrimaryCheckbox.checked = true;
            isPrimaryCheckbox.disabled = true;
        }
        
        // PERBAIKAN MASALAH 3: Update UI setelah menambahkan warehouse
        this.updateUI();
        
        // PERBAIKAN TAMBAHAN: Setel ulang fokus ke input nama
        const warehouseNameInput = document.getElementById('warehouseName');
        if (warehouseNameInput) {
            warehouseNameInput.focus();
        }
        
        return true;
    }

    // ===== CUSTOM CONFIRM DIALOG YANG DIPERBAIKI =====
    
    showCustomConfirm(message) {
        return new Promise((resolve) => {
            // Hapus modal confirm yang sudah ada
            const existingModal = document.getElementById('customConfirmModal');
            if (existingModal) {
                existingModal.remove();
            }
            
            // Buat modal confirm custom
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
            
            // Tambah style untuk animasi
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
                    #confirmCancel:hover { background: #5a6268 !important; }
                    #confirmOk:hover { background: #d97706 !important; }
                `;
                document.head.appendChild(style);
            }
            
            // Bind events untuk tombol
            const modal = document.getElementById('customConfirmModal');
            const confirmOk = document.getElementById('confirmOk');
            const confirmCancel = document.getElementById('confirmCancel');
            
            const handleConfirm = (result) => {
                modal.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    if (modal.parentNode) {
                        modal.remove();
                    }
                    resolve(result);
                }, 300);
            };
            
            confirmOk.addEventListener('click', () => handleConfirm(true));
            confirmCancel.addEventListener('click', () => handleConfirm(false));
            
            // Close modal ketika klik di luar
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'customConfirmModal') {
                    handleConfirm(false);
                }
            });
            
            // Tambah key event untuk ESC
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    handleConfirm(false);
                    document.removeEventListener('keydown', handleKeyDown);
                }
            };
            
            document.addEventListener('keydown', handleKeyDown);
            
            // Hapus event listener ketika modal dihapus
            modal.addEventListener('DOMNodeRemoved', () => {
                document.removeEventListener('keydown', handleKeyDown);
            });
        });
    }

    // ===== BIND WAREHOUSE FORM DIPERBAIKI =====
    
    bindWarehouseForm() {
        const form = document.getElementById('warehouseForm');
        if (form) {
            // Clone form untuk menghapus event listeners lama
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            
            document.getElementById('warehouseForm').addEventListener('submit', (e) => {
                e.preventDefault();
                try {
                    if (this.saveWarehouseData()) {
                        // PERBAIKAN: Pastikan UI di-update setelah save
                        this.updateUI();
                        this.showAlert('Warehouse added successfully!', 'success');
                    }
                } catch (error) {
                    this.showAlert(error.message, 'error');
                }
            });
        }

        const nextBtn = document.getElementById('nextToSupplier');
        if (nextBtn) {
            // Hapus event listener lama
            nextBtn.replaceWith(nextBtn.cloneNode(true));
            const newNextBtn = document.getElementById('nextToSupplier');
            
            newNextBtn.addEventListener('click', () => {
                if (this.setupData.warehouses.length === 0) {
                    this.showAlert('Please add at least one warehouse', 'error');
                    return;
                }
                window.location.hash = '#setup/supplier';
            });
        }
        
        // PERBAIKAN TAMBAHAN: Validasi real-time untuk tombol next
        const warehouseNameInput = document.getElementById('warehouseName');
        if (warehouseNameInput) {
            warehouseNameInput.addEventListener('input', () => {
                // Update tombol add berdasarkan input
                const addBtn = document.querySelector('#warehouseForm button[type="submit"]');
                if (addBtn && warehouseNameInput.value.trim() === '') {
                    addBtn.disabled = true;
                } else if (addBtn) {
                    const warehouseLimit = this.userPlan === 'basic' ? 1 :
                        this.userPlan === 'pro' ? 3 : Infinity;
                    addBtn.disabled = this.setupData.warehouses.length >= warehouseLimit;
                }
            });
        }
    }

    // ===== METHOD UPDATE WAREHOUSE LIST DIPERBAIKI =====
    
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
        
        // PERBAIKAN MASALAH 3: Update tombol next setelah update list
        this.updateNextButton();
    }

    // ===== METHOD BARU: UPDATE NEXT BUTTON =====
    
    updateNextButton() {
        const warehouseNext = document.getElementById('nextToSupplier');
        if (warehouseNext) {
            const hasWarehouses = this.setupData.warehouses.length > 0;
            warehouseNext.disabled = !hasWarehouses;
            console.log(`🔄 updateNextButton: ${hasWarehouses ? 'ENABLED' : 'DISABLED'}`);
        }
    }

    // ===== METHOD RENDER MIGRATE DIPERBAIKI (CSS untuk drop area) =====
    
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
                                    <!-- PERBAIKAN: Tambah style inline untuk drop area -->
                                    <div class="drop-area" id="dropArea" style="
                                        border: 2px dashed #19BEBB;
                                        border-radius: 10px;
                                        padding: 40px 20px;
                                        text-align: center;
                                        margin-bottom: 20px;
                                        cursor: pointer;
                                        transition: all 0.3s;
                                        background: #f8f9fa;
                                    ">
                                        <i class="fas fa-cloud-upload-alt" style="font-size: 48px; color: #19BEBB; margin-bottom: 15px;"></i>
                                        <h4 style="margin: 0 0 10px 0; color: #333;">Drag & Drop Excel File Here</h4>
                                        <p style="color: #666; margin: 0 0 20px 0; font-size: 14px;">or click to browse</p>
                                        <input type="file" id="excelFile" accept=".xlsx, .xls" style="display: none;">
                                        <button type="button" id="browseFileBtn" class="btn-browse">
                                            <i class="fas fa-folder-open"></i> Browse Excel File
                                        </button>
                                    </div>
                                    
                                    <div style="text-align: center;">
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
        
        /* PERBAIKAN: CSS untuk drop area yang lebih baik */
        .drop-area:hover {
            background: #e3f2fd !important;
            border-color: #0fa8a6 !important;
        }
        
        .drop-area.drag-over {
            background: #d1ecf1 !important;
            border-color: #19BEBB !important;
            border-style: solid !important;
        }
        
        .drop-area i.fa-cloud-upload-alt {
            transition: transform 0.3s;
        }
        
        .drop-area:hover i.fa-cloud-upload-alt {
            transform: scale(1.1);
        }
        </style>
        `;
    }

    // ... (sisanya tetap sama)
}

// Create global instance
window.SetupWizardMulti = SetupWizardMulti;
console.log('✅ SetupWizardMulti loaded successfully with final fixes');
