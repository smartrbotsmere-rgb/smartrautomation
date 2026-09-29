tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: '#36D6B5'
          },
          boxShadow: {
            soft: '0 10px 30px rgba(0,0,0,.08)'
          }
        }
      }
    };

(function () {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (saved === 'dark' || (!saved && prefersDark)) {
        document.documentElement.classList.add('dark');
      }
    })();

// ===== YEAR AUTO-UPDATE =====
    // Function: Sets current year in footer copyright
    document.getElementById('year').textContent = new Date().getFullYear();

    // ===== THEME TOGGLE =====
    // Function: toggleTheme()
    // Purpose: Switch between light and dark mode with localStorage persistence
    // Triggers: Click on theme toggle button
    document.getElementById('themeToggle').addEventListener('click', () => {
      const root = document.documentElement;
      const isDark = root.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // ===== IMAGE UPLOAD FORM HANDLING =====
    // Function: initializeImageUpload()
    // Purpose: Setup file upload form with drag-drop, validation, and webhook integration
    // Features: File validation, preview generation, error handling, webhook trigger

    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('previewContainer');
    const filePreviewGrid = document.getElementById('filePreviewGrid');
    const fileCountDisplay = document.getElementById('fileCount');
    const form = document.getElementById('imageUploadForm');
    const submitBtn = document.getElementById('submitBtn');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = errorMessage.querySelector('p');

    let selectedFiles = [];
    const MAX_FILES = 4;
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const WEBHOOK_URL = 'https://hook.us1.make.com/bdu64hyackqfaeosqc33foccj9j93v8c';
    const REDIRECT_URL = 'https://www.smartrbots.com';

    // ===== DRAG AND DROP EVENT HANDLERS =====
    // Manages visual feedback and file handling for drag operations
    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('drag-active');
    });

    uploadZone.addEventListener('dragleave', () => {
      uploadZone.classList.remove('drag-active');
    });

    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('drag-active');
      handleFiles(e.dataTransfer.files);
    });

    uploadZone.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      handleFiles(e.target.files);
    });

    // ===== FILE VALIDATION AND HANDLING =====
    // Function: handleFiles()
    // Purpose: Validate selected files and update preview
    // Validation: Type check, size check, quantity limit
    function handleFiles(files) {
      errorMessage.classList.add('hidden');
      selectedFiles = [];

      // Validate total file count
      if (files.length > MAX_FILES) {
        showError(`Maximum ${MAX_FILES} files allowed. You selected ${files.length}.`);
        return;
      }

      // Validate each file
      for (let file of files) {
        // Check file type
        if (!ALLOWED_TYPES.includes(file.type)) {
          showError(`Invalid file type: ${file.name}. Allowed: JPG, PNG, GIF, WebP`);
          continue;
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
          showError(`File too large: ${file.name}. Maximum size: 10MB`);
          continue;
        }

        selectedFiles.push(file);
      }

      // Update UI
      updatePreview();
    }

    // ===== PREVIEW UPDATE =====
    // Function: updatePreview()
    // Purpose: Display thumbnails of selected files with remove buttons
    function updatePreview() {
      fileCountDisplay.textContent = selectedFiles.length;

      if (selectedFiles.length === 0) {
        previewContainer.classList.add('hidden');
        filePreviewGrid.innerHTML = '';
        return;
      }

      previewContainer.classList.remove('hidden');
      filePreviewGrid.innerHTML = '';

      selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const previewDiv = document.createElement('div');
          previewDiv.className = 'file-preview bg-slate-200 dark:bg-slate-700 relative';
          previewDiv.innerHTML = `
            <img src="${e.target.result}" alt="Preview ${index + 1}" />
            <button
              type="button"
              class="file-remove-btn bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition"
              onclick="removeFile(${index})"
              aria-label="Remove file"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          `;
          filePreviewGrid.appendChild(previewDiv);
        };
        reader.readAsDataURL(file);
      });

      // Update file input
      const dataTransfer = new DataTransfer();
      selectedFiles.forEach(file => dataTransfer.items.add(file));
      fileInput.files = dataTransfer.files;
    }

    // ===== FILE REMOVAL =====
    // Function: removeFile()
    // Purpose: Remove a file from the selected files array
    window.removeFile = function(index) {
      selectedFiles.splice(index, 1);
      updatePreview();
    };

    // ===== ERROR DISPLAY =====
    // Function: showError()
    // Purpose: Display validation error message to user
    function showError(message) {
      errorText.textContent = message;
      errorMessage.classList.remove('hidden');
    }

    // ===== FORM SUBMISSION WITH WEBHOOK =====
    // Function: handleFormSubmit()
    // Purpose: Validate form, send files to webhook (Make.com), redirect on success
    // Process: 1. Validate inputs 2. Create FormData 3. Send to webhook 4. Redirect
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate required fields
      const fullName = document.getElementById('fullName').value.trim();
      const email = document.getElementById('email').value.trim();

      if (!fullName) {
        showError('Please enter your full name.');
        return;
      }

      if (!email || !email.includes('@')) {
        showError('Please enter a valid email address.');
        return;
      }

      if (selectedFiles.length === 0) {
        showError('Please select at least 1 image to upload.');
        return;
      }

      // Show loading state
      submitBtn.disabled = true;
      document.getElementById('submitText').textContent = 'Uploading...';
      document.getElementById('loadingSpinner').classList.remove('hidden');
      errorMessage.classList.add('hidden');

      try {
        // Create FormData with files and user info
        const formData = new FormData();
        formData.append('full_name', fullName);
        formData.append('email', email);

        selectedFiles.forEach((file, index) => {
          formData.append(`image_${index + 1}`, file);
        });

        // Send to webhook
        const response = await fetch(WEBHOOK_URL, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Upload failed with status ${response.status}`);
        }

        // Success - redirect to thank you page with parameters
        const params = new URLSearchParams({
          full_name: fullName,
          email: email,
          files_uploaded: selectedFiles.length
        });

        window.location.href = `${REDIRECT_URL}?${params.toString()}`;

      } catch (error) {
        console.error('Upload error:', error);
        showError('Upload failed. Please try again or contact support.');
        submitBtn.disabled = false;
        document.getElementById('submitText').textContent = 'Upload Images';
        document.getElementById('loadingSpinner').classList.add('hidden');
      }
    });

    // ===== FORM RESET HANDLER =====
    // Function: Reset form and clear file selection
    document.getElementById('resetBtn').addEventListener('click', () => {
      selectedFiles = [];
      fileInput.value = '';
      updatePreview();
      errorMessage.classList.add('hidden');
    });