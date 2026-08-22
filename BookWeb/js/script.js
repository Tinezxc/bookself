// ============================================================
//  LOGIN + REGISTER (single source)
// ============================================================
(function() {
  'use strict';

  console.log('🔹 Linknest script loaded');

  document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM ready');

    // ----- Determine which page we're on -----
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
      initLogin();
    }
    if (registerForm) {
      initRegister();
    }

    // ----- Helper functions (shared) -----
    function setError(el, msg) {
      if (el) el.textContent = msg;
    }
    function clearError(el) {
      if (el) el.textContent = '';
    }
    function markInput(input, valid) {
      if (!input) return;
      input.classList.remove('error', 'success');
      if (valid === true) input.classList.add('success');
      else if (valid === false) input.classList.add('error');
    }

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

    // ----- LOGIN LOGIC -----
    function initLogin() {
      console.log('🔐 Login page detected');

      const form = document.getElementById('loginForm');
      const email = document.getElementById('loginEmail');
      const password = document.getElementById('loginPassword');
      const emailError = document.getElementById('loginEmailError');
      const passwordError = document.getElementById('loginPasswordError');

      // Toggle password (SVG version)
      const toggleBtn = document.getElementById('loginToggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', function(e) {
          e.preventDefault();
          const input = document.getElementById(this.getAttribute('data-target'));
          if (!input) return;
          const isPassword = input.type === 'password';
          input.type = isPassword ? 'text' : 'password';
          this.innerHTML = isPassword
            ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>`
            : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>`;
          console.log(`👁 Login password toggled to ${input.type}`);
        });
      }

      // Real-time email validation
      if (email) {
        email.addEventListener('input', function() {
          const val = this.value.trim();
          if (val.length === 0) {
            markInput(this, null);
            clearError(emailError);
            return;
          }
          const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
          markInput(this, valid);
          setError(emailError, valid ? '' : 'Please enter a valid email address.');
        });
      }

      // Form submit
      if (form) {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          console.log('📤 Login form submitted');

          const emailVal = email ? email.value.trim() : '';
          const passwordVal = password ? password.value : '';

          const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);

          if (!emailVal || !emailValid) {
            setError(emailError, 'Please enter a valid email address.');
            markInput(email, false);
          } else {
            clearError(emailError);
            markInput(email, true);
          }

          if (!passwordVal) {
            setError(passwordError, 'Password is required.');
            markInput(password, false);
          } else {
            clearError(passwordError);
            markInput(password, true);
          }

          if (emailValid && passwordVal) {
            sessionStorage.setItem('loggedIn', 'true');
            showToast('✅ Welcome back! Redirecting...', 'success');
            setTimeout(() => {
              window.location.href = 'dashboard.html';
            }, 1200);
          } else {
            showToast('Please fix the errors above.', 'error');
            const firstError = document.querySelector('.form-input.error');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      }
    }

    // ----- REGISTER LOGIC -----
    function initRegister() {
      console.log('📝 Register page detected');

      const form = document.getElementById('registerForm');
      const fullName = document.getElementById('fullName');
      const email = document.getElementById('email');
      const password = document.getElementById('password');
      const confirmPassword = document.getElementById('confirmPassword');
      const terms = document.getElementById('terms');
      const age = document.getElementById('age');

      const fullNameError = document.getElementById('fullNameError');
      const emailError = document.getElementById('emailError');
      const passwordError = document.getElementById('passwordError');
      const confirmError = document.getElementById('confirmError');
      const termsError = document.getElementById('termsError');
      const ageError = document.getElementById('ageError');
      const reqItems = document.querySelectorAll('#passwordRequirements li');

      // ----- Toggle using data-target (works for both password and confirm) -----
      document.querySelectorAll('.toggle-password').forEach(function(btn) {
        // Skip if it's the login toggle (not present on register page)
        if (btn.id === 'loginToggle') return;
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          const targetId = this.getAttribute('data-target');
          if (!targetId) {
            console.warn('⚠️ Toggle button missing data-target');
            return;
          }
          const input = document.getElementById(targetId);
          if (!input) {
            console.warn('⚠️ No input found for id:', targetId);
            return;
          }
          if (input.type === 'password') {
            input.type = 'text';
            this.textContent = '🙈';
          } else {
            input.type = 'password';
            this.textContent = '👁';
          }
          console.log(`👁 Toggled ${targetId} -> ${input.type}`);
        });
      });

      // ----- Password strength (real-time) -----
      function checkPasswordStrength(val) {
        const hasLength = val.length >= 8;
        const hasNumber = /\d/.test(val);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(val);
        const rules = { length: hasLength, number: hasNumber, special: hasSpecial };

        reqItems.forEach(function(li) {
          const rule = li.getAttribute('data-rule');
          const met = rules[rule] || false;
          li.classList.toggle('met', met);
          li.classList.toggle('unmet', !met && val.length > 0);
          const icon = met ? '✔' : '✘';
          li.textContent = li.textContent.replace(/^[✔✘]\s/, '');
          li.textContent = icon + ' ' + li.textContent.trim();
        });

        const allMet = hasLength && hasNumber && hasSpecial;
        markInput(password, val.length === 0 ? null : allMet);
        return allMet;
      }

      // Real‑time validation
      if (password) {
        password.addEventListener('input', function() {
          checkPasswordStrength(this.value);
          clearError(confirmError);
          markInput(confirmPassword, null);
          clearError(passwordError);
        });
      }

      if (confirmPassword) {
        confirmPassword.addEventListener('input', function() {
          const pass = password ? password.value : '';
          const conf = this.value;
          if (conf.length === 0) {
            clearError(confirmError);
            markInput(this, null);
            return;
          }
          const match = conf === pass;
          markInput(this, match);
          setError(confirmError, match ? '' : 'Passwords do not match.');
        });
      }

      if (email) {
        email.addEventListener('input', function() {
          const val = this.value.trim();
          if (val.length === 0) {
            markInput(this, null);
            clearError(emailError);
            return;
          }
          const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
          markInput(this, valid);
          setError(emailError, valid ? '' : 'Please enter a valid email address.');
        });
      }

      // Form submit
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('📤 Register form submitted');

        const nameVal = fullName ? fullName.value.trim() : '';
        const emailVal = email ? email.value.trim() : '';
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
        const passVal = password ? password.value : '';
        const passOk = checkPasswordStrength(passVal);
        const confVal = confirmPassword ? confirmPassword.value : '';

        if (!nameVal) { setError(fullNameError, 'Full name is required.'); markInput(fullName, false); }
        else { clearError(fullNameError); markInput(fullName, true); }

        if (!emailVal || !emailValid) { setError(emailError, 'Please enter a valid email address.'); markInput(email, false); }
        else { clearError(emailError); markInput(email, true); }

        if (!passOk) { setError(passwordError, 'Password does not meet requirements.'); markInput(password, false); }
        else { clearError(passwordError); markInput(password, true); }

        if (!confVal) { setError(confirmError, 'Please confirm your password.'); markInput(confirmPassword, false); }
        else if (confVal !== passVal) { setError(confirmError, 'Passwords do not match.'); markInput(confirmPassword, false); }
        else { clearError(confirmError); markInput(confirmPassword, true); }

        if (terms && !terms.checked) { setError(termsError, 'You must agree to the Terms of Service.'); if (terms.closest) terms.closest('.checkbox-group').classList.add('error'); }
        else { clearError(termsError); if (terms && terms.closest) terms.closest('.checkbox-group').classList.remove('error'); }

        if (age && !age.checked) { setError(ageError, 'You must confirm you are at least 13 years old.'); if (age.closest) age.closest('.checkbox-group').classList.add('error'); }
        else { clearError(ageError); if (age && age.closest) age.closest('.checkbox-group').classList.remove('error'); }

        const allValid = nameVal.length > 0 && emailValid && passOk && confVal === passVal && confVal.length > 0 && (terms ? terms.checked : false) && (age ? age.checked : false);

        if (allValid) {
          showToast('🎉 Account created successfully! Welcome to Linknest.', 'success');
          setTimeout(() => window.location.href = 'index.html', 1600);
        } else {
          showToast('Please fix the errors above and try again.', 'error');
          const firstError = document.querySelector('.form-input.error, .checkbox-group.error');
          if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });

      // Checkbox clear errors
      if (terms) {
        terms.addEventListener('change', function() {
          if (this.checked) { clearError(termsError); this.closest('.checkbox-group').classList.remove('error'); }
        });
      }
      if (age) {
        age.addEventListener('change', function() {
          if (this.checked) { clearError(ageError); this.closest('.checkbox-group').classList.remove('error'); }
        });
      }

      // Init password requirements
      reqItems.forEach(function(li) {
        li.classList.add('unmet');
        const icon = '✘';
        li.textContent = li.textContent.replace(/^[✔✘]\s/, '');
        li.textContent = icon + ' ' + li.textContent.trim();
      });
    }

  });
})();


