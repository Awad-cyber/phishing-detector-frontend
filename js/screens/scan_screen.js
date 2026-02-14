const ScanScreen = {
    init() {
        this.setupInputSwitching();
        this.setupFileInput();
        this.setupPlaceholderLogic();
        this.setupActionButtons();
    },
    setupInputSwitching() {
        const buttons = AppState.elements.selectorButtons;
        buttons.forEach(btn => {
            btn.onclick = () => {
                // Update UI state
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                // Update App State
                AppState.inputType = btn.dataset.type;
                this.updateInputVisibility();
                // Clear previous data
                this.clearInput();
            };
        });
    },
    updateInputVisibility() {
        const { textInputSection, fileInputSection } = AppState.elements;
        if (AppState.inputType === 'text') {
            textInputSection.classList.add('active');
            fileInputSection.classList.remove('active');
        } else {
            textInputSection.classList.remove('active');
            fileInputSection.classList.add('active');
        }
    },
    setupPlaceholderLogic() {
        const { emailTextarea, textareaPlaceholder } = AppState.elements;
        if (!emailTextarea) return;
        emailTextarea.oninput = () => {
            textareaPlaceholder.style.display = emailTextarea.value ? 'none' : 'block';
        };
        emailTextarea.onfocus = () => textareaPlaceholder.style.opacity = '0.5';
        emailTextarea.onblur = () => textareaPlaceholder.style.opacity = '1';
    },
    setupFileInput() {
        const { fileInput, fileName, fileSize, fileInfo } = AppState.elements;
        const chooseBtn = document.getElementById('choose-file-btn');
        if (chooseBtn) chooseBtn.onclick = () => fileInput.click();
        if (fileInput) {
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    AppState.file = file;
                    fileName.textContent = file.name;
                    const sizeKB = file.size / 1024;
                    fileSize.textContent = sizeKB < 1024
                        ? sizeKB.toFixed(2) + ' KB'
                        : (sizeKB / 1024).toFixed(2) + ' MB';
                    fileInfo.classList.remove('hidden');
                }
            };
        }
    },
    setupActionButtons() {
        document.getElementById('back-btn').onclick = () => AppState.navigateTo('home-screen');
        document.getElementById('clear-btn').onclick = () => this.clearInput();
        document.getElementById('analyze-btn').onclick = () => this.performAnalysis();
    },
    clearInput() {
        const { emailTextarea, textareaPlaceholder, fileInput, fileInfo } = AppState.elements;
        emailTextarea.value = '';
        if (textareaPlaceholder) textareaPlaceholder.style.display = 'block';
        AppState.file = null;
        if (fileInput) fileInput.value = '';
        if (fileInfo) fileInfo.classList.add('hidden');
    },
    async performAnalysis() {
        const t = translations[AppState.lang];
        const { emailTextarea, analyzeBtn, analyzeText, analyzeIcon } = AppState.elements;
        // Validation
        if (AppState.inputType === 'text' && !emailTextarea.value.trim()) {
            alert(t.emptyError);
            return;
        }
        if (AppState.inputType === 'file' && !AppState.file) {
            alert(t.noFileError);
            return;
        }
        // Loading State
        const originalText = analyzeText.textContent;
        analyzeBtn.disabled = true;
        analyzeText.textContent = t.loading;
        analyzeIcon.textContent = 'hourglass_empty';
        analyzeIcon.classList.add('spin-animation'); 
        // Prepare text to analyze (from textarea or file)
        let textToAnalyze = emailTextarea.value;
        if (AppState.inputType === 'file') {
            try {
                textToAnalyze = await this.readFileAsText(AppState.file);
            } catch (err) {
                analyzeBtn.disabled = false;
                analyzeText.textContent = originalText;
                analyzeIcon.textContent = 'analytics';
                analyzeIcon.classList.remove('spin-animation');
                alert(err.message || t.noFileError);
                return;
            }
        }

        // Call API Service with resolved text
        const result = await ApiService.analyzeEmail(textToAnalyze);
        // Reset Button
        analyzeBtn.disabled = false;
        analyzeText.textContent = originalText;
        analyzeIcon.textContent = 'analytics';
        analyzeIcon.classList.remove('spin-animation');
        if (result.success) {
            // PASS THE FULL DATA OBJECT INSTEAD OF JUST THE SCORE
            ResultScreen.showResult(result.data);
            AppState.navigateTo('result-screen');
        } else {
            alert("Analysis Failed: " + result.error);
        }
    },
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = (e.target && e.target.result) || '';
                if (!text.trim()) {
                    reject(new Error("محتوى الملف فارغ أو غير صالح للتحليل."));
                } else {
                    resolve(text);
                }
            };
            reader.onerror = () => reject(new Error("فشل قراءة الملف. يرجى المحاولة مجدداً أو اختيار ملف آخر."));
            reader.readAsText(file, 'utf-8');
        });
    }
};
