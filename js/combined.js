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
// Admin Functionality
// ----------------
function initAdminPanel() {
  // Get admin control elements
  const adminControls = document.getElementById('admin-controls');
  const addLectureBtn = document.getElementById('add-lecture-btn');
  const editStaffBtn = document.getElementById('edit-staff-btn');
  const adminModal = document.getElementById('admin-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  
  if (!adminControls) return;
  
  // Only show admin controls if user has admin role
  const currentUser = getCurrentUser();
  if (!currentUser || !hasRole(currentUser, 'admin')) {
    adminControls.style.display = 'none';
    return;
  }
  
  // Add lecture button event listener
  if (addLectureBtn) {
    addLectureBtn.addEventListener('click', showAddLectureForm);
  }
  
  // Edit staff button event listener
  if (editStaffBtn) {
    editStaffBtn.addEventListener('click', showEditStaffForm);
  }
  
  // Close modal button event listener
  if (closeModalBtn && adminModal) {
    closeModalBtn.addEventListener('click', () => {
      adminModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === adminModal) {
        adminModal.style.display = 'none';
      }
    });
  }
}

function showAddLectureForm() {
  const adminModal = document.getElementById('admin-modal');
  const modalContent = document.getElementById('modal-content');
  
  if (!adminModal || !modalContent) return;
  
  // Set modal title and content
  const modalTitle = adminModal.querySelector('h2');
  if (modalTitle) modalTitle.textContent = 'הוספת שיעור חדש';
  
  // Create form for adding a new lecture
  modalContent.innerHTML = `
    <form id="add-lecture-form">
      <div class="form-group">
        <label for="lecture-number">מספר שיעור</label>
        <input type="number" id="lecture-number" min="1" required>
      </div>
      <div class="form-group">
        <label for="lecture-title">כותרת השיעור</label>
        <input type="text" id="lecture-title" required>
      </div>
      <div class="form-group">
        <label>תוכן השיעור</label>
        <div class="input-options">
          <div class="option-tabs">
            <button type="button" class="option-tab active" data-tab="upload">העלאת קובץ HTML</button>
            <button type="button" class="option-tab" data-tab="paste">הדבקת HTML</button>
          </div>
          <div class="option-content active" id="upload-content">
            <label for="lecture-html-file" class="file-upload-label">
              <i class="fas fa-upload"></i>
              בחר קובץ HTML
            </label>
            <input type="file" id="lecture-html-file" accept=".html,.htm" style="display: none;">
            <div id="file-name-display" class="file-name-display">לא נבחר קובץ</div>
          </div>
          <div class="option-content" id="paste-content">
            <textarea id="lecture-content" rows="10" placeholder="הדבק את קוד ה-HTML כאן"></textarea>
          </div>
        </div>
      </div>
      <button type="submit" class="button">הוסף שיעור</button>
    </form>
    
    <style>
      .input-options {
        border: 1px solid var(--border-color);
        border-radius: 8px;
        overflow: hidden;
      }
      
      .option-tabs {
        display: flex;
        border-bottom: 1px solid var(--border-color);
      }
      
      .option-tab {
        flex: 1;
        background: none;
        border: none;
        padding: 10px;
        cursor: pointer;
        text-align: center;
        color: var(--text-light);
        transition: all 0.3s ease;
      }
      
      .option-tab.active {
        background-color: var(--primary-color);
        color: white;
      }
      
      .option-content {
        display: none;
        padding: 15px;
      }
      
      .option-content.active {
        display: block;
      }
      
      .file-upload-label {
        display: inline-block;
        padding: 10px 15px;
        background-color: var(--primary-color);
        color: white;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      
      .file-upload-label:hover {
        background-color: var(--primary-light);
      }
      
      .file-name-display {
        margin-top: 10px;
        padding: 8px;
        background-color: var(--bg-color);
        border-radius: 4px;
        font-size: 0.9rem;
        color: var(--text-light);
      }
      
      #lecture-content {
        width: 100%;
        resize: vertical;
      }
    </style>
  `;
  
  // Handle option tab switching
  const optionTabs = modalContent.querySelectorAll('.option-tab');
  optionTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      optionTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active content
      const tabType = tab.dataset.tab;
      const contentElements = modalContent.querySelectorAll('.option-content');
      contentElements.forEach(el => el.classList.remove('active'));
      modalContent.querySelector(`#${tabType}-content`).classList.add('active');
    });
  });
  
  // File input change handler
  const fileInput = document.getElementById('lecture-html-file');
  const fileNameDisplay = document.getElementById('file-name-display');
  
  if (fileInput && fileNameDisplay) {
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        fileNameDisplay.textContent = fileInput.files[0].name;
      } else {
        fileNameDisplay.textContent = 'לא נבחר קובץ';
      }
    });
  }
  
  // Add event listener to form submission
  const form = document.getElementById('add-lecture-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const lectureNumber = document.getElementById('lecture-number').value;
      const lectureTitle = document.getElementById('lecture-title').value;
      let lectureContent = '';
      
      // Get content based on active tab
      const activeTab = modalContent.querySelector('.option-tab.active').dataset.tab;
      
      if (activeTab === 'upload') {
        const fileInput = document.getElementById('lecture-html-file');
        if (fileInput.files.length === 0) {
          alert('אנא בחר קובץ HTML');
          return;
        }
        
        // Read the file content
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
          lectureContent = e.target.result;
          // Continue with lecture creation
          createNewLecture(lectureNumber, lectureTitle, lectureContent);
        };
        
        reader.onerror = function() {
          alert('שגיאה בקריאת הקובץ');
        };
        
        reader.readAsText(file);
      } else {
        // Get content from textarea
        lectureContent = document.getElementById('lecture-content').value;
        if (!lectureContent.trim()) {
          alert('אנא הכנס תוכן HTML');
          return;
        }
        
        // Continue with lecture creation
        createNewLecture(lectureNumber, lectureTitle, lectureContent);
      }
    });
  }
  
  // Function to handle lecture creation after content is available
  function createNewLecture(number, title, content) {
    // Here you would normally send this data to your server
    // For now, we'll just show a success message
    alert(`השיעור נוסף בהצלחה: שיעור ${number} - ${title}`);
    
    // Close the modal
    adminModal.style.display = 'none';
    
    // TODO: In a real implementation, this would create a new lecture file
    // and update the list of available lectures
    console.log('Lecture content:', content.substring(0, 100) + '...');
  }
  
  // Show the modal
  adminModal.style.display = 'flex';
}

