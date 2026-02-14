const HomeScreen = {
    init() {
        // Setup Navigation Button
        const scanBtn = document.getElementById('scan-btn');
        if (scanBtn) {
            scanBtn.onclick = () => AppState.navigateTo('scan-screen');
        }
    }
};
