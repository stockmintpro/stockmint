class MasterDataSetup {
  constructor(app) {
    this.app = app;
  }

  render() {
    return `
      <div class="page-content">
        <h1>Initial Setup Required</h1>
        <p class="page-subtitle">Please set up your basic data before using StockMint</p>
        
        <div class="setup-options-grid">
          <!-- START NEW -->
          <div class="setup-card" id="startNewCard">
            <div class="setup-icon" style="background: #19BEBB;">
              <i class="fas fa-plus-circle"></i>
            </div>
            <h3>Start New</h3>
            <p>Create new data from scratch. You only need to fill one of each component.</p>
            <button class="btn-primary" onclick="window.location.hash='#/master-data/new'">
              <i class="fas fa-play"></i> Begin Setup
            </button>
          </div>

          <!-- DATA MIGRATION -->
          <div class="setup-card" id="dataMigrationCard">
            <div class="setup-icon" style="background: #667eea;">
              <i class="fas fa-file-import"></i>
            </div>
            <h3>Data Migration</h3>
            <p>For users with existing data. Download template, fill it, then upload.</p>
            <div class="setup-actions">
              <button class="btn-secondary" onclick="window.open('template.html', '_blank')">
                <i class="fas fa-download"></i> Download Template
              </button>
              <button class="btn-primary" id="uploadTemplateBtn">
                <i class="fas fa-upload"></i> Upload Template
              </button>
            </div>
          </div>

          <!-- DATA RESET -->
          <div class="setup-card" id="dataResetCard">
            <div class="setup-icon" style="background: #ef4444;">
              <i class="fas fa-redo"></i>
            </div>
            <h3>Data Reset</h3>
            <p>Reset all data to factory settings. Use with caution!</p>
            <button class="btn-secondary" id="resetDataBtn">
              <i class="fas fa-exclamation-triangle"></i> Reset Data
            </button>
          </div>
        </div>

        <!-- DATA BACKUP (link ke Settings) -->
        <div class="setup-note">
          <p>
            <i class="fas fa-info-circle"></i>
            For <strong>Data Backup & Restore</strong>, go to 
            <a href="#/settings/backup" class="text-link">Settings → Backup & Restore</a>
          </p>
        </div>
      </div>
    `;
  }

  init() {
    // Event listeners untuk upload dan reset
    document.getElementById('uploadTemplateBtn')?.addEventListener('click', () => {
      this.showUploadModal();
    });

    document.getElementById('resetDataBtn')?.addEventListener('click', () => {
      this.confirmReset();
    });
  }

  showUploadModal() {
    // Modal untuk upload template
    const modalHTML = `
      <div class="modal">
        <div class="modal-content">
          <h3><i class="fas fa-upload"></i> Upload Data Template</h3>
          <p>Upload your filled template (.xlsx, .csv, or .json)</p>
          
          <div class="upload-area" id="dropZone">
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Drag & drop your file here</p>
            <p class="text-sm">or</p>
            <input type="file" id="fileInput" accept=".xlsx,.csv,.json" hidden>
            <button class="btn-secondary" onclick="document.getElementById('fileInput').click()">
              Browse Files
            </button>
          </div>

          <div class="validation-info">
            <h4><i class="fas fa-check-circle"></i> Validation Process:</h4>
            <ul>
              <li>✓ Check file format and structure</li>
              <li>✓ Validate data types and relationships</li>
              <li>✓ Verify primary key connections</li>
              <li>✓ Preview changes before saving</li>
            </ul>
          </div>

          <div class="modal-actions">
            <button class="btn-secondary" onclick="this.closeModal()">Cancel</button>
            <button class="btn-primary" disabled id="processUploadBtn">
              <i class="fas fa-cog"></i> Process & Validate
            </button>
          </div>
        </div>
      </div>
    `;

    // Tambahkan modal ke DOM dan inisialisasi
    // ... implementasi upload logic
  }

  confirmReset() {
    // Konfirmasi reset data
    if (confirm("⚠️ WARNING: This will delete ALL your data!\n\nAre you absolutely sure?")) {
      if (confirm("This action cannot be undone. Type 'RESET' to confirm:")) {
        // Implement reset logic
        this.app.showNotification('Data reset initiated', 'warning');
        // Redirect ke setup awal
        window.location.hash = '#/master-data-setup';
      }
    }
  }
}