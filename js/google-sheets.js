// Google Sheets API Integration
class GoogleSheetsAPI {
  constructor() {
    this.accessToken = localStorage.getItem('stockmint_token');
    this.user = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
    this.spreadsheetId = localStorage.getItem('stockmint_spreadsheet_id');
  }

  // Check if we have spreadsheet access
  async checkAccess() {
    if (!this.accessToken) {
      throw new Error('No access token found');
    }

    try {
      // Test API access
      const response = await fetch('https://www.googleapis.com/drive/v3/about', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to access Google API');
      }

      return true;
    } catch (error) {
      console.error('Google Sheets access check failed:', error);
      throw error;
    }
  }

  // Create new spreadsheet for user
  async createSpreadsheet() {
    try {
      const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            title: `StockMint - ${this.user.name || 'Business'} - ${new Date().toISOString().split('T')[0]}`
          },
          sheets: [
            {
              properties: {
                title: 'dim_Company',
                sheetId: 0
              }
            },
            {
              properties: {
                title: 'dim_Suppliers',
                sheetId: 1
              }
            },
            {
              properties: {
                title: 'dim_Customers',
                sheetId: 2
              }
            },
            {
              properties: {
                title: 'dim_Warehouses',
                sheetId: 3
              }
            },
            {
              properties: {
                title: 'dim_Products',
                sheetId: 4
              }
            },
            {
              properties: {
                title: 'dim_Categories',
                sheetId: 5
              }
            }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create spreadsheet');
      }

      const data = await response.json();
      const spreadsheetId = data.spreadsheetId;
      const spreadsheetUrl = data.spreadsheetUrl;

      // Save to localStorage
      localStorage.setItem('stockmint_spreadsheet_id', spreadsheetId);
      localStorage.setItem('stockmint_spreadsheet_url', spreadsheetUrl);

      return {
        id: spreadsheetId,
        url: spreadsheetUrl
      };
    } catch (error) {
      console.error('Failed to create spreadsheet:', error);
      throw error;
    }
  }

  // Save data to specific sheet
  async saveToSheet(sheetName, data) {
    if (!this.spreadsheetId) {
      throw new Error('No spreadsheet selected');
    }

    try {
      // Prepare values for Sheets API
      const values = [];
      
      // Add headers if it's the first row
      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        values.push(headers);
        
        // Add data rows
        data.forEach(item => {
          const row = headers.map(header => item[header] || '');
          values.push(row);
        });
      }

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${sheetName}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: values,
            majorDimension: 'ROWS'
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to save data');
      }

      return true;
    } catch (error) {
      console.error(`Failed to save to ${sheetName}:`, error);
      throw error;
    }
  }

  // Get existing spreadsheet
  async getSpreadsheetInfo() {
    if (!this.spreadsheetId) {
      return null;
    }

    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get spreadsheet info');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get spreadsheet info:', error);
      throw error;
    }
  }

  // Map data from setup wizard to Google Sheets format
  mapSetupDataToSheets(setupData) {
    return {
      'dim_Company': [{
        'COMPANY_ID': 'COMP001',
        'COMPANY_NAME': setupData.company?.name || '',
        'TAX_NO': setupData.company?.taxId || '',
        'STREET': setupData.company?.address || '',
        'PHONE1': setupData.company?.phone || '',
        'EMAIL': setupData.company?.email || '',
        'BUSINESS_TYPE': setupData.company?.businessType || ''
      }],
      
      'dim_Warehouses': setupData.warehouses?.map((wh, index) => ({
        'STORAGE_ID': wh.id,
        'STORAGE_NAME': wh.name,
        'STORAGE_AREA': wh.address || '',
        'IS_PRIMARY': wh.isPrimary ? 1 : 0
      })) || [],
      
      'dim_Suppliers': setupData.suppliers?.map(sup => ({
        'SUPPLIER_ID': sup.id,
        'SUPPLIER_NAME': sup.name,
        'CONTACT_PERSON': sup.contact || '',
        'PHONE1': sup.phone || '',
        'EMAIL': sup.email || '',
        'CODE': sup.code || '',
        'IS_ACTIVE': sup.isActive ? 1 : 0
      })) || [],
      
      'dim_Customers': setupData.customers?.map(cust => ({
        'CUSTOMER_ID': cust.id,
        'CUSTOMER_NAME': cust.name,
        'CUSTOMER_TYPE': cust.type || 'retail',
        'CONTACT_PERSON': cust.contact || '',
        'PHONE1': cust.phone || '',
        'EMAIL': cust.email || '',
        'IS_TAXABLE': cust.taxable ? 1 : 0,
        'IS_ACTIVE': cust.isActive ? 1 : 0
      })) || [],
      
      'dim_Categories': setupData.categories?.map(cat => ({
        'CATEGORY_ID': cat.id,
        'CATEGORY_NAME': cat.name,
        'CODE': cat.code || '',
        'DESCRIPTION': cat.description || ''
      })) || [],
      
      'dim_Products': setupData.products?.map(prod => ({
        'PRODUCT_ID': prod.id,
        'PRODUCT_NAME': prod.name,
        'CATEGORY_ID': prod.categoryId,
        'UNIT': prod.unit,
        'DESCRIPTION': '',
        'SIZE': '',
        'COLOR': '',
        'HAS_EXPIRY': 0,
        'ARCHIVE': 0
      })) || []
    };
  }

  // Save all setup data to Google Sheets
  async saveSetupData(setupData) {
    try {
      // Check if we have a spreadsheet
      if (!this.spreadsheetId) {
        console.log('📝 No spreadsheet found, creating new one...');
        await this.createSpreadsheet();
      }

      // Map data to sheets format
      const sheetsData = this.mapSetupDataToSheets(setupData);

      // Save each sheet
      for (const [sheetName, data] of Object.entries(sheetsData)) {
        if (data.length > 0) {
          console.log(`💾 Saving ${data.length} rows to ${sheetName}...`);
          await this.saveToSheet(sheetName, data);
        }
      }

      console.log('✅ All setup data saved to Google Sheets');
      return true;
    } catch (error) {
      console.error('❌ Failed to save setup data:', error);
      throw error;
    }
  }
}

// Create global instance
window.GoogleSheetsAPI = GoogleSheetsAPI;