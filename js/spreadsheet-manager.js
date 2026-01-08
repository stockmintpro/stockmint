// Spreadsheet Manager - Untuk manage spreadsheet secara persisten
class SpreadsheetManager {
  constructor() {
    this.user = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
  }
  
  // Simpan spreadsheet info secara persisten
  async saveSpreadsheetInfo(spreadsheetId, spreadsheetName) {
    try {
      // 1. LocalStorage (utama)
      localStorage.setItem('stockmint_google_sheet_id', spreadsheetId);
      localStorage.setItem('stockmint_google_sheet_name', spreadsheetName);
      
      // 2. IndexedDB (backup)
      await this.saveToIndexedDB(spreadsheetId, spreadsheetName);
      
      // 3. Server (jika ada backend)
      await this.saveToServerIfAvailable(spreadsheetId);
      
      console.log('✅ Spreadsheet info saved to multiple locations');
      
    } catch (error) {
      console.warn('Failed to save spreadsheet info:', error);
    }
  }
  
  // Cari spreadsheet yang sudah ada untuk user ini
  async findExistingSpreadsheet() {
    try {
      const user = this.user;
      if (user.isDemo || !user.email) return null;
      
      // Cari di localStorage backup
      const backupKey = `stockmint_sheet_${user.uniqueId || user.email}`;
      const backup = localStorage.getItem(backupKey);
      
      if (backup) {
        const sheetInfo = JSON.parse(backup);
        console.log('📊 Found spreadsheet in backup:', sheetInfo);
        return sheetInfo;
      }
      
      // Cari di Google Drive via API
      if (window.GoogleSheetsService && window.GoogleSheetsService.token) {
        const token = window.GoogleSheetsService.token;
        const searchQuery = `name contains 'StockMint' and '${user.email}' in owners`;
        
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQuery)}&fields=files(id,name,webViewLink)`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.files && data.files.length > 0) {
            // Urutkan berdasarkan tanggal modifikasi terbaru
            const latestSheet = data.files.sort((a, b) => 
              new Date(b.modifiedTime || 0) - new Date(a.modifiedTime || 0)
            )[0];
            
            return {
              id: latestSheet.id,
              name: latestSheet.name,
              url: latestSheet.webViewLink
            };
          }
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('Error finding existing spreadsheet:', error);
      return null;
    }
  }
  
  // Restore spreadsheet dari berbagai sumber
  async restoreSpreadsheet() {
    try {
      // 1. Cek localStorage utama
      const mainSheetId = localStorage.getItem('stockmint_google_sheet_id');
      if (mainSheetId) {
        console.log('✅ Spreadsheet found in main storage');
        return {
          id: mainSheetId,
          name: localStorage.getItem('stockmint_google_sheet_name') || 'StockMint Data',
          source: 'localStorage'
        };
      }
      
      // 2. Cari spreadsheet yang sudah ada
      const existingSheet = await this.findExistingSpreadsheet();
      if (existingSheet) {
        console.log('✅ Existing spreadsheet found:', existingSheet);
        
        // Simpan ke localStorage untuk future use
        localStorage.setItem('stockmint_google_sheet_id', existingSheet.id);
        localStorage.setItem('stockmint_google_sheet_url', existingSheet.url || 
          `https://docs.google.com/spreadsheets/d/${existingSheet.id}/edit`);
        
        return existingSheet;
      }
      
      // 3. Tidak ditemukan
      console.log('📝 No existing spreadsheet found');
      return null;
      
    } catch (error) {
      console.error('Error restoring spreadsheet:', error);
      return null;
    }
  }
  
  // Helper methods
  async saveToIndexedDB(spreadsheetId, spreadsheetName) {
    // Implementasi indexedDB sederhana
    if (!window.indexedDB) return;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('StockMintDB', 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('spreadsheets')) {
          db.createObjectStore('spreadsheets', { keyPath: 'userId' });
        }
      };
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['spreadsheets'], 'readwrite');
        const store = transaction.objectStore('spreadsheets');
        
        const record = {
          userId: this.user.uniqueId || this.user.email || 'unknown',
          spreadsheetId: spreadsheetId,
          spreadsheetName: spreadsheetName,
          savedAt: new Date().toISOString()
        };
        
        store.put(record);
        resolve();
      };
      
      request.onerror = reject;
    });
  }
  
  async saveToServerIfAvailable(spreadsheetId) {
    // Jika ada backend, simpan juga ke server
    // Untuk sekarang, skip dulu
    return Promise.resolve();
  }
}

// Create global instance
window.SpreadsheetManager = new SpreadsheetManager();
