(function () {
    'use strict';

    var SIDEBAR_WIDTH = 400;
    var MOBILE_BREAKPOINT = 1024;
    var sidebarOpen = false;
    var sidebarInjected = false;
    var kapaReady = false;

    // ─── 1. Load Kapa widget from CDN ───────────────────────────────────────
    var script = document.createElement('script');
    script.src = 'https://widget.kapa.ai/kapa-widget.bundle.js';
    script.async = true;

    // Required project attributes — fill these in with your Kapa dashboard values
    script.setAttribute('data-website-id', '');
    script.setAttribute('data-project-name', '');
    script.setAttribute('data-project-color', '');
    script.setAttribute('data-project-logo', '');

    // Hide Kapa's default floating button; we use our own trigger
    script.setAttribute('data-button-hide', 'true');

    // Sidebar-style: fixed right panel, full height, matching spacer width
    script.setAttribute('data-modal-with-overlay', 'false');
    script.setAttribute('data-modal-x-offset', '0');
    script.setAttribute('data-modal-y-offset', '0');
    script.setAttribute('data-modal-size', '100vh');
    script.setAttribute('data-modal-lock-scroll', 'false');
    script.setAttribute('data-modal-border-radius', '0');
    script.setAttribute('data-modal-inner-position-right', '0');
    script.setAttribute('data-modal-inner-position-top', '0');
    script.setAttribute('data-modal-inner-position-bottom', '0');
    script.setAttribute('data-modal-inner-position-left', 'auto');
    script.setAttribute('data-modal-inner-max-width', SIDEBAR_WIDTH + 'px');
    script.setAttribute('data-modal-inner-flex-direction', 'column');
    script.setAttribute('data-modal-inner-justify-content', 'end');

    document.head.appendChild(script);

    // ─── 2. Inject spacer into the flex layout ──────────────────────────────
    function injectSidebar() {
        if (sidebarInjected) return document.getElementById('kapa-sidebar');

        var mintSheet = document.getElementById('chat-assistant-sheet');
        var flexParent = null;

        if (mintSheet) {
            flexParent = mintSheet.parentElement;
            mintSheet.remove();
        } else {
            var contentContainer = document.getElementById('content-container');
            if (contentContainer) {
                flexParent = contentContainer.closest('.lg\\:flex') || contentContainer.parentElement;
            }
        }

        if (!flexParent) return null;

        var sidebar = document.createElement('div');
        sidebar.id = 'kapa-sidebar';

        flexParent.appendChild(sidebar);

        sidebarInjected = true;
        return sidebar;
    }

    // ─── 3. Wait for Kapa to be ready ─────────────────────────────────────
    function waitForKapa() {
        if (window.Kapa && typeof window.Kapa.open === 'function') {
            kapaReady = true;
        } else {
            setTimeout(waitForKapa, 200);
        }
    }

    // ─── 4. Create and inject Ask AI button next to the search bar ─────────
    var triggerInjected = false;

    function injectAskAIButton() {
        if (triggerInjected) return;
        var searchBar = document.getElementById('search-bar-entry');
        if (!searchBar) return;

        // Find the wrapper div that contains the search bar
        var wrapper = searchBar.closest('.relative.hidden.lg\\:flex');
        if (!wrapper) return;

        var btn = document.createElement('button');
        btn.id = 'kapa-ask-ai-btn';
        btn.type = 'button';
        btn.className = 'flex-none hidden lg:flex items-center justify-center gap-1.5 h-9 rounded-xl shadow-sm bg-background-light dark:bg-background-dark dark:brightness-[1.1] dark:ring-1 dark:hover:brightness-[1.25] ring-1 ring-gray-400/20 hover:ring-gray-600/25 dark:ring-gray-600/30 dark:hover:ring-gray-500/30 w-9 p-0 ml-2';
        btn.setAttribute('aria-label', 'Ask AI');
        btn.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" class="size-4 shrink-0 text-gray-700 hover:text-gray-800 dark:text-gray-400 hover:dark:text-gray-200">' +
            '<g fill="currentColor">' +
            '<path d="M5.658,2.99l-1.263-.421-.421-1.263c-.137-.408-.812-.408-.949,0l-.421,1.263-1.263,.421c-.204,.068-.342,.259-.342,.474s.138,.406,.342,.474l1.263,.421,.421,1.263c.068,.204,.26,.342,.475,.342s.406-.138,.475-.342l.421-1.263,1.263-.421c.204-.068.342-.259.342-.474s-.138-.406-.342-.474Z" fill="currentColor" data-stroke="none" stroke="none"></path>' +
            '<polygon points="9.5 2.75 11.412 7.587 16.25 9.5 11.412 11.413 9.5 16.25 7.587 11.413 2.75 9.5 7.587 7.587 9.5 2.75" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></polygon>' +
            '</g></svg>';

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggleSidebar();
        });

        // Insert inside the search bar wrapper, right after the search button
        wrapper.insertBefore(btn, searchBar.nextSibling);
        triggerInjected = true;
    }

    // ─── 5. Sidebar toggle — expand spacer + open/close Kapa ──────────────
    function isMobile() {
        return window.innerWidth < MOBILE_BREAKPOINT;
    }

    function openSidebar() {
        var sidebar = document.getElementById('kapa-sidebar');
        if (!sidebar) return;

        sidebarOpen = true;
        sidebar.classList.add('kapa-sidebar-open');
        document.documentElement.style.setProperty('--assistant-sheet-width', SIDEBAR_WIDTH + 'px');

        if (kapaReady) {
            window.Kapa.open({ mode: 'ai' });
        }

        if (isMobile()) {
            showOverlay();
        }

        var btn = document.getElementById('kapa-ask-ai-btn');
        if (btn) btn.classList.add('active');
    }

    function closeSidebar() {
        var sidebar = document.getElementById('kapa-sidebar');

        sidebarOpen = false;
        if (sidebar) {
            sidebar.classList.remove('kapa-sidebar-open');
        }

        document.documentElement.style.setProperty('--assistant-sheet-width', '0px');

        if (kapaReady && window.Kapa && typeof window.Kapa.close === 'function') {
            window.Kapa.close();
        }

        hideOverlay();

        var btn = document.getElementById('kapa-ask-ai-btn');
        if (btn) btn.classList.remove('active');
    }

    function toggleSidebar() {
        if (sidebarOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    // ─── 6. Listen for Kapa events ─────────────────────────────────────────
    function listenForKapaEvents() {
        if (typeof window.Kapa === 'function') {
            window.Kapa('onModalClose', function () {
                if (sidebarOpen) {
                    closeSidebar();
                }
            });
            window.Kapa('onModalOpen', function () {
                setTimeout(matchKapaWidth, 50);
            });
        } else {
            setTimeout(listenForKapaEvents, 200);
        }
    }

    function matchKapaWidth() {
        var modal = document.getElementById('kapa-modal-content');
        if (!modal) return;

        // Force Kapa's modal content to fill full spacer width
        modal.style.setProperty('width', SIDEBAR_WIDTH + 'px', 'important');
        modal.style.setProperty('min-width', SIDEBAR_WIDTH + 'px', 'important');
        modal.style.setProperty('max-width', SIDEBAR_WIDTH + 'px', 'important');

        // Remove Mantine inner padding that causes width mismatch
        var inner = modal.closest('.mantine-Modal-inner');
        if (inner) {
            inner.style.setProperty('padding', '0', 'important');
        }
    }

    // ─── 7. Mobile overlay backdrop ─────────────────────────────────────────
    function showOverlay() {
        if (document.getElementById('kapa-overlay')) return;
        var overlay = document.createElement('div');
        overlay.id = 'kapa-overlay';
        overlay.addEventListener('click', closeSidebar);
        document.body.appendChild(overlay);
        requestAnimationFrame(function () {
            overlay.classList.add('visible');
        });
    }

    function hideOverlay() {
        var overlay = document.getElementById('kapa-overlay');
        if (overlay) {
            overlay.classList.remove('visible');
            overlay.addEventListener('transitionend', function () {
                overlay.remove();
            }, { once: true });
            setTimeout(function () { if (overlay.parentElement) overlay.remove(); }, 400);
        }
    }

    // ─── 8. Handle window resize ────────────────────────────────────────────
    var lastMobileState = null;

    function handleResize() {
        var mobile = isMobile();
        if (lastMobileState === mobile) return;
        lastMobileState = mobile;

        if (sidebarOpen) {
            if (mobile) {
                showOverlay();
            } else {
                hideOverlay();
            }
        }
    }

    window.addEventListener('resize', handleResize);

    // ─── 9. Wire existing .kapa-ai-trigger buttons (e.g. from MDX) ─────────
    function attachTriggerListeners() {
        document.querySelectorAll('.kapa-ai-trigger').forEach(function (trigger) {
            if (trigger.dataset.kapaListenerAttached) return;
            trigger.dataset.kapaListenerAttached = 'true';
            trigger.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                toggleSidebar();
            });
        });
    }

    // ─── 10. Bootstrap ──────────────────────────────────────────────────────
    function init() {
        injectSidebar();
        injectAskAIButton();
        attachTriggerListeners();
        waitForKapa();
        listenForKapaEvents();

        var navObserver = new MutationObserver(function () {
            attachTriggerListeners();
            injectAskAIButton();
        });
        navObserver.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();