// ============================================================
//  DASHBOARD (only runs when #searchInput exists)
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

    const isLoggedIn = sessionStorage.getItem('loggedIn');
    console.log('🔐 Session loggedIn =', isLoggedIn);

    if (!isLoggedIn) {
      console.warn('⛔ Not logged in – redirecting to login');
      window.location.href = 'index.html';
      return;
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🚪 Logout clicked');
        sessionStorage.removeItem('loggedIn');
        window.location.href = 'index.html';
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

    console.log(`🔍 Found ${allBookCards.length} book cards and ${shelfContainers.length} shelves`);

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
      if (noResults) {
        noResults.style.display = anyVisible ? 'none' : 'block';
      }
    }

    function filterBooks(query) {
      const lowerQuery = query.toLowerCase().trim();
      allBookCards.forEach(function(card) {
        const title = card.querySelector('.book-title')?.textContent?.toLowerCase() || '';
        const author = card.querySelector('.book-author')?.textContent?.toLowerCase() || '';
        const genre = card.querySelector('.genre-tag')?.textContent?.toLowerCase() || '';
        const matches = title.includes(lowerQuery) ||
                        author.includes(lowerQuery) ||
                        genre.includes(lowerQuery);
        card.style.display = matches ? '' : 'none';
      });
      updateSectionVisibility();
    }

    updateSectionVisibility();
    searchInput.addEventListener('input', function() {
      filterBooks(this.value);
    });
    console.log('✅ Search listener attached');

    console.log('✅ Dashboard ready – no flicker expected');
  });
})();