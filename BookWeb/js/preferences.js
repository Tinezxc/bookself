// ============================================================
//  PREFERENCES MODULE – load, save, and manage reading preferences
// ============================================================
(function() {
    'use strict';

    let selectedGenres = new Set();
    let selectedLanguages = new Set();

    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    // ----- Helpers -----
    function showToast(msg, type = 'info') {
        toastMessage.textContent = msg;
        toast.className = 'toast show ' + type;
        clearTimeout(toast._hideTimer);
        toast._hideTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    // Toggle tag selection
    function toggleTag(tag) {
        const isGenre = tag.hasAttribute('data-genre');
        const isLang = tag.hasAttribute('data-language');

        if (isGenre) {
            const genre = tag.dataset.genre;
            if (selectedGenres.has(genre)) {
                selectedGenres.delete(genre);
                tag.classList.remove('selected');
            } else {
                selectedGenres.add(genre);
                tag.classList.add('selected');
            }
        } else if (isLang) {
            const lang = tag.dataset.language;
            if (selectedLanguages.has(lang)) {
                selectedLanguages.delete(lang);
                tag.classList.remove('selected');
            } else {
                selectedLanguages.add(lang);
                tag.classList.add('selected');
            }
        }
    }

    // Load preferences from server and populate UI
    async function loadPreferences() {
        try {
            const data = await DB.getPreferences();
            if (data && data.genres) {
                document.querySelectorAll('.tag.selected').forEach(el => el.classList.remove('selected'));
                selectedGenres.clear();
                selectedLanguages.clear();

                const genres = data.genres.split(',').map(s => s.trim()).filter(Boolean);
                genres.forEach(genre => {
                    const tag = document.querySelector(`.tag[data-genre="${genre}"]`);
                    if (tag) {
                        tag.classList.add('selected');
                        selectedGenres.add(genre);
                    }
                });

                if (data.languages) {
                    const langs = data.languages.split(',').map(s => s.trim()).filter(Boolean);
                    langs.forEach(lang => {
                        const tag = document.querySelector(`.tag[data-language="${lang}"]`);
                        if (tag) {
                            tag.classList.add('selected');
                            selectedLanguages.add(lang);
                        }
                    });
                }
            }
        } catch (err) {
            console.warn('No existing preferences or error loading:', err);
        }
    }

    // Save current selections and redirect to dashboard
    async function savePreferences() {
        const genres = Array.from(selectedGenres).join(',');
        const languages = Array.from(selectedLanguages).join(',');

        try {
            await DB.savePreferences({ genres, languages });
            showToast('✅ Preferences saved! Redirecting...', 'success');
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } catch (err) {
            showToast('❌ Failed to save: ' + err.message, 'error');
        }
    }

    // Skip (redirect to dashboard)
    function skipPreferences() {
        window.location.href = 'dashboard.html';
    }

    // ----- Init (uses session storage directly) -----
    async function initPreferences() {
        // Check if user is logged in via sessionStorage
        const email = sessionStorage.getItem('currentUser');
        if (!email) {
            window.location.href = 'index.html';
            return;
        }

        // Attach click handlers to all tags
        document.querySelectorAll('.tag').forEach(tag => {
            tag.addEventListener('click', function(e) {
                e.preventDefault();
                toggleTag(this);
            });
        });

        // Load existing preferences
        await loadPreferences();

        // Save button
        const saveBtn = document.getElementById('savePreferencesBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', savePreferences);
        }

        // Skip button
        const skipBtn = document.getElementById('skipPreferencesBtn');
        if (skipBtn) {
            skipBtn.addEventListener('click', skipPreferences);
        }
    }

    // Expose init function globally
    window.initPreferences = initPreferences;

    // Auto-run
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPreferences);
    } else {
        initPreferences();
    }
})();