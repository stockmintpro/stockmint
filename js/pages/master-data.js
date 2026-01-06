// MasterDataPage - For Demo Version
class MasterDataPage {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
        this.isDemo = this.user.isDemo || false;
        this.currentPlan = localStorage.getItem('stockmint_plan') || 'demo';
    }
    
    render() {
        return `
        <div class="page-content">
            <h1><i class="fas fa-database"></i> Master Data</h1>
            <p class="page-subtitle">Manage your core business data</p>
            
            ${this.isDemo ? `
            <div class="demo-info-card" style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                <h4 style="color: #856404; margin-top: 0;">
                    <i class="fas fa-info-circle"></i> Demo Mode - Master Data
                </h4>
                <p style="color: #856404; margin: 0;">
                    In demo mode, you can view and manage sample data. Upgrade to BASIC plan to save your own data.
                </p>
            </div>
            ` : ''}
            
            <div class="master-data-grid">
                <!-- Company Card -->
                <div class="data-card">
                    <div class="data-card-header" style="background: #19BEBB;">
                        <i class="fas fa-building"></i>
                        <h3>Company</h3>
                    </div>
                    <div class="data-card-body">
                        ${this.renderCompanyData()}
                        <button onclick="MasterDataPage.editCompany()" class="btn-action">
                            <i class="fas fa-edit"></i> ${this.isDemo ? 'View Sample' : 'Edit'}
                        </button>
                    </div>
                </div>
                
                <!-- Warehouses Card -->
                <div class="data-card">
                    <div class="data-card-header" style="background: #667eea;">
                        <i class="fas fa-warehouse"></i>
                        <h3>Warehouses</h3>
                    </div>
                    <div class="data-card-body">
                        ${this.renderWarehousesData()}
                        <button onclick="MasterDataPage.manageWarehouses()" class="btn-action">
                            <i class="fas fa-list"></i> Manage
                        </button>
                    </div>
                </div>
                
                <!-- Products Card -->
                <div class="data-card">
                    <div class="data-card-header" style="background: #10b981;">
                        <i class="fas fa-boxes"></i>
                        <h3>Products</h3>
                    </div>
                    <div class="data-card-body">
                        ${this.renderProductsData()}
                        <button onclick="MasterDataPage.manageProducts()" class="btn-action">
                            <i class="fas fa-cubes"></i> Manage
                        </button>
                    </div>
                </div>
                
                <!-- Suppliers Card -->
                <div class="data-card">
                    <div class="data-card-header" style="background: #f59e0b;">
                        <i class="fas fa-truck"></i>
                        <h3>Suppliers</h3>
                    </div>
                    <div class="data-card-body">
                        ${this.renderSuppliersData()}
                        <button onclick="MasterDataPage.manageSuppliers()" class="btn-action">
                            <i class="fas fa-handshake"></i> Manage
                        </button>
                    </div>
                </div>
                
                <!-- Customers Card -->
                <div class="data-card">
                    <div class="data-card-header" style="background: #8b5cf6;">
                        <i class="fas fa-users"></i>
                        <h3>Customers</h3>
                    </div>
                    <div class="data-card-body">
                        ${this.renderCustomersData()}
                        <button onclick="MasterDataPage.manageCustomers()" class="btn-action">
                            <i class="fas fa-user-friends"></i> Manage
                        </button>
                    </div>
                </div>
                
                <!-- Categories Card -->
                <div class="data-card">
                    <div class="data-card-header" style="background: #ec4899;">
                        <i class="fas fa-tags"></i>
                        <h3>Categories</h3>
                    </div>
                    <div class="data-card-body">
                        ${this.renderCategoriesData()}
                        <button onclick="MasterDataPage.manageCategories()" class="btn-action">
                            <i class="fas fa-filter"></i> Manage
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            .master-data-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            
            .data-card {
                background: white;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            
            .data-card-header {
                color: white;
                padding: 15px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .data-card-header i {
                font-size: 24px;
            }
            
            .data-card-header h3 {
                margin: 0;
                font-size: 18px;
            }
            
            .data-card-body {
                padding: 20px;
            }
            
            .data-card-body p {
                margin: 0 0 10px 0;
                color: #666;
            }
            
            .btn-action {
                width: 100%;
                padding: 10px;
                background: #f8f9fa;
                border: 1px solid #ddd;
                border-radius: 6px;
                color: #333;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.2s;
            }
            
            .btn-action:hover {
                background: #e9ecef;
                transform: translateY(-2px);
            }
            
            .data-count {
                font-size: 24px;
                font-weight: 700;
                color: #333;
                margin-bottom: 5px;
            }
            
            .data-description {
                font-size: 14px;
                color: #666;
                margin-bottom: 15px;
            }
        </style>
        `;
    }
    
    renderCompanyData() {
        if (this.isDemo) {
            return `
            <div class="data-count">Sample Company</div>
            <div class="data-description">PT. Demo Business Indonesia</div>
            <p><small>Tax ID: 01.234.567.8-912.000</small></p>
            <p><small>Address: Jl. Demo No. 123, Jakarta</small></p>
            `;
        } else {
            const company = JSON.parse(localStorage.getItem('stockmint_company') || '{}');
            return `
            <div class="data-count">${company.name || 'Your Company'}</div>
            <div class="data-description">${company.businessType || 'Business'}</div>
            ${company.taxId ? `<p><small>Tax ID: ${company.taxId}</small></p>` : ''}
            ${company.address ? `<p><small>Address: ${company.address.substring(0, 50)}...</small></p>` : ''}
            `;
        }
    }
    
    renderWarehousesData() {
        const warehouses = this.isDemo ? 
            [{name: 'Main Warehouse', isPrimary: true, code: 'WH-001'}, {name: 'Branch Warehouse', isPrimary: false, code: 'WH-002'}] :
            JSON.parse(localStorage.getItem('stockmint_warehouses') || '[]');
        
        return `
        <div class="data-count">${warehouses.length} Warehouse${warehouses.length !== 1 ? 's' : ''}</div>
        <div class="data-description">
            ${warehouses.length > 0 ? 
                `${warehouses.find(w => w.isPrimary)?.name || warehouses[0]?.name || 'No warehouse'}` : 
                'No warehouses'}
        </div>
        ${warehouses.slice(0, 2).map(wh => `
        <p><small><i class="fas ${wh.isPrimary ? 'fa-star' : 'fa-warehouse'}"></i> ${wh.name}</small></p>
        `).join('')}
        ${warehouses.length > 2 ? `<p><small>+ ${warehouses.length - 2} more...</small></p>` : ''}
        `;
    }
    
    renderProductsData() {
        const products = this.isDemo ? 
            Array.from({length: 25}, (_, i) => ({
                name: `Product ${i+1}`,
                code: `PROD-${String(i+1).padStart(5, '0')}`,
                category: `Category ${(i % 5) + 1}`,
                stock: Math.round(Math.random() * 100) + 10,
                unit: ['pcs', 'box', 'kg'][i % 3]
            })) :
            JSON.parse(localStorage.getItem('stockmint_products') || '[]');
        
        const totalStock = products.reduce((sum, prod) => sum + (prod.stock || 0), 0);
        
        return `
        <div class="data-count">${products.length} Products</div>
        <div class="data-description">Total Stock: ${totalStock} units</div>
        ${products.slice(0, 2).map(prod => `
        <p><small><i class="fas fa-box"></i> ${prod.name} (${prod.stock || 0} ${prod.unit || 'pcs'})</small></p>
        `).join('')}
        ${products.length > 2 ? `<p><small>+ ${products.length - 2} more...</small></p>` : ''}
        `;
    }
    
    renderSuppliersData() {
        const suppliers = this.isDemo ? 
            Array.from({length: 8}, (_, i) => ({
                name: `Supplier ${i+1}`,
                code: `SUP-${String(i+1).padStart(3, '0')}`,
                contact: `Contact ${i+1}`,
                phone: `021-100${i}`
            })) :
            JSON.parse(localStorage.getItem('stockmint_suppliers') || '[]');
        
        return `
        <div class="data-count">${suppliers.length} Suppliers</div>
        <div class="data-description">Business partners</div>
        ${suppliers.slice(0, 2).map(sup => `
        <p><small><i class="fas fa-user-tie"></i> ${sup.name}</small></p>
        `).join('')}
        ${suppliers.length > 2 ? `<p><small>+ ${suppliers.length - 2} more...</small></p>` : ''}
        `;
    }
    
    renderCustomersData() {
        const customers = this.isDemo ? 
            Array.from({length: 15}, (_, i) => ({
                name: `Customer ${i+1}`,
                type: i % 3 === 0 ? 'retail' : (i % 3 === 1 ? 'wholesale' : 'corporate'),
                contact: `Contact ${i+1}`,
                phone: `021-200${i}`
            })) :
            JSON.parse(localStorage.getItem('stockmint_customers') || '[]');
        
        const retailCount = customers.filter(c => c.type === 'retail').length;
        const wholesaleCount = customers.filter(c => c.type === 'wholesale').length;
        const corporateCount = customers.filter(c => c.type === 'corporate').length;
        
        return `
        <div class="data-count">${customers.length} Customers</div>
        <div class="data-description">
            ${retailCount} Retail • ${wholesaleCount} Wholesale • ${corporateCount} Corporate
        </div>
        ${customers.slice(0, 2).map(cust => `
        <p><small><i class="fas fa-user"></i> ${cust.name} (${cust.type})</small></p>
        `).join('')}
        ${customers.length > 2 ? `<p><small>+ ${customers.length - 2} more...</small></p>` : ''}
        `;
    }
    
    renderCategoriesData() {
        const categories = this.isDemo ? 
            Array.from({length: 8}, (_, i) => ({
                name: `Category ${i+1}`,
                code: `CAT-${String(i+1).padStart(3, '0')}`,
                description: `Sample category ${i+1}`
            })) :
            JSON.parse(localStorage.getItem('stockmint_categories') || '[]');
        
        return `
        <div class="data-count">${categories.length} Categories</div>
        <div class="data-description">Product groups</div>
        ${categories.slice(0, 3).map(cat => `
        <p><small><i class="fas fa-tag"></i> ${cat.name}</small></p>
        `).join('')}
        ${categories.length > 3 ? `<p><small>+ ${categories.length - 3} more...</small></p>` : ''}
        `;
    }
    
    static editCompany() {
        alert(this.isDemo ? 
            'In demo mode, you can view sample company data. Upgrade to BASIC plan to edit your own company information.' :
            'Edit company feature would open here in full version.');
    }
    
    static manageWarehouses() {
        if (this.isDemo) {
            alert('Warehouse management is available in BASIC plan. Upgrade to manage multiple warehouses.');
        } else {
            window.location.hash = '#master/warehouses';
        }
    }
    
    static manageProducts() {
        if (this.isDemo) {
            alert('Product management is available in BASIC plan. Upgrade to manage your product inventory.');
        } else {
            window.location.hash = '#master/products';
        }
    }
    
    static manageSuppliers() {
        if (this.isDemo) {
            alert('Supplier management is available in BASIC plan. Upgrade to manage your suppliers.');
        } else {
            window.location.hash = '#master/suppliers';
        }
    }
    
    static manageCustomers() {
        if (this.isDemo) {
            alert('Customer management is available in BASIC plan. Upgrade to manage your customers.');
        } else {
            window.location.hash = '#master/customers';
        }
    }
    
    static manageCategories() {
        if (this.isDemo) {
            alert('Category management is available in BASIC plan. Upgrade to organize your products.');
        } else {
            window.location.hash = '#master/categories';
        }
    }
    
    bindEvents() {
        // Event binding for demo mode
        const user = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
        this.isDemo = user.isDemo || false;
        
        if (this.isDemo) {
            console.log('🔄 Binding events for demo master data page');
        }
    }
}

// Export
window.MasterDataPage = MasterDataPage;
