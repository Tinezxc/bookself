// ============================================================
//  DASHBOARD MODULE
// ============================================================
(function() {
  'use strict';

  console.log('📊 Dashboard script loaded');

  document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) {
      console.log('⏭️ Not on dashboard – skipping');
      return;
    }

    console.log('📊 Dashboard detected');

    // Auth check
    if (!sessionStorage.getItem('loggedIn')) {
      window.location.href = 'index.html';
      return;
    }

    // Load user avatar
    (async function loadAvatar() {
      try {
        const user = await DB.getCurrentUser();
        if (user) {
          document.querySelectorAll('.avatar').forEach(el => {
            el.textContent = user.name.charAt(0).toUpperCase();
          });
        }
      } catch (e) {
        console.error('Failed to load user:', e);
      }
    })();

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        DB.logout();
      });
    }

    // Dropdown toggle
    const profile = document.getElementById('userProfile');
    const dropdown = document.getElementById('dropdownMenu');
    if (profile && dropdown) {
      profile.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('show');
      });
      document.addEventListener('click', function() {
        dropdown.classList.remove('show');
      });
    }

    // Search
    const allBookCards = document.querySelectorAll('.book-card');
    const noResults = document.getElementById('noResults');
    const shelfContainers = document.querySelectorAll('.shelf-container');

    function updateSectionVisibility() {
      shelfContainers.forEach(function(section) {
        const visibleCards = section.querySelectorAll('.book-card:not([style*="display: none"])');
        const header = section.querySelector('.section-header');
        const grid = section.querySelector('.books-grid');
        if (visibleCards.length === 0) {
          if (header) header.style.display = 'none';
          if (grid) grid.style.display = 'none';
        } else {
          if (header) header.style.display = '';
          if (grid) grid.style.display = '';
        }
      });
      const anyVisible = document.querySelectorAll('.book-card:not([style*="display: none"])').length > 0;
      if (noResults) noResults.style.display = anyVisible ? 'none' : 'block';
    }

    function filterBooks(query) {
      const lowerQuery = query.toLowerCase().trim();
      allBookCards.forEach(function(card) {
        const title = card.querySelector('.book-title')?.textContent?.toLowerCase() || '';
        const author = card.querySelector('.book-author')?.textContent?.toLowerCase() || '';
        const genre = card.querySelector('.genre-tag')?.textContent?.toLowerCase() || '';
        const matches = title.includes(lowerQuery) || author.includes(lowerQuery) || genre.includes(lowerQuery);
        card.style.display = matches ? '' : 'none';
      });
      updateSectionVisibility();
    }

    updateSectionVisibility();
    searchInput.addEventListener('input', function() {
      filterBooks(this.value);
    });

    console.log('✅ Dashboard ready');
  });
})();