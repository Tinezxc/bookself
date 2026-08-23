// ============================================================
//  DATABASE MODULE (API via PHP + MySQL)
// ============================================================
const DB = (function() {
  'use strict';

  const API_BASE = 'http://localhost/BookWeb/api/';

  async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (data) {
      options.body = JSON.stringify(data);
    }
    const response = await fetch(API_BASE + endpoint, options);
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'API request failed');
    }
    return result;
  }

  return {
    async register(userData) {
      return await apiCall('register.php', 'POST', userData);
    },

    async login(email, password) {
      const result = await apiCall('login.php', 'POST', { email, password });
      if (result.success && result.user) {
        sessionStorage.setItem('currentUser', result.user.email);
        sessionStorage.setItem('loggedIn', 'true');
        return result.user;
      }
      throw new Error(result.error || 'Login failed');
    },

    async getCurrentUser() {
      const email = sessionStorage.getItem('currentUser');
      if (!email) return null;
      try {
        return await apiCall('get_user.php?email=' + encodeURIComponent(email));
      } catch (e) {
        console.error('Failed to fetch user:', e);
        return null;
      }
    },

    async saveUser(updatedUser) {
      const email = sessionStorage.getItem('currentUser');
      if (!email) throw new Error('No logged-in user');
      const data = { email, ...updatedUser };
      return await apiCall('update_user.php', 'POST', data);
    },

    logout() {
      sessionStorage.removeItem('currentUser');
      sessionStorage.removeItem('loggedIn');
      window.location.href = 'index.html';
    }
  };
})();