(function () {
    'use strict';

    // ─── 1. Load Kapa widget from CDN ────────────────────────────────────────
    var script = document.createElement('script');
    script.src = 'https://widget.kapa.ai/kapa-widget.bundle.js';
    script.async = true;

    // Required project attributes — fill these in with your Kapa dashboard values
    script.setAttribute('data-website-id', '');
    script.setAttribute('data-project-name', '');
    script.setAttribute('data-project-color', '');
    script.setAttribute('data-project-logo', '');

    // Hide Kapa's default floating button; we use our own .kapa-ai-trigger
    script.setAttribute('data-button-hide', 'true');

    document.head.appendChild(script);

    // ─── 2. Mintlify panel helpers ───────────────────────────────────────────
    function getMintlifyButton() {
        return document.getElementById('assistant-entry');
    }

    function isMintlifyPanelOpen() {
        var btn = getMintlifyButton();
        return btn && btn.getAttribute('data-state') === 'open';
    }

    function openMintlifyPanel() {
        var btn = getMintlifyButton();
        if (btn && !isMintlifyPanelOpen()) {
            btn.click();
        }
    }

    // ─── 3. Transplant Kapa container into the Mintlify panel ────────────────
    //
    // Kapa renders its container at the body level as a fixed-position modal.
    // We move it into #chat-assistant-sheet so it physically slides in with
    // Mintlify's panel animation. CSS in styles.css resets the positioning.
    var transplanted = false;

    function transplantKapaIntoPanel() {
        if (transplanted) return;

        var kapaContainer = document.querySelector('[id*="kapa-widget-container"]');
        var panel = document.getElementById('chat-assistant-sheet');

        if (!kapaContainer || !panel) return;

        panel.appendChild(kapaContainer);
        transplanted = true;
    }

    // Watch for Kapa's container to appear in the DOM, then move it
    var transplantObserver = new MutationObserver(function () {
        var kapaContainer = document.querySelector('[id*="kapa-widget-container"]');
        if (kapaContainer && !transplanted) {
            transplantKapaIntoPanel();
        }
    });

    // ─── 4. Wire .kapa-ai-trigger → open Mintlify panel + Kapa ──────────────
    function handleTriggerClick() {
        // Open the Mintlify panel for the slide-in animation
        openMintlifyPanel();

        // Open Kapa's modal — wait for window.Kapa to be ready
        function tryOpen() {
            if (window.Kapa && typeof window.Kapa.open === 'function') {
                window.Kapa.open({ mode: 'ai' });
                // After Kapa opens, attempt transplant in case it just rendered
                setTimeout(transplantKapaIntoPanel, 50);
            } else {
                setTimeout(tryOpen, 100);
            }
        }
        tryOpen();
    }

    function attachTriggerListeners() {
        document.querySelectorAll('.kapa-ai-trigger').forEach(function (trigger) {
            if (trigger.dataset.kapaListenerAttached) return;
            trigger.dataset.kapaListenerAttached = 'true';
            trigger.addEventListener('click', handleTriggerClick);
        });
    }

    // ─── 5. Bootstrap ────────────────────────────────────────────────────────
    function init() {
        attachTriggerListeners();

        // Start watching for Kapa's container to appear
        transplantObserver.observe(document.body, { childList: true, subtree: false });

        // Re-attach listeners after SPA navigation re-renders the trigger button
        var navObserver = new MutationObserver(function () {
            attachTriggerListeners();
        });
        navObserver.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
