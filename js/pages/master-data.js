// master-data.js - Master Data Dashboard dengan semua sub menu

class MasterDataPage {
    constructor() {
        console.log('📊 MasterDataPage initialized');
    }

    render() {
        const menuItems = window.StockMintMenu?.items?.find(item => item.id === 'master-data')?.children || [];
        
        return `
        <div class="page-content">
            <div class="page-header">
                <h1><i class="fas fa-database"></i> Master Data</h1>
                <p class="page-subtitle">Manage all your business data in one place</p>
            </div>
            
            <!-- Statistics Cards -->
            <div class="stats-cards" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0 30px 0;">
                <div class="stat-card" style="background: #dbeafe; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; color: #1e40af; margin-bottom: 5px;">
                        <i class="fas fa-building"></i>
                    </div>
                    <div style="font-size: 28px; font-weight: bold; color: #1e40af;" id="companyCount">1</div>
                    <div style="color: #4b5563; font-size: 14px;">Companies</div>
                </div>
                
                <div class="stat-card" style="background: #dcfce7; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; color: #065f46; margin-bottom: 5px;">
                        <i class="fas fa-warehouse"></i>
                    </div>
                    <div style="font-size: 28px; font-weight: bold; color: #065f46;" id="warehouseCount">0</div>
                    <div style="color: #4b5563; font-size: 14px;">Warehouses</div>
                </div>
                
                <div class="stat-card" style="background: #fef3c7; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; color: #92400e; margin-bottom: 5px;">
                        <i class="fas fa-truck"></i>
                    </div>
                    <div style="font-size: 28px; font-weight: bold; color: #92400e;" id="supplierCount">0</div>
                    <div style="color: #4b5563; font-size: 14px;">Suppliers</div>
                </div>
                
                <div class="stat-card" style="background: #f3e8ff; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; color: #5b21b6; margin-bottom: 5px;">
                        <i class="fas fa-users"></i>
                    </div>
                    <div style="font-size: 28px; font-weight: bold; color: #5b21b6;" id="customerCount">0</div>
                    <div style="color: #4b5563; font-size: 14px;">Customers</div>
                </div>
            </div>
            
            <!-- Main Grid of Master Data Sections -->
            <div class="master-data-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px;">
                <!-- Company Card -->
                <div class="card" style="background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);">
                    <div class="card-header">
                        <h3><i class="fas fa-building"></i> Company</h3>
                        <p>Manage your company information</p>
                    </div>
                    <div class="card-body">
                        <div id="companyPreview">Loading...</div>
                        <div style="margin-top: 15px;">
                            <a href="#master/company" class="btn-primary" style="display: inline-block; text-decoration: none;">
                                <i class="fas fa-edit"></i> Edit Company
                            </a>
                        </div>
                    </div>
                </div>
                
                <!-- Warehouses Card -->
                <div class="card" style="background: linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%);">
                    <div class="card-header">
                        <h3><i class="fas fa-warehouse"></i> Warehouses</h3>
                        <p>Manage storage locations</p>
                    </div>
                    <div class="card-body">
                        <div id="warehousesPreview">Loading...</div>
                        <div style="margin-top: 15px;">
                            <a href="#master/warehouses" class="btn-primary" style="display: inline-block; text-decoration: none;">
                                <i class="fas fa-list"></i> View All
                            </a>
                            <a href="#master/warehouses?action=add" class="btn-secondary" style="display: inline-block; text-decoration: none; margin-left: 10px;">
                                <i class="fas fa-plus"></i> Add New
                            </a>
                        </div>
                    </div>
                </div>
                
                <!-- Suppliers Card -->
                <div class="card" style="background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%);">
                    <div class="card-header">
                        <h3><i class="fas fa-truck"></i> Suppliers</h3>
                        <p>Manage your suppliers</p>
                    </div>
                    <div class="card-body">
                        <div id="suppliersPreview">Loading...</div>
                        <div style="margin-top: 15px;">
                            <a href="#master/suppliers" class="btn-primary" style="display: inline-block; text-decoration: none;">
                                <i class="fas fa-list"></i> View All
                            </a>
                            <a href="#master/suppliers?action=add" class="btn-secondary" style="display: inline-block; text-decoration: none; margin-left: 10px;">
                                <i class="fas fa-plus"></i> Add New
                            </a>
                        </div>
                    </div>
                </div>
                
                <!-- Customers Card -->
                <div class="card" style="background: linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%);">
                    <div class="card-header">
                        <h3><i class="fas fa-users"></i> Customers</h3>
                        <p>Manage your customers</p>
                    </div>
                    <div class="card-body">
                        <div id="customersPreview">Loading...</div>
                        <div style="margin-top: 15px;">
                            <a href="#master/customers" class="btn-primary" style="display: inline-block; text-decoration: none;">
                                <i class="fas fa-list"></i> View All
                            </a>
                            <a href="#master/customers?action=add" class="btn-secondary" style="display: inline-block; text-decoration: none; margin-left: 10px;">
                                <i class="fas fa-plus"></i> Add New
                            </a>
                        </div>
                    </div>
                </div>
                
                <!-- Products Card -->
                <div class="card" style="background: linear-gradient(135deg, #fce7f3 0%, #fdf2f8 100%);">
                    <div class="card-header">
                        <h3><i class="fas fa-boxes"></i> Products</h3>
                        <p>Manage your products</p>
                    </div>
                    <div class="card-body">
                        <div id="productsPreview">Loading...</div>
                        <div style="margin-top: 15px;">
                            <a href="#master/products" class="btn-primary" style="display: inline-block; text-decoration: none;">
                                <i class="fas fa-list"></i> View All
                            </a>
                            <a href="#master/products?action=add" class="btn-secondary" style="display: inline-block; text-decoration: none; margin-left: 10px;">
                                <i class="fas fa-plus"></i> Add New
                            </a>
                        </div>
                    </div>
                </div>
                
                <!-- Categories Card -->
                <div class="card" style="background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);">
                    <div class="card-header">
                        <h3><i class="fas fa-tags"></i> Categories</h3>
                        <p>Manage product categories</p>
                    </div>
                    <div class="card-body">
                        <div id="categoriesPreview">Loading...</div>
                        <div style="margin-top: 15px;">
                            <a href="#master/categories" class="btn-primary" style="display: inline-block; text-decoration: none;">
                                <i class="fas fa-list"></i> View All
                            </a>
                            <a href="#master/categories?action=add" class="btn-secondary" style="display: inline-block; text-decoration: none; margin-left: 10px;">
                                <i class="fas fa-plus"></i> Add New
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Reset Data Section -->
            <div class="card" style="margin-top: 30px; border: 2px solid #fee2e2; background: #fef2f2;">
                <div class="card-header" style="border-bottom: 1px solid #fee2e2;">
                    <h3><i class="fas fa-exclamation-triangle" style="color: #dc2626;"></i> Danger Zone</h3>
                    <p>These actions are irreversible. Proceed with caution.</p>
                </div>
                <div class="card-body">
                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
                        <div>
                            <h4 style="margin: 0 0 10px 0; color: #dc2626;">Reset All Data</h4>
                            <p style="margin: 0; color: #666; max-width: 500px;">
                                This will delete ALL your data including company, warehouses, suppliers, customers, categories, products, and transaction history. This action cannot be undone.
                            </p>
                        </div>
                        <button id="resetDataBtn" class="btn-danger" style="
                            background: #dc2626;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 6px;
                            font-weight: 600;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            transition: background 0.2s;
                        ">
                            <i class="fas fa-trash-alt"></i> Reset All Data
                        </button>
                    </div>
                    
                    <!-- Backup & Restore -->
                    <div style="margin-top: 25px; padding-top: 25px; border-top: 1px solid #fee2e2;">
                        <h4 style="margin: 0 0 15px 0; color: #333;">Data Management</h4>
                        <div style="display: flex; gap: 15px;">
                            <button id="backupDataBtn" class="btn-secondary" style="
                                background: #6c757d;
                                color: white;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 6px;
                                font-weight: 600;
                                cursor: pointer;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                            ">
                                <i class="fas fa-download"></i> Backup Data
                            </button>
                            <button id="importDataBtn" class="btn-secondary" style="
                                background: #6c757d;
                                color: white;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 6px;
                                font-weight: 600;
                                cursor: pointer;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                            ">
                                <i class="fas fa-upload"></i> Import Data
                            </button>
                            <a href="#setup/migrate" class="btn-primary" style="
                                background: #19BEBB;
                                color: white;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 6px;
                                font-weight: 600;
                                cursor: pointer;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                text-decoration: none;
                            ">
                                <i class="fas fa-file-excel"></i> Excel Migration
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Setup Wizard Link -->
            <div class="card" style="margin-top: 20px; background: #f0f9ff; border: 1px solid #bae6fd;">
                <div class="card-body" style="text-align: center;">
                    <h4><i class="fas fa-magic" style="color: #0ea5e9;"></i> Need help setting up?</h4>
                    <p>Use our setup wizard to guide you through the initial configuration.</p>
                    <a href="#setup/start-new" class="btn-primary" style="
                        background: #0ea5e9;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        font-weight: 600;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        text-decoration: none;
                    ">
                        <i class="fas fa-wand-magic-sparkles"></i> Launch Setup Wizard
                    </a>
                </div>
            </div>
        </div>
        
        <style>
        .card {
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .card-header {
            padding: 15px 20px;
            border-bottom: 1px solid #eee;
        }
        
        .card-header h3 {
            margin: 0;
            font-size: 18px;
            color: #333;
        }
        
        .card-header p {
            margin: 5px 0 0 0;
            color: #666;
            font-size: 14px;
        }
        
        .card-body {
            padding: 20px;
        }
        
        .btn-primary, .btn-secondary, .btn-danger {
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            text-decoration: none;
        }
        
        .btn-primary {
            background: #19BEBB;
            color: white;
        }
        
        .btn-primary:hover {
            background: #0fa8a6;
        }
        
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        
        .btn-secondary:hover {
            background: #5a6268;
        }
        
        .btn-danger {
            background: #dc2626;
            color: white;
        }
        
        .btn-danger:hover {
            background: #b91c1c;
        }
        
        #resetDataBtn:hover {
            background: #b91c1c;
        }
        </style>
        `;
    }

