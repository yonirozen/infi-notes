/**
 * Combined JavaScript for better performance
 * Includes authentication and dark mode functionality
 */

// ----------------
// Dark Mode Functionality
// ----------------
function initDarkMode() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (!darkModeToggle) return;

  // Check for saved dark mode preference
  if (localStorage.getItem('darkMode') === 'enabled' || 
      (localStorage.getItem('darkMode') === null && 
      window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    darkModeToggle.setAttribute('aria-pressed', 'true');
  }
  
  // Toggle dark mode
  darkModeToggle.addEventListener('click', () => {
    if (document.documentElement.getAttribute('data-theme') === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('darkMode', 'disabled');
      darkModeToggle.setAttribute('aria-pressed', 'false');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('darkMode', 'enabled');
      darkModeToggle.setAttribute('aria-pressed', 'true');
    }
  });
}

// ----------------
// Lecture Loading Functionality
// ----------------
function loadLectures() {
  const lecturesContainer = document.getElementById('lectures-container');
  if (!lecturesContainer) return;
  
  // Array of confirmed lectures (currently 7)
  const availableLectures = [1, 2, 3, 4, 5, 6, 7];
  
  // Create a card for each available lecture
  availableLectures.forEach(num => {
    // Format the lecture number with leading zero if needed
    const paddedNum = num.toString().padStart(2, '0');
    
    // Create lecture card
    const card = document.createElement('a');
    card.href = `lectures/lecture${num}.html`;
    card.className = 'lecture-card';
    
    // Card content
    card.innerHTML = `
      <div class="card-content">
        <div>
          <h2 class="card-title">שיעור ${num}</h2>
        </div>
        <div class="card-footer">
          <span class="view-button">
            <i class="fas fa-arrow-left"></i>
            צפייה בשיעור
          </span>
        </div>
      </div>
    `;
    
    // Add card to container
    lecturesContainer.appendChild(card);
  });
  
  // Check for additional lectures using fetch
  checkForAdditionalLectures(availableLectures);
}

function checkForAdditionalLectures(knownLectures) {
  const maxToCheck = 20; // Reasonable upper limit to check
  const lecturesContainer = document.getElementById('lectures-container');
  if (!lecturesContainer) return;
  
  // Check for lecture files beyond our known list
  for (let i = Math.max(...knownLectures) + 1; i <= maxToCheck; i++) {
    fetch(`lectures/lecture${i}.html`, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          // File exists, create a card for it
          const paddedNum = i.toString().padStart(2, '0');
          
          const card = document.createElement('a');
          card.href = `lectures/lecture${i}.html`;
          card.className = 'lecture-card';
          
          card.innerHTML = `
            <div class="card-content">
              <div>
                <h2 class="card-title">שיעור ${i}</h2>
              </div>
              <div class="card-footer">
                <span class="view-button">
                  <i class="fas fa-arrow-left"></i>
                  צפייה בשיעור
                </span>
              </div>
            </div>
          `;
          
          lecturesContainer.appendChild(card);
        }
      })
      .catch(() => {
        // File doesn't exist, do nothing
      });
  }
}

// ----------------
// Authentication Functionality
// ----------------
function initAuth() {
  // Check if netlifyIdentity is available (run this after window load)
  if (typeof netlifyIdentity === 'undefined') {
    console.log('Netlify Identity widget not loaded yet or not used on this page');
    return;
  }
  
  // Get UI elements if they exist
  const loginButton = document.getElementById('login-button');
  const signupButton = document.getElementById('signup-button');
  const logoutButton = document.getElementById('logout-button');
  const userGreeting = document.getElementById('user-greeting');
  const userName = document.getElementById('user-name');
  
  // For the login page specific elements
  const notLoggedIn = document.getElementById('not-logged-in');
  const loggedIn = document.getElementById('logged-in');
  const goToHomeButton = document.getElementById('go-to-home');
  
  // If we're on a page without auth UI, exit gracefully
  if ((!loginButton && !notLoggedIn) || (!signupButton && !notLoggedIn)) {
    return;
  }
  
  // Event handlers for Netlify Identity
  netlifyIdentity.on('init', user => {
    updateAuthUI(user, loginButton, signupButton, logoutButton, userGreeting, userName, notLoggedIn, loggedIn);
  });
  
  netlifyIdentity.on('login', user => {
    updateAuthUI(user, loginButton, signupButton, logoutButton, userGreeting, userName, notLoggedIn, loggedIn);
    netlifyIdentity.close();
  });
  
  netlifyIdentity.on('logout', () => {
    updateAuthUI(null, loginButton, signupButton, logoutButton, userGreeting, userName, notLoggedIn, loggedIn);
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
      
      // Login page specific
      if (notLoggedIn) notLoggedIn.style.display = 'none';
      if (loggedIn) loggedIn.classList.add('visible');
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
  
  // Go to home button for login page
  if (goToHomeButton) {
    goToHomeButton.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
}

// Update UI based on authentication state
function updateAuthUI(user, loginButton, signupButton, logoutButton, userGreeting, userName, notLoggedIn, loggedIn) {
  if (user) {
    // User is logged in
    if (loginButton) loginButton.style.display = 'none';
    if (signupButton) signupButton.style.display = 'none';
    if (logoutButton) logoutButton.style.display = 'flex';
    if (userGreeting) userGreeting.style.display = 'flex';
    
    // Login page specific
    if (notLoggedIn) notLoggedIn.style.display = 'none';
    if (loggedIn) loggedIn.classList.add('visible');
    
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
    
    // Login page specific
    if (notLoggedIn) notLoggedIn.style.display = 'block';
    if (loggedIn) loggedIn.classList.remove('visible');
    
    // Remove user info from localStorage
    localStorage.removeItem('netlifyUser');
  }
}

// Check if user is authenticated
function isAuthenticated() {
  return localStorage.getItem('netlifyUser') !== null;
}

// Initialize everything when the page has loaded
window.addEventListener('load', function() {
  // Initialize dark mode first (doesn't depend on external scripts)
  initDarkMode();
  
  // Load lectures if we're on the index page
  loadLectures();
  
  // Initialize auth with a small delay to ensure Netlify Identity has loaded
  setTimeout(initAuth, 100);
}); 