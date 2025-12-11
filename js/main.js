/**
 * Portfolio Website - Main JavaScript
 * Handles Lenis smooth scroll, infinite carousel navigation, and overlay interactions
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
const projectNumbers = document.querySelectorAll('.project-number');
const clientNameEl = document.getElementById('client-name');
const scopeTypeEl = document.getElementById('scope-type');
const aboutOverlay = document.getElementById('about-overlay');
const aboutLink = document.querySelector('[data-section="about"]');
const closeAboutBtn = document.querySelector('.about-overlay__close');

// ============================================
// State
// ============================================
let currentSlideIndex = 1; // Start at 1 because index 0 is the cloned last slide
let currentProjectIndex = 0;
let isScrolling = false;
let isTransitioning = false;
let scrollTimeout = null;
let lenis = null;
let totalSlides = 0;

// ============================================
// Initialize
// ============================================
function init() {
  setupInfiniteCarousel();
  initLenis();
  setupScrollHijacking();
  setupProjectNavigation();
  setupAboutOverlay();
  updateActiveProject(0);
}

// ============================================
// Infinite Carousel Setup - Clone slides for seamless loop
// ============================================
function setupInfiniteCarousel() {
  const originalSlides = document.querySelectorAll('.project');
  totalSlides = originalSlides.length;
  
  // Clone the last slide and prepend it
  const lastSlideClone = originalSlides[totalSlides - 1].cloneNode(true);
  lastSlideClone.classList.add('clone');
  lastSlideClone.setAttribute('data-clone', 'last');
  projectsContainer.insertBefore(lastSlideClone, originalSlides[0]);
  
  // Clone the first slide and append it
  const firstSlideClone = originalSlides[0].cloneNode(true);
  firstSlideClone.classList.add('clone');
  firstSlideClone.setAttribute('data-clone', 'first');
  projectsContainer.appendChild(firstSlideClone);
  
  // Update container width to account for cloned slides (original + 2 clones)
  projectsContainer.style.width = `${(totalSlides + 2) * 100}vw`;
  
  // Start at the first real slide (index 1, since 0 is the cloned last slide)
  currentSlideIndex = 1;
  projectsContainer.style.transform = `translateX(-${currentSlideIndex * 100}vw)`;
  
  // Listen for transition end to handle seamless jump
  projectsContainer.addEventListener('transitionend', handleTransitionEnd);
}

function handleTransitionEnd() {
  if (!isTransitioning) return;
  isTransitioning = false;
  
  // If we're at the cloned first slide (after the last real slide), jump to real first
  if (currentSlideIndex === totalSlides + 1) {
    projectsContainer.style.transition = 'none';
    currentSlideIndex = 1;
    projectsContainer.style.transform = `translateX(-${currentSlideIndex * 100}vw)`;
    // Force reflow to apply the instant change
    projectsContainer.offsetHeight;
    projectsContainer.style.transition = '';
  }
  
  // If we're at the cloned last slide (before the first real slide), jump to real last
  if (currentSlideIndex === 0) {
    projectsContainer.style.transition = 'none';
    currentSlideIndex = totalSlides;
    projectsContainer.style.transform = `translateX(-${currentSlideIndex * 100}vw)`;
    // Force reflow to apply the instant change
    projectsContainer.offsetHeight;
    projectsContainer.style.transition = '';
  }
}

// ============================================
// Lenis Smooth Scroll Initialization
// ============================================
function initLenis() {
  // Initialize Lenis with smooth scrolling
  lenis = new Lenis({
    autoRaf: true,
    lerp: 0.1,
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    // Prevent default scroll behavior since we're handling horizontal scroll
    prevent: (node) => {
      // Allow scrolling in about overlay
      return aboutOverlay.classList.contains('active');
    }
  });

  // Listen for Lenis scroll events
  lenis.on('scroll', (e) => {
    // Optional: log scroll progress
    // console.log(e);
  });
}

// ============================================
// Scroll Hijacking - Convert vertical/horizontal scroll to horizontal with infinite loop
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
      navigateSlide(delta > 0 ? 1 : -1);
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
  navigateSlide(delta > 0 ? 1 : -1);
  
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
      navigateSlide(1);
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      e.preventDefault();
      navigateSlide(-1);
      break;
  }
}

// ============================================
// Project Navigation with True Infinite Loop
// ============================================
function setupProjectNavigation() {
  projectNumbers.forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index, 10);
      goToProject(index);
    });
  });
}

function navigateSlide(direction) {
  if (isTransitioning) return;
  
  isTransitioning = true;
  currentSlideIndex += direction;
  
  // Apply the transform with transition
  projectsContainer.style.transform = `translateX(-${currentSlideIndex * 100}vw)`;
  
  // Calculate the actual project index (accounting for clones)
  // Slide indices: 0=clonedLast, 1=project1, 2=project2, 3=project3, 4=project4, 5=clonedFirst
  let projectIndex = currentSlideIndex - 1;
  
  // Handle wrap-around for UI updates
  if (projectIndex < 0) {
    projectIndex = totalSlides - 1;
  } else if (projectIndex >= totalSlides) {
    projectIndex = 0;
  }
  
  currentProjectIndex = projectIndex;
  updateActiveProject(currentProjectIndex);
}

function goToProject(projectIndex) {
  if (isTransitioning) return;
  
  // Convert project index to slide index (add 1 because of prepended clone)
  const targetSlideIndex = projectIndex + 1;
  
  if (targetSlideIndex === currentSlideIndex) return;
  
  isTransitioning = true;
  currentSlideIndex = targetSlideIndex;
  currentProjectIndex = projectIndex;
  
  projectsContainer.style.transform = `translateX(-${currentSlideIndex * 100}vw)`;
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
  // Stop Lenis while overlay is open
  if (lenis) {
    lenis.stop();
  }
}

function closeAbout() {
  aboutOverlay.classList.remove('active');
  document.body.style.overflow = '';
  // Resume Lenis when overlay is closed
  if (lenis) {
    lenis.start();
  }
}

// ============================================
// Start the application
// ============================================
document.addEventListener('DOMContentLoaded', init);