    bindEvents() {
        // Load data and update previews
        this.updateDataPreviews();
        
        // Bind reset button
        const resetBtn = document.getElementById('resetDataBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', async () => {
                const confirmed = await this.showResetConfirmation();
                if (confirmed) {
                    await this.resetAllData();
                }
            });
        }
        
        // Bind backup button
        const backupBtn = document.getElementById('backupDataBtn');
        if (backupBtn) {
            backupBtn.addEventListener('click', () => {
                this.backupData();
            });
        }
        
        // Bind import button
        const importBtn = document.getElementById('importDataBtn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                this.importData();
            });
        }
    }

    updateDataPreviews() {
        try {
            // Load data from localStorage
            const company = JSON.parse(localStorage.getItem('stockmint_company') || '{}');
            const warehouses = JSON.parse(localStorage.getItem('stockmint_warehouses') || '[]');
            const suppliers = JSON.parse(localStorage.getItem('stockmint_suppliers') || '[]');
            const customers = JSON.parse(localStorage.getItem('stockmint_customers') || '[]');
            const categories = JSON.parse(localStorage.getItem('stockmint_categories') || '[]');
            const products = JSON.parse(localStorage.getItem('stockmint_products') || '[]');
            
            // Update statistics
            document.getElementById('companyCount').textContent = company.name ? 1 : 0;
            document.getElementById('warehouseCount').textContent = warehouses.length;
            document.getElementById('supplierCount').textContent = suppliers.length;
            document.getElementById('customerCount').textContent = customers.length;
            
            // Update previews
            document.getElementById('companyPreview').innerHTML = company.name ? `
                <div style="font-weight: 600; font-size: 16px; color: #1e40af;">${company.name}</div>
                ${company.taxId ? `<div style="font-size: 14px; color: #666;">NPWP: ${company.taxId}</div>` : ''}
                ${company.phone ? `<div style="font-size: 14px; color: #666;">Phone: ${company.phone}</div>` : ''}
                ${company.email ? `<div style="font-size: 14px; color: #666;">Email: ${company.email}</div>` : ''}
            ` : '<div style="color: #ef4444; font-style: italic;">No company data</div>';
            
            document.getElementById('warehousesPreview').innerHTML = warehouses.length > 0 ? `
                <div style="margin-bottom: 10px;">
                    <div style="font-weight: 600; color: #065f46;">Total: ${warehouses.length} warehouse(s)</div>
                    ${warehouses.slice(0, 2).map(wh => `
                        <div style="font-size: 14px; margin-top: 5px; padding-left: 10px; border-left: 3px solid #10b981;">
                            <strong>${wh.name}</strong>${wh.isPrimary ? ' <span style="background: #10b981; color: white; padding: 1px 5px; border-radius: 3px; font-size: 12px;">Primary</span>' : ''}
                        </div>
                    `).join('')}
                    ${warehouses.length > 2 ? `<div style="font-size: 12px; color: #666; margin-top: 5px;">+ ${warehouses.length - 2} more...</div>` : ''}
                </div>
            ` : '<div style="color: #ef4444; font-style: italic;">No warehouses</div>';
            
            document.getElementById('suppliersPreview').innerHTML = suppliers.length > 0 ? `
                <div style="margin-bottom: 10px;">
                    <div style="font-weight: 600; color: #92400e;">Total: ${suppliers.length} supplier(s)</div>
                    ${suppliers.slice(0, 2).map(sup => `
                        <div style="font-size: 14px; margin-top: 5px; padding-left: 10px; border-left: 3px solid #f59e0b;">
                            <strong>${sup.name}</strong><br>
                            <small>${sup.phone || 'No phone'}</small>
                        </div>
                    `).join('')}
                    ${suppliers.length > 2 ? `<div style="font-size: 12px; color: #666; margin-top: 5px;">+ ${suppliers.length - 2} more...</div>` : ''}
                </div>
            ` : '<div style="color: #ef4444; font-style: italic;">No suppliers</div>';
            
            document.getElementById('customersPreview').innerHTML = customers.length > 0 ? `
                <div style="margin-bottom: 10px;">
                    <div style="font-weight: 600; color: #5b21b6;">Total: ${customers.length} customer(s)</div>
                    ${customers.slice(0, 2).map(cust => `
                        <div style="font-size: 14px; margin-top: 5px; padding-left: 10px; border-left: 3px solid #8b5cf6;">
                            <strong>${cust.name}</strong><br>
                            <small style="text-transform: capitalize;">${cust.type} • ${cust.taxable ? 'Taxable' : 'Non-taxable'}</small>
                        </div>
                    `).join('')}
                    ${customers.length > 2 ? `<div style="font-size: 12px; color: #666; margin-top: 5px;">+ ${customers.length - 2} more...</div>` : ''}
                </div>
            ` : '<div style="color: #ef4444; font-style: italic;">No customers</div>';
            
            document.getElementById('productsPreview').innerHTML = products.length > 0 ? `
                <div style="margin-bottom: 10px;">
                    <div style="font-weight: 600; color: #be185d;">Total: ${products.length} product(s)</div>
                    ${products.slice(0, 2).map(prod => `
                        <div style="font-size: 14px; margin-top: 5px; padding-left: 10px; border-left: 3px solid #ec4899;">
                            <strong>${prod.name}</strong><br>
                            <small>Rp ${Number(prod.salePrice || 0).toLocaleString()} • Stock: ${prod.stock || 0}</small>
                        </div>
                    `).join('')}
                    ${products.length > 2 ? `<div style="font-size: 12px; color: #666; margin-top: 5px;">+ ${products.length - 2} more...</div>` : ''}
                </div>
            ` : '<div style="color: #ef4444; font-style: italic;">No products</div>';
            
            document.getElementById('categoriesPreview').innerHTML = categories.length > 0 ? `
                <div style="margin-bottom: 10px;">
                    <div style="font-weight: 600; color: #0e7490;">Total: ${categories.length} category(ies)</div>
                    ${categories.slice(0, 3).map(cat => `
                        <span style="display: inline-block; background: #e0f2fe; color: #0e7490; padding: 3px 8px; border-radius: 4px; margin: 2px; font-size: 13px;">
                            ${cat.name}
                        </span>
                    `).join('')}
                    ${categories.length > 3 ? `<div style="font-size: 12px; color: #666; margin-top: 5px;">+ ${categories.length - 3} more...</div>` : ''}
                </div>
            ` : '<div style="color: #ef4444; font-style: italic;">No categories</div>';
            
        } catch (error) {
            console.error('Error updating data previews:', error);
        }
    }

    showResetConfirmation() {
        return new Promise((resolve) => {
            const modalHTML = `
                <div id="resetConfirmModal" style="
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
                ">
                    <div style="
                        background: white;
                        border-radius: 10px;
                        padding: 30px;
                        max-width: 500px;
                        width: 90%;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    ">
                        <div style="text-align: center; margin-bottom: 25px;">
                            <div style="font-size: 48px; color: #ef4444; margin-bottom: 15px;">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <h3 style="margin: 0 0 15px 0; color: #333;">Reset All Data?</h3>
                            <p style="color: #666; margin: 0; line-height: 1.6;">
                                This action will delete ALL your data including:<br>
                                • Company information<br>
                                • Warehouses<br>
                                • Suppliers<br>
                                • Customers<br>
                                • Categories<br>
                                • Products<br>
                                • Transaction history<br><br>
                                <strong style="color: #ef4444;">This action cannot be undone!</strong>
                            </p>
                        </div>
                        <div style="display: flex; gap: 15px; justify-content: center;">
                            <button id="resetCancel" style="
                                background: #6c757d;
                                color: white;
                                border: none;
                                padding: 12px 24px;
                                border-radius: 6px;
                                font-weight: 600;
                                cursor: pointer;
                                flex: 1;
                                transition: background 0.2s;
                            ">
                                Cancel
                            </button>
                            <button id="resetConfirm" style="
                                background: #ef4444;
                                color: white;
                                border: none;
                                padding: 12px 24px;
                                border-radius: 6px;
                                font-weight: 600;
                                cursor: pointer;
                                flex: 1;
                                transition: background 0.2s;
                            ">
                                Yes, Reset All Data
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            const modal = document.getElementById('resetConfirmModal');
            const confirmBtn = document.getElementById('resetConfirm');
            const cancelBtn = document.getElementById('resetCancel');
            
            const cleanup = () => {
                if (modal && modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            };
            
            confirmBtn.addEventListener('click', () => {
                cleanup();
                resolve(true);
            });
            
            cancelBtn.addEventListener('click', () => {
                cleanup();
                resolve(false);
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'resetConfirmModal') {
                    cleanup();
                    resolve(false);
                }
            });
        });
    }

    async resetAllData() {
      try {
        // Show confirmation
        const confirmed = await this.showResetConfirmation();
        if (!confirmed) return;
    
        // 1. Reset Google Sheets (clear data but keep file)
        try {
          if (window.GoogleSheetsService && window.GoogleSheetsService.isReady()) {
            this.showAlert('Clearing Google Sheets data...', 'info');
            await window.GoogleSheetsService.resetAllData();
          }
        } catch (sheetsError) {
          console.error('Google Sheets reset failed:', sheetsError);
        // Continue with local reset anyway
        }
    
        // 2. Clear localStorage (except auth and spreadsheet info)
        const preserveKeys = [
          'stockmint_user',
          'stockmint_token',
          'stockmint_spreadsheet_id', 
          'stockmint_spreadsheet_url',
          'stockmint_has_sheets_access',
          'stockmint_plan'
        ];
    
        const backup = {};
        preserveKeys.forEach(key => {
          const value = localStorage.getItem(key);
          if (value) backup[key] = value;
        });
    
        // Clear all stockmint data
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('stockmint_')) {
            localStorage.removeItem(key);
          }
        });
    
        // Restore preserved data
        Object.entries(backup).forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
    
        // 3. Clear session storage
        sessionStorage.clear();
    
        // 4. Show success
        this.showAlert('✅ All data has been reset! Google Sheets cleared.', 'success');
    
        // 5. Update UI
        setTimeout(() => {
          this.updateDataPreviews();
          this.showAlert('You can now start fresh setup.', 'info');
        }, 1000);
    
        return true;
    
      } catch (error) {
        console.error('Error resetting data:', error);
        this.showAlert('Failed to reset data: ' + error.message, 'error');
        return false;
      }
    }
    
    backupData() {
        try {
            // Collect all data
            const backupData = {
                timestamp: new Date().toISOString(),
                version: '1.0',
                data: {
                    company: JSON.parse(localStorage.getItem('stockmint_company') || '{}'),
                    warehouses: JSON.parse(localStorage.getItem('stockmint_warehouses') || '[]'),
                    suppliers: JSON.parse(localStorage.getItem('stockmint_suppliers') || '[]'),
                    customers: JSON.parse(localStorage.getItem('stockmint_customers') || '[]'),
                    categories: JSON.parse(localStorage.getItem('stockmint_categories') || '[]'),
                    products: JSON.parse(localStorage.getItem('stockmint_products') || '[]')
                }
            };
            
            // Create download link
            const dataStr = JSON.stringify(backupData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `stockmint-backup-${new Date().toISOString().split('T')[0]}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            this.showAlert('✅ Backup created successfully!', 'success');
            
        } catch (error) {
            console.error('Error creating backup:', error);
            this.showAlert('Failed to create backup: ' + error.message, 'error');
        }
    }

    importData() {
        // Create file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const backupData = JSON.parse(event.target.result);
                    
                    // Validate backup format
                    if (!backupData.data) {
                        throw new Error('Invalid backup file format');
                    }
                    
                    // Restore data
                    if (backupData.data.company) {
                        localStorage.setItem('stockmint_company', JSON.stringify(backupData.data.company));
                    }
                    if (backupData.data.warehouses) {
                        localStorage.setItem('stockmint_warehouses', JSON.stringify(backupData.data.warehouses));
                    }
                    if (backupData.data.suppliers) {
                        localStorage.setItem('stockmint_suppliers', JSON.stringify(backupData.data.suppliers));
                    }
                    if (backupData.data.customers) {
                        localStorage.setItem('stockmint_customers', JSON.stringify(backupData.data.customers));
                    }
                    if (backupData.data.categories) {
                        localStorage.setItem('stockmint_categories', JSON.stringify(backupData.data.categories));
                    }
                    if (backupData.data.products) {
                        localStorage.setItem('stockmint_products', JSON.stringify(backupData.data.products));
                    }
                    
                    localStorage.setItem('stockmint_setup_completed', 'true');
                    
                    this.showAlert('✅ Data imported successfully!', 'success');
                    setTimeout(() => {
                        this.updateDataPreviews();
                    }, 500);
                    
                } catch (error) {
                    console.error('Error importing backup:', error);
                    this.showAlert('Failed to import backup: ' + error.message, 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
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
}

// Register globally
if (typeof window !== 'undefined') {
    window.MasterDataPage = MasterDataPage;
    console.log('✅ MasterDataPage loaded');
}
