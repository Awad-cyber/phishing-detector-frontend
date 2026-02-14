// Main Entry Point
document.addEventListener('DOMContentLoaded', () => {
    try {
        // 1. Initialize State & Elements
        AppState.initElements();

        // 2. Initialize Screens
        HomeScreen.init();
        ScanScreen.init();
        ResultScreen.init();

        // 3. Initialize Routing (Handles URL and Back Button)
        AppState.initRouting();

        // 4. Global Event Listeners (Language)
        setupLanguageSwitcher();

        // 4. Set Initial Language
        updateLanguage(AppState.lang);

    } catch (error) {
        console.error("Initialization Failed:", error);
    } finally {
        // Wait for fonts (Icons) to load before showing the app
        document.fonts.ready.then(() => {
            // Check specifically for Material Icons if possible, strictly wait
            setTimeout(() => {
                // Reveal Icons
                document.body.classList.add('icons-loaded');

                if (AppState.elements.loadingScreen) {
                    AppState.elements.loadingScreen.classList.add('hidden');
                    AppState.elements.app.style.display = 'flex';
                    // Trigger resize to fix any layout shifts
                    window.dispatchEvent(new Event('resize'));
                }
            }, 500); // Buffer time
        });
    }
});

// Helper: Language Switching Logic
function setupLanguageSwitcher() {
    const { langBtn, langMenu } = AppState.elements;

    // Toggle Menu
    if (langBtn) {
        langBtn.onclick = (e) => {
            e.stopPropagation();
            langMenu.classList.toggle('hidden');
        };
    }

    // Language Options
    document.querySelectorAll('.lang-option').forEach(btn => {
        btn.onclick = () => {
            const lang = btn.dataset.lang;
            AppState.lang = lang;
            updateLanguage(lang);
            langMenu.classList.add('hidden');
        };
    });

    // Close menu when clicking outside
    document.onclick = (e) => {
        if (langBtn && !langBtn.contains(e.target)) {
            langMenu.classList.add('hidden');
        }
    };
}

// Helper: Update Application Text based on Language
function updateLanguage(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    if (AppState.elements.currentLangSpan) {
        AppState.elements.currentLangSpan.textContent = lang.toUpperCase();
    }

    document.getElementById('check-ar').classList.toggle('hidden', lang !== 'ar');
    document.getElementById('check-en').classList.toggle('hidden', lang !== 'en');

    const t = translations[lang];
    if (!t) return;

    // Map IDs to Translation Keys
    const ids = {
        'app-title': t.appTitle,
        'welcome-title': t.welcomeTitle,
        'welcome-subtitle': t.welcomeSubtitle,
        'feature-1-title': t.feature1Title,
        'feature-1-desc': t.feature1Desc,
        'feature-2-title': t.feature2Title,
        'feature-2-desc': t.feature2Desc,
        'feature-3-title': t.feature3Title,
        'feature-3-desc': t.feature3Desc,
        'scan-btn-text': t.scanBtn,
        'scan-title': t.scanTitle,
        'select-type-title': t.selectTypeTitle,
        'type-text': t.typeText,
        'type-file': t.typeFile,
        'paste-label': t.pasteLabel,
        'choose-file-title': t.chooseFileTitle,
        'choose-file-text': t.chooseFileBtn,
        'supported-formats': t.supportedFormats,
        'clear-text': t.clearBtn,
        'analyze-text': t.analyzeBtn,
        'result-title': t.resultTitle,
        'score-label': t.riskLabel,
        'risk-level-label': t.riskLabel ? (t.riskLabel.split(' ')[0] + ' ' + (lang === 'ar' ? 'الخطورة' : 'Level')) : 'Risk Level',
        'scan-another-text': t.scanAnotherBtn,
        'home-text': t.homeBtn
    };

    for (const [id, text] of Object.entries(ids)) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    if (AppState.elements.textareaPlaceholder) {
        AppState.elements.textareaPlaceholder.textContent = t.emailPlaceholder;
    }
}
