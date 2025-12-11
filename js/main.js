/**
 * Portfolio Website - Main JavaScript
 * Handles scroll hijacking, project navigation, and overlay interactions
 */

// ============================================
// Project Data (Dynamic Content)
// ============================================
const projects = [
  {
    id: 1,
    image: 'images/project1.svg',
    client: 'Zamana Studios',
    scope: 'Website'
  },
  {
    id: 2,
    image: 'images/project2.svg',
    client: 'Atelier Noir',
    scope: 'Branding'
  },
  {
    id: 3,
    image: 'images/project3.svg',
    client: 'Vertex Labs',
    scope: 'Web App'
  },
  {
    id: 4,
    image: 'images/project4.svg',
    client: 'Maison Collective',
    scope: 'E-Commerce'
  }
];

// ============================================
// DOM Elements
// ============================================
const projectsContainer = document.querySelector('.projects-container');
const projectSections = document.querySelectorAll('.project');
const projectNumbers = document.querySelectorAll('.project-number');
const clientNameEl = document.getElementById('client-name');
const scopeTypeEl = document.getElementById('scope-type');
const aboutOverlay = document.getElementById('about-overlay');
const aboutLink = document.querySelector('[data-section="about"]');
const closeAboutBtn = document.querySelector('.about-overlay__close');

// ============================================
// State
// ============================================
let currentProjectIndex = 0;
let isScrolling = false;
let scrollTimeout = null;

// ============================================
// Initialize
// ============================================
function init() {
  setupScrollHijacking();
  setupProjectNavigation();
  setupAboutOverlay();
  updateActiveProject(0);
}

// ============================================
// Scroll Hijacking - Convert vertical/horizontal scroll to horizontal
// ============================================
function setupScrollHijacking() {
  // Handle wheel events (mouse wheel, trackpad)
  document.addEventListener('wheel', handleWheel, { passive: false });
  
  // Handle touch events for mobile
  let touchStartX = 0;
  let touchStartY = 0;
  
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  
  document.addEventListener('touchmove', (e) => {
    if (aboutOverlay.classList.contains('active')) return;
    
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    const deltaX = touchStartX - touchEndX;
    const deltaY = touchStartY - touchEndY;
    
    // Use the larger delta for scroll direction
    const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
    
    if (Math.abs(delta) > 10) {
      e.preventDefault();
      scrollToProject(delta > 0 ? currentProjectIndex + 1 : currentProjectIndex - 1);
      touchStartX = touchEndX;
      touchStartY = touchEndY;
    }
  }, { passive: false });
  
  // Handle keyboard navigation
  document.addEventListener('keydown', handleKeydown);
}

function handleWheel(e) {
  // Don't hijack scroll if about overlay is open
  if (aboutOverlay.classList.contains('active')) return;
  
  e.preventDefault();
  
  // Debounce scroll to prevent rapid firing
  if (isScrolling) return;
  
  // Get the scroll delta (combine vertical and horizontal)
  const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
  
  // Threshold to prevent accidental small scrolls
  if (Math.abs(delta) < 30) return;
  
  isScrolling = true;
  
  // Determine scroll direction and navigate
  if (delta > 0) {
    scrollToProject(currentProjectIndex + 1);
  } else {
    scrollToProject(currentProjectIndex - 1);
  }
  
  // Reset scrolling flag after animation
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    isScrolling = false;
  }, 600);
}

function handleKeydown(e) {
  if (aboutOverlay.classList.contains('active')) {
    if (e.key === 'Escape') {
      closeAbout();
    }
    return;
  }
  
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      e.preventDefault();
      scrollToProject(currentProjectIndex + 1);
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      e.preventDefault();
      scrollToProject(currentProjectIndex - 1);
      break;
  }
}

// ============================================
// Project Navigation
// ============================================
function setupProjectNavigation() {
  projectNumbers.forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index, 10);
      scrollToProject(index);
    });
  });
}

function scrollToProject(index) {
  // Clamp index to valid range
  const newIndex = Math.max(0, Math.min(index, projects.length - 1));
  
  if (newIndex === currentProjectIndex && index >= 0 && index < projects.length) {
    return;
  }
  
  currentProjectIndex = newIndex;
  
  // Scroll to the project section
  const targetSection = projectSections[currentProjectIndex];
  if (targetSection) {
    projectsContainer.style.transform = `translateX(-${currentProjectIndex * 100}vw)`;
  }
  
  // Update UI
  updateActiveProject(currentProjectIndex);
}

function updateActiveProject(index) {
  // Update project numbers
  projectNumbers.forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });
  
  // Update client and scope with fade effect
  const project = projects[index];
  if (project) {
    // Add transition class for smooth text change
    clientNameEl.style.opacity = '0';
    scopeTypeEl.style.opacity = '0';
    
    setTimeout(() => {
      clientNameEl.textContent = project.client;
      scopeTypeEl.textContent = project.scope;
      clientNameEl.style.opacity = '1';
      scopeTypeEl.style.opacity = '1';
    }, 150);
  }
}

// ============================================
// About Overlay
// ============================================
function setupAboutOverlay() {
  // Open about overlay
  aboutLink.addEventListener('click', (e) => {
    e.preventDefault();
    openAbout();
  });
  
  // Close about overlay
  closeAboutBtn.addEventListener('click', closeAbout);
  
  // Close on overlay background click
  aboutOverlay.addEventListener('click', (e) => {
    if (e.target === aboutOverlay) {
      closeAbout();
    }
  });
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && aboutOverlay.classList.contains('active')) {
      closeAbout();
    }
  });
}

function openAbout() {
  aboutOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAbout() {
  aboutOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ============================================
// Start the application
// ============================================
document.addEventListener('DOMContentLoaded', init);

