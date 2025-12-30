// setup-wizard.js - Simplified version for app.js integration
class SetupWizard {
    constructor() {
        this.currentStep = parseInt(localStorage.getItem('stockmint_setup_current_step')) || 1;
        this.totalSteps = 6;
        this.setupData = {};
        this.loadSavedData();
    }

    loadSavedData() {
        // Load temporary setup data
        const tempData = localStorage.getItem('stockmint_setup_temp');
        if (tempData) {
            this.setupData = JSON.parse(tempData);
        }
    }

    render() {
        // This method will be called by app.js
        return `
            <div class="page-content">
                <h1>🚀 First-Time Setup Wizard</h1>
                <p class="page-subtitle">Step ${this.currentStep} of ${this.totalSteps}: ${this.getStepTitle()}</p>
                
                <!-- Simple progress bar -->
                <div style="margin: 20px 0 30px 0;">
                    <div style="height: 6px; background: #e9ecef; border-radius: 3px; overflow: hidden;">
                        <div style="height: 100%; width: ${(this.currentStep/this.totalSteps)*100}%; background: #19BEBB; border-radius: 3px; transition: width 0.3s ease;"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 12px; color: #666;">
                        <span>Company</span>
                        <span>Warehouse</span>
                        <span>Supplier</span>
                        <span>Customer</span>
                        <span>Category</span>
                        <span>Product</span>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-${this.getStepIcon()}"></i> ${this.getStepTitle()}</h3>
                        <p>${this.getStepDescription()}</p>
                    </div>
                    <div class="card-body">
                        ${this.renderCurrentStep()}
                        
                        <div class="setup-navigation" style="display: flex; justify-content: space-between; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                            <div>
                                ${this.currentStep > 1 ? `
                                    <button type="button" class="btn-secondary" id="prevStepBtn">
                                        <i class="fas fa-arrow-left"></i> Previous
                                    </button>
                                ` : ''}
                            </div>
                            <div>
                                <button type="button" class="btn-secondary" onclick="window.location.hash='#dashboard'">
                                    <i class="fas fa-times"></i> Cancel
                                </button>
                                ${this.currentStep < this.totalSteps ? `
                                    <button type="button" class="btn-primary" id="nextStepBtn" style="margin-left: 10px;">
                                        Continue <i class="fas fa-arrow-right"></i>
                                    </button>
                                ` : `
                                    <button type="button" class="btn-success" id="completeSetupBtn" style="margin-left: 10px;">
                                        <i class="fas fa-check-circle"></i> Finish Setup
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #19BEBB;">
                    <h4><i class="fas fa-lightbulb"></i> Setup Tip:</h4>
                    <p>${this.getStepTips()}</p>
                </div>
            </div>
        `;
    }

    getStepIcon() {
        const icons = ['building', 'warehouse', 'truck', 'users', 'tags', 'box'];
        return icons[this.currentStep - 1] || 'check-circle';
    }

    getStepTitle() {
        const titles = [
            'Company Information',
            'Warehouse Setup',
            'Supplier Information',
            'Customer Information',
            'Product Category',
            'Add First Product'
        ];
        return titles[this.currentStep - 1] || 'Setup Complete';
    }

    getStepDescription() {
        const descriptions = [
            'Tell us about your business',
            'Where do you store your inventory?',
            'Who supplies your products?',
            'Who are your customers?',
            'How do you categorize products?',
            'Add your first product to inventory'
        ];
        return descriptions[this.currentStep - 1] || '';
    }

    getStepTips() {
        const tips = [
            'Your company information will appear on invoices and reports.',
            'You can add more warehouses later from the Master Data menu.',
            'Add your main supplier. You can add more suppliers later.',
            'Add your main customer. You can add more customers later.',
            'Create categories to organize your products effectively.',
            'This will be your first inventory item. You can add more products later.'
        ];
        return tips[this.currentStep - 1] || '';
    }

    renderCurrentStep() {
        const steps = [
            this.renderStepCompany,
            this.renderStepWarehouse,
            this.renderStepSupplier,
            this.renderStepCustomer,
            this.renderStepCategory,
            this.renderStepProduct
        ];
        
        return steps[this.currentStep - 1] ? steps[this.currentStep - 1]() : '<p>Invalid step</p>';
    }

    renderStepCompany() {
        const data = this.setupData.company || {};
        return `
            <form id="stepForm">
                <div style="margin-bottom: 15px;">
                    <label>Company Name *</label>
                    <input type="text" id="companyName" class="form-control" required value="${data.name || ''}" placeholder="Enter company name">
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label>Address</label>
                    <textarea id="companyAddress" class="form-control" rows="2" placeholder="Company address">${data.address || ''}</textarea>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div>
                        <label>Phone</label>
                        <input type="tel" id="companyPhone" class="form-control" value="${data.phone || ''}" placeholder="Phone number">
                    </div>
                    <div>
                        <label>Email</label>
                        <input type="email" id="companyEmail" class="form-control" value="${data.email || ''}" placeholder="Email address">
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label>Business Type</label>
                    <select id="businessType" class="form-control">
                        <option value="">Select business type</option>
                        <option value="retail" ${data.businessType === 'retail' ? 'selected' : ''}>Retail</option>
                        <option value="wholesale" ${data.businessType === 'wholesale' ? 'selected' : ''}>Wholesale</option>
                        <option value="manufacturing" ${data.businessType === 'manufacturing' ? 'selected' : ''}>Manufacturing</option>
                        <option value="ecommerce" ${data.businessType === 'ecommerce' ? 'selected' : ''}>E-commerce</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label>
                        <input type="checkbox" id="agreeTerms" required> 
                        I agree to the Terms of Service and Privacy Policy
                    </label>
                </div>
            </form>
        `;
    }

    renderStepWarehouse() {
        const data = this.setupData.warehouse || {};
        return `
            <form id="stepForm">
                <div style="margin-bottom: 15px;">
                    <label>Warehouse Name *</label>
                    <input type="text" id="warehouseName" class="form-control" required value="${data.name || ''}" placeholder="e.g., Main Warehouse">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div>
                        <label>Location/Area *</label>
                        <input type="text" id="warehouseLocation" class="form-control" required value="${data.location || ''}" placeholder="e.g., Downtown Area">
                    </div>
                    <div>
                        <label>Warehouse Code</label>
                        <input type="text" id="warehouseCode" class="form-control" value="${data.code || 'WH001'}" placeholder="WH001">
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label>
                        <input type="checkbox" id="isPrimaryWarehouse" ${data.isPrimary !== false ? 'checked' : ''}> 
                        Set as primary warehouse
                    </label>
                </div>
            </form>
        `;
    }

    renderStepSupplier() {
        const data = this.setupData.supplier || {};
        return `
            <form id="stepForm">
                <div style="margin-bottom: 15px;">
                    <label>Supplier Name *</label>
                    <input type="text" id="supplierName" class="form-control" required value="${data.name || ''}" placeholder="e.g., PT. Supplier Jaya">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div>
                        <label>Contact Person</label>
                        <input type="text" id="supplierContact" class="form-control" value="${data.contactPerson || ''}" placeholder="Contact person name">
                    </div>
                    <div>
                        <label>Phone</label>
                        <input type="tel" id="supplierPhone" class="form-control" value="${data.phone || ''}" placeholder="Supplier phone">
                    </div>
                </div>
            </form>
        `;
    }

    renderStepCustomer() {
        const data = this.setupData.customer || {};
        return `
            <form id="stepForm">
                <div style="margin-bottom: 15px;">
                    <label>Customer Name *</label>
                    <input type="text" id="customerName" class="form-control" required value="${data.name || ''}" placeholder="e.g., John Doe">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div>
                        <label>Contact Person</label>
                        <input type="text" id="customerContact" class="form-control" value="${data.contactPerson || ''}" placeholder="Contact person name">
                    </div>
                    <div>
                        <label>Phone</label>
                        <input type="tel" id="customerPhone" class="form-control" value="${data.phone || ''}" placeholder="Customer phone">
                    </div>
                </div>
            </form>
        `;
    }

    renderStepCategory() {
        const data = this.setupData.category || {};
        return `
            <form id="stepForm">
                <div style="margin-bottom: 15px;">
                    <label>Category Name *</label>
                    <input type="text" id="categoryName" class="form-control" required value="${data.name || ''}" placeholder="e.g., Electronics">
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label>Category Code</label>
                    <input type="text" id="categoryCode" class="form-control" value="${data.code || 'CAT001'}" placeholder="CAT001">
                </div>
            </form>
        `;
    }

    renderStepProduct() {
        const data = this.setupData.product || {};
        return `
            <form id="stepForm">
                <div style="margin-bottom: 15px;">
                    <label>Product Name *</label>
                    <input type="text" id="productName" class="form-control" required value="${data.name || ''}" placeholder="e.g., iPhone 15">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div>
                        <label>Product Code/SKU *</label>
                        <input type="text" id="productCode" class="form-control" required value="${data.code || 'PROD001'}" placeholder="PROD001">
                    </div>
                    <div>
                        <label>Category</label>
                        <select id="productCategory" class="form-control" required>
                            <option value="">Select category</option>
                            <option value="CAT001" ${data.categoryId === 'CAT001' ? 'selected' : ''}>Electronics</option>
                        </select>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div>
                        <label>Cost Price (Rp)</label>
                        <input type="number" id="costPrice" class="form-control" required value="${data.costPrice || ''}" placeholder="0" step="0.01" min="0">
                    </div>
                    <div>
                        <label>Selling Price (Rp)</label>
                        <input type="number" id="sellingPrice" class="form-control" required value="${data.sellingPrice || ''}" placeholder="0" step="0.01" min="0">
                    </div>
                </div>
            </form>
        `;
    }

    // Event binding yang sederhana
    bindEvents() {
        // Next button
        const nextBtn = document.getElementById('nextStepBtn');
        if (nextBtn) {
            nextBtn.onclick = () => this.handleNextStep();
        }
        
        // Previous button
        const prevBtn = document.getElementById('prevStepBtn');
        if (prevBtn) {
            prevBtn.onclick = () => this.handlePrevStep();
        }
        
        // Complete button
        const completeBtn = document.getElementById('completeSetupBtn');
        if (completeBtn) {
            completeBtn.onclick = () => this.handleCompleteSetup();
        }
    }

    handleNextStep() {
        try {
            this.saveCurrentStep();
            this.currentStep++;
            this.updateWizard();
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    handlePrevStep() {
        try {
            this.saveCurrentStep();
            this.currentStep--;
            this.updateWizard();
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    handleCompleteSetup() {
        try {
            this.saveCurrentStep();
            this.completeSetup();
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    saveCurrentStep() {
        // Simpan data dari form ke this.setupData
        switch(this.currentStep) {
            case 1:
                this.saveCompanyData();
                break;
            case 2:
                this.saveWarehouseData();
                break;
            case 3:
                this.saveSupplierData();
                break;
            case 4:
                this.saveCustomerData();
                break;
            case 5:
                this.saveCategoryData();
                break;
            case 6:
                this.saveProductData();
                break;
        }
        
        // Simpan ke localStorage
        localStorage.setItem('stockmint_setup_temp', JSON.stringify(this.setupData));
        localStorage.setItem('stockmint_setup_current_step', this.currentStep.toString());
    }

    saveCompanyData() {
        const name = document.getElementById('companyName')?.value;
        const address = document.getElementById('companyAddress')?.value || '';
        const phone = document.getElementById('companyPhone')?.value || '';
        const email = document.getElementById('companyEmail')?.value || '';
        const businessType = document.getElementById('businessType')?.value || '';
        const agreeTerms = document.getElementById('agreeTerms')?.checked || false;
        
        if (!name) throw new Error('Company name is required');
        if (!agreeTerms) throw new Error('You must agree to the Terms of Service');
        
        this.setupData.company = {
            id: 1,
            name,
            address,
            phone,
            email,
            businessType,
            setupDate: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
    }

    saveWarehouseData() {
        const name = document.getElementById('warehouseName')?.value;
        const location = document.getElementById('warehouseLocation')?.value || '';
        const code = document.getElementById('warehouseCode')?.value || 'WH001';
        const isPrimary = document.getElementById('isPrimaryWarehouse')?.checked || true;
        
        if (!name) throw new Error('Warehouse name is required');
        if (!location) throw new Error('Warehouse location is required');
        
        this.setupData.warehouse = {
            id: 1,
            name,
            location,
            code,
            isPrimary,
            createdAt: new Date().toISOString()
        };
    }

    saveSupplierData() {
        const name = document.getElementById('supplierName')?.value;
        const contact = document.getElementById('supplierContact')?.value || '';
        const phone = document.getElementById('supplierPhone')?.value || '';
        
        if (!name) throw new Error('Supplier name is required');
        
        this.setupData.supplier = {
            id: 1,
            name,
            contactPerson: contact,
            phone,
            isActive: true,
            createdAt: new Date().toISOString()
        };
    }

    saveCustomerData() {
        const name = document.getElementById('customerName')?.value;
        const contact = document.getElementById('customerContact')?.value || '';
        const phone = document.getElementById('customerPhone')?.value || '';
        
        if (!name) throw new Error('Customer name is required');
        
        this.setupData.customer = {
            id: 1,
            name,
            contactPerson: contact,
            phone,
            type: 'retail',
            isActive: true,
            createdAt: new Date().toISOString()
        };
    }

    saveCategoryData() {
        const name = document.getElementById('categoryName')?.value;
        const code = document.getElementById('categoryCode')?.value || 'CAT001';
        
        if (!name) throw new Error('Category name is required');
        
        this.setupData.category = {
            id: code,
            name,
            code,
            createdAt: new Date().toISOString()
        };
    }

    saveProductData() {
        const name = document.getElementById('productName')?.value;
        const code = document.getElementById('productCode')?.value;
        const category = document.getElementById('productCategory')?.value;
        const costPrice = document.getElementById('costPrice')?.value;
        const sellingPrice = document.getElementById('sellingPrice')?.value;
        
        if (!name || !code || !category || !costPrice || !sellingPrice) {
            throw new Error('Please fill all required fields');
        }
        
        this.setupData.product = {
            id: code,
            name,
            code,
            categoryId: category,
            costPrice: parseFloat(costPrice),
            sellingPrice: parseFloat(sellingPrice),
            unit: 'pcs',
            isActive: true,
            createdAt: new Date().toISOString()
        };
    }

    completeSetup() {
        // Simpan semua data ke localStorage
        this.saveAllToStorage();
        
        // Tandai setup selesai
        localStorage.setItem('stockmint_setup_completed', 'true');
        localStorage.removeItem('stockmint_setup_current_step');
        localStorage.removeItem('stockmint_setup_temp');
        
        // Buat opening stock
        this.createOpeningStock();
        
        this.showNotification('✅ Setup completed successfully!', 'success');
        
        // Redirect ke dashboard
        setTimeout(() => {
            window.location.hash = '#dashboard';
            window.location.reload();
        }, 2000);
    }

    saveAllToStorage() {
        // Simpan company
        if (this.setupData.company) {
            localStorage.setItem('stockmint_company', JSON.stringify(this.setupData.company));
        }
        
        // Simpan warehouse sebagai array
        if (this.setupData.warehouse) {
            localStorage.setItem('stockmint_warehouses', JSON.stringify([this.setupData.warehouse]));
        }
        
        // Simpan supplier sebagai array
        if (this.setupData.supplier) {
            localStorage.setItem('stockmint_suppliers', JSON.stringify([this.setupData.supplier]));
        }
        
        // Simpan customer sebagai array
        if (this.setupData.customer) {
            localStorage.setItem('stockmint_customers', JSON.stringify([this.setupData.customer]));
        }
        
        // Simpan category sebagai array
        if (this.setupData.category) {
            localStorage.setItem('stockmint_categories', JSON.stringify([this.setupData.category]));
        }
        
        // Simpan product sebagai array
        if (this.setupData.product) {
            localStorage.setItem('stockmint_products', JSON.stringify([this.setupData.product]));
        }
    }

    createOpeningStock() {
        if (this.setupData.product && this.setupData.warehouse) {
            const openingStock = {
                productId: this.setupData.product.id,
                warehouseId: this.setupData.warehouse.id,
                quantity: 0,
                date: new Date().toISOString()
            };
            
            localStorage.setItem('stockmint_opening_stock', JSON.stringify([openingStock]));
        }
    }

    updateWizard() {
        // Simpan step saat ini
        localStorage.setItem('stockmint_setup_current_step', this.currentStep.toString());
        
        // Re-render page melalui app.js
        window.location.hash = '#setup/start-new';
    }

    showNotification(message, type = 'info') {
        // Gunakan notification system dari app.js jika ada
        if (window.StockMintApp && window.StockMintApp.showNotification) {
            window.StockMintApp.showNotification(message, type);
        } else {
            // Fallback sederhana
            alert(message);
        }
    }
}

// Export global
window.SetupWizard = SetupWizard;
