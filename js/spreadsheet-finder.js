// spreadsheet-finder.js - Dedicated class untuk mencari spreadsheet
class SpreadsheetFinder {
    constructor() {
        this.token = localStorage.getItem('stockmint_token');
        this.user = JSON.parse(localStorage.getItem('stockmint_user') || '{}');
    }
    
    async searchAllStrategies() {
        if (!this.token || this.user.isDemo) return null;
        
        console.log('🎯 Starting comprehensive spreadsheet search...');
        
        const strategies = [
            this.searchByOwnership(),
            this.searchByNamePattern(),
            this.searchByRecentActivity(),
            this.searchBySharedAccess()
        ];
        
        // Jalankan semua strategi secara paralel
        const results = await Promise.allSettled(strategies);
        
        // Kumpulkan semua hasil
        const allSpreadsheets = [];
        
        for (const result of results) {
            if (result.status === 'fulfilled' && result.value) {
                allSpreadsheets.push(...result.value);
            }
        }
        
        if (allSpreadsheets.length === 0) {
            console.log('📭 No spreadsheets found with any strategy');
            return null;
        }
        
        // Sort dan deduplicate
        const uniqueSpreadsheets = this.deduplicateSpreadsheets(allSpreadsheets);
        
        // Pilih yang terbaik
        const bestSpreadsheet = this.selectBestSpreadsheet(uniqueSpreadsheets);
        
        console.log('✅ Selected spreadsheet:', bestSpreadsheet?.name);
        return bestSpreadsheet;
    }
    
    async searchByOwnership() {
        try {
            const query = `mimeType='application/vnd.google-apps.spreadsheet' and trashed = false and '${this.user.email}' in owners`;
            const response = await this.driveAPIRequest(query);
            return response.files || [];
        } catch (error) {
            console.log('Ownership search failed:', error.message);
            return [];
        }
    }
    
    async searchByNamePattern() {
        try {
            const patterns = [
                'StockMint',
                'inventory',
                this.user.name?.split(' ')[0],
                this.user.email?.split('@')[0]
            ].filter(Boolean);
            
            const results = [];
            
            for (const pattern of patterns) {
                const query = `name contains '${pattern}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed = false`;
                const response = await this.driveAPIRequest(query);
                
                if (response.files) {
                    results.push(...response.files);
                }
            }
            
            return results;
        } catch (error) {
            console.log('Name pattern search failed:', error.message);
            return [];
        }
    }
    
    async searchByRecentActivity() {
        try {
            const query = `mimeType='application/vnd.google-apps.spreadsheet' and trashed = false and modifiedTime > '${this.getOneMonthAgo()}'`;
            const response = await this.driveAPIRequest(query, 'modifiedTime desc');
            return response.files || [];
        } catch (error) {
            console.log('Recent activity search failed:', error.message);
            return [];
        }
    }
    
    async searchBySharedAccess() {
        try {
            const query = `sharedWithMe and mimeType='application/vnd.google-apps.spreadsheet' and trashed = false`;
            const response = await this.driveAPIRequest(query);
            return response.files || [];
        } catch (error) {
            console.log('Shared access search failed:', error.message);
            return [];
        }
    }
    
    async driveAPIRequest(query, orderBy = '') {
        let url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink,owners,createdTime,modifiedTime,shared)`;
        
        if (orderBy) {
            url += `&orderBy=${orderBy}`;
        }
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        
        if (!response.ok) {
            throw new Error(`Drive API error: ${response.status}`);
        }
        
        return await response.json();
    }
    
    deduplicateSpreadsheets(spreadsheets) {
        const uniqueMap = new Map();
        
        for (const sheet of spreadsheets) {
            if (!uniqueMap.has(sheet.id)) {
                uniqueMap.set(sheet.id, sheet);
            }
        }
        
        return Array.from(uniqueMap.values());
    }
    
    selectBestSpreadsheet(spreadsheets) {
        // Beri skor untuk setiap spreadsheet
        const scoredSheets = spreadsheets.map(sheet => {
            let score = 0;
            
            // 1. Prioritas: dimiliki oleh user
            const isOwner = sheet.owners?.some(owner => owner.emailAddress === this.user.email);
            if (isOwner) score += 100;
            
            // 2. Prioritas: nama mengandung "StockMint"
            if (sheet.name.includes('StockMint')) score += 50;
            
            // 3. Prioritas: yang paling baru
            const ageInDays = (Date.now() - new Date(sheet.modifiedTime).getTime()) / (1000 * 60 * 60 * 24);
            score += Math.max(0, 30 - ageInDays); // Semakin baru, skor semakin tinggi
            
            // 4. Prioritas: tidak shared (private)
            if (!sheet.shared) score += 20;
            
            return { sheet, score };
        });
        
        // Urutkan berdasarkan skor
        scoredSheets.sort((a, b) => b.score - a.score);
        
        return scoredSheets[0]?.sheet || null;
    }
    
    getOneMonthAgo() {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().split('T')[0];
    }
    
    // Main function untuk digunakan di app.js
    static async findAndConnectSpreadsheet() {
        try {
            const finder = new SpreadsheetFinder();
            const spreadsheet = await finder.searchAllStrategies();
            
            if (spreadsheet) {
                // Simpan ke localStorage
                localStorage.setItem('stockmint_google_sheet_id', spreadsheet.id);
                localStorage.setItem('stockmint_google_sheet_url', 
                    spreadsheet.webViewLink || `https://docs.google.com/spreadsheets/d/${spreadsheet.id}/edit`);
                localStorage.setItem('stockmint_google_sheet_name', spreadsheet.name);
                localStorage.setItem('stockmint_spreadsheet_found', 'true');
                
                console.log('✅ Connected to existing spreadsheet:', spreadsheet.name);
                return spreadsheet;
            } else {
                localStorage.setItem('stockmint_spreadsheet_found', 'false');
                console.log('📭 No existing spreadsheet found');
                return null;
            }
        } catch (error) {
            console.error('❌ Spreadsheet finder error:', error);
            localStorage.setItem('stockmint_spreadsheet_found', 'error');
            return null;
        }
    }
}

window.SpreadsheetFinder = SpreadsheetFinder;
