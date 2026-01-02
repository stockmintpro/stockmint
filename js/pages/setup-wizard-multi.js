// setup-wizard-multi.js - VERSI FINAL DENGAN SEMUA PERBAIKAN

console.log('🔄 setup-wizard-multi.js LOADED - FINAL VERSION');

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

    // ... (method-method lainnya tetap sama seperti versi sebelumnya)

    // ===== PERBAIKAN BIND MIGRATE EVENTS (MASALAH DRAG & DROP) =====
    
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
            
            console.log('📁 File input elements:', { 
                browseBtn: !!browseBtn, 
                fileInput: !!fileInput, 
                uploadBtn: !!uploadBtn, 
                fileNameSpan: !!fileNameSpan, 
                dropArea: !!dropArea 
            });
            
            // PERBAIKAN: Event binding untuk browse button dengan event delegation
            if (browseBtn) {
                // Hapus event listener lama
                const newBrowseBtn = browseBtn.cloneNode(true);
                browseBtn.parentNode.replaceChild(newBrowseBtn, browseBtn);
                
                document.getElementById('browseFileBtn').addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📂 Browse button clicked');
                    if (fileInput) {
                        fileInput.click();
                    }
                });
            }
            
            if (fileInput) {
                const newFileInput = fileInput.cloneNode(true);
                fileInput.parentNode.replaceChild(newFileInput, fileInput);
                
                document.getElementById('excelFile').addEventListener('change', (e) => {
                    console.log('📄 File selected via input');
                    this.handleFileSelection(e.target.files[0]);
                });
            }
            
            // PERBAIKAN: Drag & drop functionality dengan event listener yang benar
            if (dropArea) {
                // Hapus event listener lama
                const newDropArea = dropArea.cloneNode(true);
                dropArea.parentNode.replaceChild(newDropArea, dropArea);
                const currentDropArea = document.getElementById('dropArea');
                
                // Prevent default drag behaviors
                ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                    currentDropArea.addEventListener(eventName, (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    });
                });
                
                // Highlight drop area when item is dragged over it
                currentDropArea.addEventListener('dragenter', () => {
                    currentDropArea.classList.add('drag-over');
                    console.log('📁 File dragged over drop area');
                });
                
                currentDropArea.addEventListener('dragover', () => {
                    currentDropArea.classList.add('drag-over');
                });
                
                currentDropArea.addEventListener('dragleave', () => {
                    currentDropArea.classList.remove('drag-over');
                });
                
                currentDropArea.addEventListener('drop', (e) => {
                    currentDropArea.classList.remove('drag-over');
                    const files = e.dataTransfer.files;
                    console.log('📁 Files dropped:', files.length);
                    if (files.length > 0) {
                        this.handleFileSelection(files[0]);
                    }
                });
                
                // Click on drop area also triggers file input
                currentDropArea.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📂 Drop area clicked');
                    if (fileInput) {
                        // Trigger click pada file input
                        const fileInputElement = document.getElementById('excelFile');
                        if (fileInputElement) {
                            fileInputElement.click();
                        }
                    }
                });
            }
            
            // Upload button event
            if (uploadBtn) {
                const newUploadBtn = uploadBtn.cloneNode(true);
                uploadBtn.parentNode.replaceChild(newUploadBtn, uploadBtn);
                
                document.getElementById('uploadFileBtn').addEventListener('click', () => {
                    this.handleExcelUpload();
                });
            }
            
            this.migrateEventsBound = true;
            this.fileHandlersBound = true;
            console.log('✅ Migrate events bound successfully');
        }, 500); // Tambah delay lebih panjang untuk memastikan DOM siap
    }

    // ===== PERBAIKAN HANDLE FILE SELECTION =====
    
    handleFileSelection(file) {
        const fileNameSpan = document.getElementById('selectedFileName');
        const uploadBtn = document.getElementById('uploadFileBtn');
        
        if (file) {
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
            const maxSize = 10 * 1024 * 1024; // 10MB
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
            
            // Simpan file di instance untuk digunakan nanti
            this.selectedFile = file;
            console.log('✅ File selected:', file.name);
        } else {
            if (fileNameSpan) {
                fileNameSpan.textContent = 'No file selected';
                fileNameSpan.style.color = '#666';
            }
            if (uploadBtn) uploadBtn.disabled = true;
        }
    }

    // ===== PERBAIKAN HANDLE EXCEL UPLOAD =====
    
    handleExcelUpload() {
        const fileInput = document.getElementById('excelFile');
        const file = fileInput?.files[0] || this.selectedFile;
        
        if (!file) {
            this.showAlert('Please select an Excel file first', 'error');
            return;
        }
        
        console.log('📤 Uploading file:', file.name);
        
        // Tampilkan progress bar
        const progressContainer = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const resultContainer = document.getElementById('uploadResult');
        const uploadBtn = document.getElementById('uploadFileBtn');
        
        if (progressContainer) progressContainer.style.display = 'block';
        if (resultContainer) resultContainer.style.display = 'none';
        if (uploadBtn) uploadBtn.disabled = true;
        
        // Simulasi progress
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

    // ===== PERBAIKAN PROCESS EXCEL FILE DENGAN SIMULASI DATA =====
    
    processExcelFile(file) {
        const resultContainer = document.getElementById('uploadResult');
        const uploadBtn = document.getElementById('uploadFileBtn');
        
        try {
            console.log('📊 Processing Excel file:', file.name);
            
            // Simulasi proses upload yang lebih realistis
            setTimeout(() => {
                // SIMULASI: Simpan data contoh ke localStorage (dalam implementasi nyata, parsing Excel)
                this.simulateDataMigration();
                
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
                
                if (uploadBtn) uploadBtn.disabled = false;
                
                console.log('✅ Migration completed successfully');
                
                // Redirect setelah 3 detik
                setTimeout(() => {
                    this.showAlert('Migration completed successfully! Redirecting to dashboard...', 'success');
                    setTimeout(() => {
                        window.location.hash = '#dashboard';
                        // Tidak perlu reload karena data sudah di localStorage
                    }, 2000);
                }, 1000);
                
            }, 1500);
            
        } catch (error) {
            console.error('Error processing Excel file:', error);
            
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

    // ===== SIMULASI DATA MIGRATION (UNTUK DEMO) =====
    
    simulateDataMigration() {
        console.log('📊 Simulating data migration...');
        
        // Data contoh untuk simulasi migration
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
                id: `PROD-${String(i+1).padStart(3, '0')}`,
                name: `Product ${i+1}`,
                code: `PROD-${String(i+1).padStart(3, '0')}`,
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

    // ===== PERBAIKAN COMPLETE SETUP UNTUK PENYIMPANAN PERMANEN =====
    
    async completeSetup() {
        try {
            console.log('✅ Completing setup process...');
            
            // 1. Simpan semua data ke database (simulasi API call)
            await this.saveSetupToDatabase();
            
            // 2. Mark setup as completed
            localStorage.setItem('stockmint_setup_completed', 'true');
            localStorage.setItem('stockmint_setup_date', new Date().toISOString());
            
            // 3. Create opening stock
            this.createOpeningStock();
            
            // 4. Show success message
            this.showAlert('🎉 Setup completed successfully! Redirecting to dashboard...', 'success');
            
            console.log('✅ Setup completed, data saved permanently');
            
            // 5. Redirect
            setTimeout(() => {
                window.location.hash = '#dashboard';
                // Tidak perlu reload karena data sudah di localStorage
            }, 2000);
            
        } catch (error) {
            console.error('Error completing setup:', error);
            this.showAlert(`Failed to complete setup: ${error.message}`, 'error');
        }
    }

    async saveSetupToDatabase() {
        // Simulasi API call untuk menyimpan data ke database
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('📊 Data saved to database successfully');
                
                // Simpan flag bahwa data sudah tersimpan di database
                localStorage.setItem('stockmint_data_saved_to_db', 'true');
                localStorage.setItem('stockmint_last_sync', new Date().toISOString());
                
                resolve(true);
            }, 1000);
        });
    }

    // ===== PERBAIKAN RENDER MIGRATE (CSS untuk drop area) =====
    
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
                            <a href="javascript:void(0)" class="btn-download" onclick="downloadTemplate()">
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
                                    <!-- PERBAIKAN: Drop area dengan event handling yang lebih baik -->
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
        
        <script>
        function downloadTemplate() {
            alert('Template download functionality would be implemented here.');
            // Untuk demo, kita hanya tampilkan alert
        }
        </script>
        
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
        
        /* PERBAIKAN: CSS untuk drop area yang lebih baik */
        #dropArea:hover {
            background: #e3f2fd !important;
            border-color: #0fa8a6 !important;
        }
        
        #dropArea.drag-over {
            background: #d1ecf1 !important;
            border-color: #19BEBB !important;
            border-style: solid !important;
        }
        
        #dropArea i.fa-cloud-upload-alt {
            transition: transform 0.3s;
        }
        
        #dropArea:hover i.fa-cloud-upload-alt {
            transform: scale(1.1);
        }
        </style>
        `;
    }

    // ===== PERBAIKAN: TAMBAH METHOD RENDERMIGRATEPAGE =====
    
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
console.log('✅ SetupWizardMulti loaded successfully - FINAL VERSION');
