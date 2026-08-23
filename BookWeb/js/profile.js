// ============================================================
//  PROFILE MODULE (fixed with fallback & logging)
// ============================================================
(function() {
  'use strict';

  console.log('👤 Profile script loaded');

  document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('profileContainer');
    if (!container) {
      console.log('⏭️ Not on profile – skipping');
      return;
    }

    console.log('👤 Profile detected');

    if (!sessionStorage.getItem('loggedIn')) {
      console.warn('⛔ Not logged in – redirecting');
      window.location.href = 'index.html';
      return;
    }

    let currentUser = null;

    // ---------- load user ----------
    async function loadUser() {
      try {
        console.log('📥 Fetching current user...');
        currentUser = await DB.getCurrentUser();
        console.log('✅ Raw user data:', currentUser);
        if (!currentUser) {
          console.warn('⛔ No user – redirecting');
          window.location.href = 'index.html';
          return;
        }
        populateProfile(currentUser);
      } catch (e) {
        console.error('❌ Failed to load user:', e);
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('loggedIn');
        window.location.href = 'index.html';
      }
    }

    // ---------- populate UI ----------
    function populateProfile(user) {
      console.log('📝 Populating profile with:', user);

      let displayName = user.name;
      if (!displayName || displayName.trim() === '') {
        displayName = user.email ? user.email.split('@')[0] : 'User';
        console.warn('⚠️ Name was empty – using fallback:', displayName);
      }
      const nameDisplay = document.getElementById('profileName');
      if (nameDisplay) nameDisplay.textContent = displayName;

      const emailDisplay = document.getElementById('profileEmail');
      if (emailDisplay) emailDisplay.textContent = user.email || 'No email';

      const planDisplay = document.getElementById('profilePlan');
      if (planDisplay) planDisplay.textContent = user.plan || 'Free';

      const sinceDisplay = document.getElementById('profileSince');
      if (sinceDisplay) sinceDisplay.textContent = user.join_date || '2026';

      // Preferences
      const genres = (user.preferences && user.preferences.genres) ? user.preferences.genres : ['Fantasy', 'Mystery'];
      const langs = (user.preferences && user.preferences.languages) ? user.preferences.languages : ['English'];
      const genreContainer = document.getElementById('genreTags');
      const langContainer = document.getElementById('langTags');
      if (genreContainer) genreContainer.innerHTML = genres.map(g => `<span>${g}</span>`).join('');
      if (langContainer) langContainer.innerHTML = langs.map(l => `<span>${l}</span>`).join('');

      // Stats
      const stats = user.stats || {};
      const statIds = ['statBooksRead', 'statCurrentlyReading', 'statWantToRead', 'statPurchases'];
      const statKeys = ['booksRead', 'currentlyReading', 'wantToRead', 'purchases'];
      statIds.forEach((id, index) => {
        const el = document.getElementById(id);
        if (el) el.textContent = stats[statKeys[index]] ?? 0;
      });

      // Reading goal
      const goal = stats.readingGoal || { target: 20, progress: 0 };
      const goalText = document.getElementById('goalText');
      if (goalText) goalText.textContent = `${goal.progress} / ${goal.target} books`;
      const percent = Math.min((goal.progress / goal.target) * 100, 100);
      const progressBar = document.getElementById('goalProgress');
      if (progressBar) progressBar.style.width = percent + '%';
      const goalPercent = document.getElementById('goalPercent');
      if (goalPercent) goalPercent.textContent = Math.round(percent) + '% completed';

      // Avatar
      const initial = displayName.charAt(0).toUpperCase();
      document.querySelectorAll('.avatar').forEach(el => {
        el.textContent = initial;
      });
      console.log('✅ Profile populated with display name:', displayName);
    }

    // ---------- edit account ----------
    const editAccountBtn = document.getElementById('editAccountBtn');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const nameDisplay = document.getElementById('profileName');

    if (editAccountBtn && saveProfileBtn && nameDisplay) {
      editAccountBtn.addEventListener('click', function() {
        const currentName = nameDisplay.textContent;
        nameDisplay.innerHTML = `<input type="text" id="editNameInput" value="${currentName}" class="form-input" style="width:100%;">`;
        saveProfileBtn.style.display = 'block';
        this.style.display = 'none';
      });

      saveProfileBtn.addEventListener('click', async function() {
        const input = document.getElementById('editNameInput');
        if (!input) return;
        const newName = input.value.trim();
        if (newName) {
          try {
            await DB.saveUser({ name: newName });
            currentUser.name = newName;
            nameDisplay.textContent = newName;
            document.querySelectorAll('.avatar').forEach(el => el.textContent = newName.charAt(0).toUpperCase());
            showToast('✅ Profile updated!', 'success');
          } catch (err) {
            showToast('Update failed: ' + err.message, 'error');
          }
        } else {
          showToast('Name cannot be empty.', 'error');
        }
        saveProfileBtn.style.display = 'none';
        editAccountBtn.style.display = 'inline-block';
      });
    } else {
      console.warn('⚠️ Edit buttons not found');
    }

    // ---------- edit preferences ----------
    const editPrefsBtn = document.getElementById('editPrefsBtn');
    const savePrefsBtn = document.getElementById('savePrefsBtn');
    const genreTags = document.getElementById('genreTags');
    const langTags = document.getElementById('langTags');

    if (editPrefsBtn && savePrefsBtn && genreTags && langTags) {
      editPrefsBtn.addEventListener('click', function() {
        const currentGenres = (currentUser.preferences && currentUser.preferences.genres) ? currentUser.preferences.genres : [];
        const currentLangs = (currentUser.preferences && currentUser.preferences.languages) ? currentUser.preferences.languages : [];
        genreTags.innerHTML = `<input type="text" id="editGenres" value="${currentGenres.join(', ')}" class="form-input" style="width:100%;" placeholder="e.g. Fantasy, Romance">`;
        langTags.innerHTML = `<input type="text" id="editLangs" value="${currentLangs.join(', ')}" class="form-input" style="width:100%;" placeholder="e.g. English, Japanese">`;
        savePrefsBtn.style.display = 'block';
        this.style.display = 'none';
      });

      savePrefsBtn.addEventListener('click', async function() {
        const genresInput = document.getElementById('editGenres');
        const langsInput = document.getElementById('editLangs');
        if (!genresInput || !langsInput) return;
        const newGenres = genresInput.value.split(',').map(s => s.trim()).filter(Boolean);
        const newLangs = langsInput.value.split(',').map(s => s.trim()).filter(Boolean);
        try {
          await DB.saveUser({ preferences: { genres: newGenres, languages: newLangs } });
          currentUser.preferences = { genres: newGenres, languages: newLangs };
          genreTags.innerHTML = newGenres.map(g => `<span>${g}</span>`).join('');
          langTags.innerHTML = newLangs.map(l => `<span>${l}</span>`).join('');
          showToast('✅ Preferences updated!', 'success');
        } catch (err) {
          showToast('Update failed: ' + err.message, 'error');
        }
        savePrefsBtn.style.display = 'none';
        editPrefsBtn.style.display = 'inline-block';
      });
    } else {
      console.warn('⚠️ Preferences buttons not found');
    }

    // ---------- sign out ----------
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🚪 Signing out');
        DB.logout();
      });
    }

    // ---------- toast helper ----------
    function showToast(msg, type) {
      let toast = document.querySelector('.toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
      }
      toast.textContent = msg;
      toast.className = 'toast ' + type;
      void toast.offsetWidth;
      toast.classList.add('show');
      clearTimeout(toast._hideTimer);
      toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 4000);
    }

    // start
    loadUser();
    console.log('✅ Profile ready');
  });
})();