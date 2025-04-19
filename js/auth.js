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
  const adminControls = document.getElementById('admin-controls');
  
  // If we're on a page without auth UI, exit gracefully
  if (!loginButton || !signupButton) {
    // Still check for admin controls even if no login UI exists
    if (adminControls) {
      const currentUser = getCurrentUser();
      if (currentUser && hasRole(currentUser, 'admin')) {
        adminControls.style.display = 'flex';
      } else {
        adminControls.style.display = 'none';
      }
    }
    return;
  }
  
  // Event handlers for Netlify Identity
  netlifyIdentity.on('init', user => {
    updateAuthUI(user, loginButton, signupButton, logoutButton, userGreeting, userName, adminControls);
  });
  
  netlifyIdentity.on('login', user => {
    updateAuthUI(user, loginButton, signupButton, logoutButton, userGreeting, userName, adminControls);
    netlifyIdentity.close();
  });
  
  netlifyIdentity.on('logout', () => {
    updateAuthUI(null, loginButton, signupButton, logoutButton, userGreeting, userName, adminControls);
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
      
      // Show admin controls if user has admin role
      if (adminControls && userObj.roles && userObj.roles.includes('admin')) {
        adminControls.style.display = 'flex';
      } else if (adminControls) {
        adminControls.style.display = 'none';
      }
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
function updateAuthUI(user, loginButton, signupButton, logoutButton, userGreeting, userName, adminControls) {
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
    
    // Get user roles
    const roles = user.app_metadata && user.app_metadata.roles ? user.app_metadata.roles : [];
    
    // Show admin controls if user has admin role
    if (adminControls) {
      if (hasRole(user, 'admin')) {
        adminControls.style.display = 'flex';
      } else {
        adminControls.style.display = 'none';
      }
    }
    
    // Store user info in localStorage
    localStorage.setItem('netlifyUser', JSON.stringify({
      email: user.email,
      name: user.user_metadata?.full_name || user.email,
      roles: roles
    }));
  } else {
    // User is logged out
    if (loginButton) loginButton.style.display = 'flex';
    if (signupButton) signupButton.style.display = 'flex';
    if (logoutButton) logoutButton.style.display = 'none';
    if (userGreeting) userGreeting.style.display = 'none';
    if (adminControls) adminControls.style.display = 'none';
    
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

// Check if user has a specific role
function hasRole(user, role) {
  if (!user) return false;
  
  // Check if the user object has roles directly
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.includes(role);
  }
  
  // Check if the user object has app_metadata.roles
  if (user.app_metadata && user.app_metadata.roles) {
    return user.app_metadata.roles.includes(role);
  }
  
  return false;
}

// Initialize authentication when the DOM is loaded
document.addEventListener('DOMContentLoaded', initAuth); 