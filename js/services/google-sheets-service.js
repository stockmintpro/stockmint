// Google Sheets Service - For all Sheets operations
class GoogleSheetsService {
    constructor() {
        this.auth = window.StockMintAuth;
        this.spreadsheetId = localStorage.getItem('stockmint_spreadsheet_id');
    }

    // Check if service is ready
    isReady() {
        return this.auth.hasGoogleSheets() && this.spreadsheetId;
    }

    // Save setup data to Google Sheets
    async saveSetupData(setupData) {
        if (!this.isReady()) {
            throw new Error('Google Sheets not configured');
        }

        try {
            const accessToken = this.auth.getToken();
            
            // Prepare batch update
            const requests = [];
            
            // Clear existing data in all sheets
            const sheets = ['dim_Company', 'dim_Warehouses', 'dim_Suppliers', 'dim_Customers', 'dim_Categories', 'dim_Products'];
            
            sheets.forEach(sheetName => {
                requests.push({
                    updateCells: {
                        range: {
                            sheetId: this.getSheetId(sheetName),
                            startRowIndex: 0,
                            startColumnIndex: 0
                        },
                        fields: 'userEnteredValue'
                    }
                });
            });
            
            // Add headers and data
            if (setupData.company) {
                await this.saveCompanyData(setupData.company);
            }
            
            if (setupData.warehouses && setupData.warehouses.length > 0) {
                await this.saveWarehousesData(setupData.warehouses);
            }
            
            if (setupData.suppliers && setupData.suppliers.length > 0) {
                await this.saveSuppliersData(setupData.suppliers);
            }
            
            if (setupData.customers && setupData.customers.length > 0) {
                await this.saveCustomersData(setupData.customers);
            }
            
            if (setupData.categories && setupData.categories.length > 0) {
                await this.saveCategoriesData(setupData.categories);
            }
            
            if (setupData.products && setupData.products.length > 0) {
                await this.saveProductsData(setupData.products);
            }
            
            console.log('✅ All setup data saved to Google Sheets');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to save setup data:', error);
            throw error;
        }
    }

    // Reset all data (clear sheets but keep spreadsheet)
    async resetAllData() {
        if (!this.isReady()) {
            throw new Error('Google Sheets not configured');
        }

        try {
            const accessToken = this.auth.getToken();
            const response = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}:batchUpdate`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        requests: [
                            // Clear all sheets
                            {
                                updateCells: {
                                    range: {
                                        sheetId: 0, // dim_Company
                                        startRowIndex: 0,
                                        startColumnIndex: 0
                                    },
                                    fields: 'userEnteredValue'
                                }
                            },
                            {
                                updateCells: {
                                    range: {
                                        sheetId: 1, // dim_Warehouses
                                        startRowIndex: 0,
                                        startColumnIndex: 0
                                    },
                                    fields: 'userEnteredValue'
                                }
                            },
                            {
                                updateCells: {
                                    range: {
                                        sheetId: 2, // dim_Suppliers
                                        startRowIndex: 0,
                                        startColumnIndex: 0
                                    },
                                    fields: 'userEnteredValue'
                                }
                            },
                            {
                                updateCells: {
                                    range: {
                                        sheetId: 3, // dim_Customers
                                        startRowIndex: 0,
                                        startColumnIndex: 0
                                    },
                                    fields: 'userEnteredValue'
                                }
                            },
                            {
                                updateCells: {
                                    range: {
                                        sheetId: 4, // dim_Categories
                                        startRowIndex: 0,
                                        startColumnIndex: 0
                                    },
                                    fields: 'userEnteredValue'
                                }
                            },
                            {
                                updateCells: {
                                    range: {
                                        sheetId: 5, // dim_Products
                                        startRowIndex: 0,
                                        startColumnIndex: 0
                                    },
                                    fields: 'userEnteredValue'
                                }
                            }
                        ]
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Failed to reset sheets data');
            }

            console.log('✅ All sheets cleared');
            return true;
            
        } catch (error) {
            console.error('Reset failed:', error);
            throw error;
        }
    }

    // Individual save methods
    async saveCompanyData(company) {
        const values = [[
            'COMPANY_ID', 'COMPANY_NAME', 'TAX_NO', 'STREET', 
            'PHONE1', 'EMAIL', 'BUSINESS_TYPE', 'CREATED_AT'
        ]];
        
        values.push([
            'COMP001',
            company.name || '',
            company.taxId || '',
            company.address || '',
            company.phone || '',
            company.email || '',
            company.businessType || '',
            new Date().toISOString()
        ]);
        
        return this.updateSheet('dim_Company!A1', values);
    }

    async saveWarehousesData(warehouses) {
        const values = [[
            'STORAGE_ID', 'STORAGE_NAME', 'STORAGE_AREA', 'IS_PRIMARY', 'CREATED_AT'
        ]];
        
        warehouses.forEach(wh => {
            values.push([
                wh.id || '',
                wh.name || '',
                wh.address || '',
                wh.isPrimary ? '1' : '0',
                new Date().toISOString()
            ]);
        });
        
        return this.updateSheet('dim_Warehouses!A1', values);
    }

    // ... (similar methods for other data types)

    // Helper method to update sheet
    async updateSheet(range, values) {
        const accessToken = this.auth.getToken();
        
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}?valueInputOption=RAW`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ values })
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to update sheet: ${range}`);
        }

        return true;
    }

    getSheetId(sheetName) {
        const sheetMap = {
            'dim_Company': 0,
            'dim_Warehouses': 1,
            'dim_Suppliers': 2,
            'dim_Customers': 3,
            'dim_Categories': 4,
            'dim_Products': 5
        };
        
        return sheetMap[sheetName] || 0;
    }

    // Load data from Google Sheets
    async loadData(sheetName) {
        if (!this.isReady()) {
            throw new Error('Google Sheets not configured');
        }

        try {
            const accessToken = this.auth.getToken();
            const response = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${sheetName}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to load data from ${sheetName}`);
            }

            const data = await response.json();
            return data.values || [];
            
        } catch (error) {
            console.error(`Load data failed for ${sheetName}:`, error);
            throw error;
        }
    }
}

// Create global instance
window.GoogleSheetsService = new GoogleSheetsService();
