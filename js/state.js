// Application State Management
const AppState = {
    lang: 'en', // Default language set to English
    screen: 'home-screen',
    inputType: 'text', // 'text' OR 'file'
    file: null,

    // Cache DOM Elements to avoid repeated queries
    elements: {},

    // Initialize Elements Reference
    initElements() {
        this.elements = {
            loadingScreen: document.getElementById('loading-screen'),
            app: document.getElementById('app'),
            langBtn: document.getElementById('lang-btn'),
            langMenu: document.getElementById('lang-menu'),
            currentLangSpan: document.getElementById('current-lang'),

            // Screens
            screens: document.querySelectorAll('.screen'),

            // Scan Screen Inputs
            textInputSection: document.getElementById('text-input-section'),
            fileInputSection: document.getElementById('file-input-section'),
            emailTextarea: document.getElementById('email-text'),
            textareaPlaceholder: document.getElementById('textarea-placeholder'),
            fileInput: document.getElementById('file-input'),
            fileInfo: document.getElementById('file-info'),
            fileName: document.getElementById('file-name'),
            fileSize: document.getElementById('file-size-text'),

            // Selector Buttons
            selectorButtons: document.querySelectorAll('.selector-btn'),

            // Result Screen Elements
            progressCircle: document.getElementById('progress-circle'),
            riskScore: document.getElementById('risk-score'),
            riskLevel: document.getElementById('risk-level'),
            riskLevelLabel: document.getElementById('risk-level-label'),
            resultIcon: document.getElementById('result-icon'),
            statusCard: document.getElementById('status-card'),

            // Buttons with text need updating on lang change
            analyzeBtn: document.getElementById('analyze-btn'),
            analyzeText: document.getElementById('analyze-text'),
            analyzeIcon: document.getElementById('analyze-icon'),
        };
    },

    // Navigation Logic with History API
    navigateTo(screenId, addToHistory = true) {
        // 1. Update UI
        this.elements.screens.forEach(s => s.classList.remove('active'));
        const target = document.getElementById(screenId);
        if (target) {
            target.classList.add('active');
            this.screen = screenId;
            window.scrollTo(0, 0);
        }

        // 2. Update Browser History
        if (addToHistory) {
            const urlMap = {
                'home-screen': '/',
                'scan-screen': '/scan',
                'result-screen': '/result'
            };

            const path = urlMap[screenId] || '/';
            // Use pushState to update URL without reloading
            history.pushState({ screenId: screenId }, '', '#' + path);
        }
    },

    // Initialize Routing & History Listener
    initRouting() {
        // Handle Browser Back Button
        window.onpopstate = (event) => {
            if (event.state && event.state.screenId) {
                // Navigate back without adding new history entry
                this.navigateTo(event.state.screenId, false);
            } else {
                // Default to home if no state
                this.navigateTo('home-screen', false);
            }
        };

        // Handle Initial URL Load
        const hash = window.location.hash;
        let startScreen = 'home-screen';

        if (hash === '#/scan') startScreen = 'scan-screen';
        else if (hash === '#/result') startScreen = 'result-screen';

        // Replace current state so we have a valid starting point
        history.replaceState({ screenId: startScreen }, '', hash || '#/');

        // Show the initial screen (no pushState needed)
        this.navigateTo(startScreen, false);
    }
};