function showEditStaffForm() {
  const adminModal = document.getElementById('admin-modal');
  const modalContent = document.getElementById('modal-content');
  
  if (!adminModal || !modalContent) return;
  
  // Set modal title and content
  const modalTitle = adminModal.querySelector('h2');
  if (modalTitle) modalTitle.textContent = 'עריכת צוות';
  
  // Create form for editing staff
  modalContent.innerHTML = `
    <form id="edit-staff-form">
      <div id="staff-list">
        <!-- Staff members will be loaded dynamically -->
        <div class="staff-member">
          <div class="form-group">
            <label for="staff-name-1">שם</label>
            <input type="text" id="staff-name-1" value="ישראל ישראלי" required>
          </div>
          <div class="form-group">
            <label for="staff-role-1">תפקיד</label>
            <input type="text" id="staff-role-1" value="מרצה">
          </div>
          <div class="form-group">
            <label for="staff-email-1">אימייל</label>
            <input type="email" id="staff-email-1" value="israel@example.com">
          </div>
          <button type="button" class="delete-staff-btn" data-id="1">מחק</button>
        </div>
      </div>
      
      <button type="button" id="add-staff-member-btn" class="button secondary">הוסף איש צוות</button>
      <button type="submit" class="button">שמור שינויים</button>
    </form>
  `;
  
  // Add event listener to add staff button
  const addStaffBtn = document.getElementById('add-staff-member-btn');
  if (addStaffBtn) {
    addStaffBtn.addEventListener('click', () => {
      const staffList = document.getElementById('staff-list');
      const staffCount = staffList.children.length + 1;
      
      const newStaffMember = document.createElement('div');
      newStaffMember.className = 'staff-member';
      newStaffMember.innerHTML = `
        <div class="form-group">
          <label for="staff-name-${staffCount}">שם</label>
          <input type="text" id="staff-name-${staffCount}" required>
        </div>
        <div class="form-group">
          <label for="staff-role-${staffCount}">תפקיד</label>
          <input type="text" id="staff-role-${staffCount}">
        </div>
        <div class="form-group">
          <label for="staff-email-${staffCount}">אימייל</label>
          <input type="email" id="staff-email-${staffCount}">
        </div>
        <button type="button" class="delete-staff-btn" data-id="${staffCount}">מחק</button>
      `;
      
      staffList.appendChild(newStaffMember);
      
      // Add event listener to delete button
      const deleteBtn = newStaffMember.querySelector('.delete-staff-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          const staffId = e.target.dataset.id;
          const staffMember = document.querySelector(`.staff-member:nth-child(${staffId})`);
          if (staffMember) {
            staffMember.remove();
          }
        });
      }
    });
  }
  
  // Add event listener to form submission
  const form = document.getElementById('edit-staff-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Collect staff data
      const staffMembers = [];
      const staffElements = document.querySelectorAll('.staff-member');
      
      staffElements.forEach((el, index) => {
        const nameInput = el.querySelector(`input[id^="staff-name-"]`);
        const roleInput = el.querySelector(`input[id^="staff-role-"]`);
        const emailInput = el.querySelector(`input[id^="staff-email-"]`);
        
        if (nameInput && nameInput.value) {
          staffMembers.push({
            name: nameInput.value,
            role: roleInput ? roleInput.value : '',
            email: emailInput ? emailInput.value : ''
          });
        }
      });
      
      // Here you would normally send this data to your server
      // For now, we'll just show a success message
      alert(`הצוות עודכן בהצלחה! נשמרו ${staffMembers.length} אנשי צוות.`);
      
      // Close the modal
      adminModal.style.display = 'none';
      
      // TODO: In a real implementation, this would update the staff list in your database
    });
  }
  
  // Initialize delete buttons
  const deleteButtons = document.querySelectorAll('.delete-staff-btn');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const staffId = e.target.dataset.id;
      const staffMember = document.querySelector(`.staff-member:nth-child(${staffId})`);
      if (staffMember) {
        staffMember.remove();
      }
    });
  });
  
  // Show the modal
  adminModal.style.display = 'flex';
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
  const adminControls = document.getElementById('admin-controls');
  
  // For the login page specific elements
  const notLoggedIn = document.getElementById('not-logged-in');
  const loggedIn = document.getElementById('logged-in');
  const goToHomeButton = document.getElementById('go-to-home');
  
  // If no auth buttons found, exit early but still check for admin controls
  if (!loginButton && !signupButton && !notLoggedIn) {
    // Still check for and handle admin controls
    const currentUser = getCurrentUser();
    if (currentUser && adminControls) {
      if (hasRole(currentUser, 'admin')) {
        adminControls.style.display = 'flex';
      } else {
        adminControls.style.display = 'none';
      }
    }
    return;
  }
  
  // Check for saved user in localStorage first (faster than waiting for netlifyIdentity.init)
  const savedUser = localStorage.getItem('netlifyUser');
  if (savedUser) {
    try {
      const userObj = JSON.parse(savedUser);
      console.log("Found saved user:", userObj);
      
      if (userGreeting) userGreeting.style.display = 'flex';
      if (userName) userName.textContent = userObj.name || userObj.email;
      if (loginButton) loginButton.style.display = 'none';
      if (signupButton) signupButton.style.display = 'none';
      if (logoutButton) logoutButton.style.display = 'flex';
      
      // Login page specific
      if (notLoggedIn) notLoggedIn.style.display = 'none';
      if (loggedIn) loggedIn.classList.add('visible');
      
      // Show admin controls if user has admin role
      if (adminControls && userObj.roles && userObj.roles.includes('admin')) {
        adminControls.style.display = 'flex';
      } else if (adminControls) {
        adminControls.style.display = 'none';
      }
    } catch (e) {
      console.error('Error parsing saved user', e);
      localStorage.removeItem('netlifyUser'); // Clear corrupt data
    }
  }
  
  // Event handlers for Netlify Identity
  netlifyIdentity.on('init', user => {
    console.log("Netlify Identity init with user:", user);
    updateAuthUI(user, loginButton, signupButton, logoutButton, userGreeting, userName, notLoggedIn, loggedIn, adminControls);
  });
  
  netlifyIdentity.on('login', user => {
    console.log("Netlify Identity login:", user);
    updateAuthUI(user, loginButton, signupButton, logoutButton, userGreeting, userName, notLoggedIn, loggedIn, adminControls);
    netlifyIdentity.close();
  });
  
  netlifyIdentity.on('logout', () => {
    console.log("Netlify Identity logout");
    updateAuthUI(null, loginButton, signupButton, logoutButton, userGreeting, userName, notLoggedIn, loggedIn, adminControls);
  });
  
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
function updateAuthUI(user, loginButton, signupButton, logoutButton, userGreeting, userName, notLoggedIn, loggedIn, adminControls) {
  if (user) {
    // User is logged in
    console.log("Updating UI for logged in user:", user.email);
    
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
    console.log("Updating UI for logged out user");
    
    if (loginButton) loginButton.style.display = 'flex';
    if (signupButton) signupButton.style.display = 'flex';
    if (logoutButton) logoutButton.style.display = 'none';
    if (userGreeting) userGreeting.style.display = 'none';
    
    // Login page specific
    if (notLoggedIn) notLoggedIn.style.display = 'block';
    if (loggedIn) loggedIn.classList.remove('visible');
    
    // Hide admin controls
    if (adminControls) adminControls.style.display = 'none';
    
    // Remove user info from localStorage
    localStorage.removeItem('netlifyUser');
  }
}

// Get current user info from localStorage
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
  
  return false;
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
  
  // Initialize auth first to properly handle the user state
  initAuth();
  
  // Initialize admin panel (depends on auth being initialized)
  setTimeout(initAdminPanel, 200);
}); 