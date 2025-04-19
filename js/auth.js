/**
 * Authentication utilities for Netlify Identity
 */

// Initialize authentication system
function initAuth() {
  // Check if netlifyIdentity is available
  if (typeof netlifyIdentity === 'undefined') {
    console.error('Netlify Identity widget not loaded');
    return;
  }
  
  // Get UI elements if they exist
  const loginButton = document.getElementById('login-button');
  const signupButton = document.getElementById('signup-button');
  const logoutButton = document.getElementById('logout-button');
  const userGreeting = document.getElementById('user-greeting');
  const userName = document.getElementById('user-name');
  
  // If we're on a page without auth UI, exit gracefully
  if (!loginButton || !signupButton) {
    return;
  }
  
  // Event handlers for Netlify Identity
  netlifyIdentity.on('init', user => {
    updateAuthUI(user, loginButton, signupButton, logoutButton, userGreeting, userName);
  });
  
  netlifyIdentity.on('login', user => {
    updateAuthUI(user, loginButton, signupButton, logoutButton, userGreeting, userName);
    netlifyIdentity.close();
  });
  
  netlifyIdentity.on('logout', () => {
    updateAuthUI(null, loginButton, signupButton, logoutButton, userGreeting, userName);
  });
  
  // Check for saved user in localStorage (in case Netlify Identity is slow to init)
  const savedUser = localStorage.getItem('netlifyUser');
  if (savedUser) {
    try {
      const userObj = JSON.parse(savedUser);
      if (userGreeting) userGreeting.style.display = 'flex';
      if (userName) userName.textContent = userObj.name;
      if (loginButton) loginButton.style.display = 'none';
      if (signupButton) signupButton.style.display = 'none';
      if (logoutButton) logoutButton.style.display = 'flex';
    } catch (e) {
      console.error('Error parsing saved user', e);
    }
  }
  
  // Logout button event listener
  if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
      e.preventDefault();
      netlifyIdentity.logout();
    });
  }
}

// Update UI based on authentication state
function updateAuthUI(user, loginButton, signupButton, logoutButton, userGreeting, userName) {
  if (user) {
    // User is logged in
    if (loginButton) loginButton.style.display = 'none';
    if (signupButton) signupButton.style.display = 'none';
    if (logoutButton) logoutButton.style.display = 'flex';
    if (userGreeting) userGreeting.style.display = 'flex';
    
    // Set user name
    if (userName) {
      if (user.user_metadata && user.user_metadata.full_name) {
        userName.textContent = user.user_metadata.full_name;
      } else {
        userName.textContent = user.email;
      }
    }
    
    // Store user info in localStorage
    localStorage.setItem('netlifyUser', JSON.stringify({
      email: user.email,
      name: user.user_metadata?.full_name || user.email
    }));
  } else {
    // User is logged out
    if (loginButton) loginButton.style.display = 'flex';
    if (signupButton) signupButton.style.display = 'flex';
    if (logoutButton) logoutButton.style.display = 'none';
    if (userGreeting) userGreeting.style.display = 'none';
    
    // Remove user info from localStorage
    localStorage.removeItem('netlifyUser');
  }
}

// Check if user is authenticated
function isAuthenticated() {
  return localStorage.getItem('netlifyUser') !== null;
}

// Get current user info
function getCurrentUser() {
  const userData = localStorage.getItem('netlifyUser');
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (e) {
      console.error('Error parsing user data', e);
      return null;
    }
  }
  return null;
}

// Initialize authentication when the DOM is loaded
document.addEventListener('DOMContentLoaded', initAuth); 