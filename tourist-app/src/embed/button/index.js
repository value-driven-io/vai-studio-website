/**
 * VAI Embed Widget - Main Entry Point
 *
 * Provides two integration methods:
 * 1. Auto-initialize: Add data attributes to buttons
 * 2. Programmatic: Call VAI.createBookingButton(config)
 *
 * Bundle target: <12KB gzipped
 */

import './styles.css'; // Import CSS for Vite to inline
import { createModalOverlay, showModal, hideLoading, showError } from './modal.js';
import { track } from '../../lib/analytics/stub.js';
import { t, getCurrentLanguage } from './i18n.js';

// Configuration
const CONFIG = {
  iframeBaseUrl: import.meta.env.PROD
    ? 'https://vai-tickets-staging.onrender.com'
    : 'http://localhost:3001',
  embedVersion: '1.0.0'
};

/**
 * Detects if operator's site uses dark mode
 * @returns {boolean} True if dark mode detected
 */
function detectDarkMode() {
  // Method 1: Check CSS media query
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return true;
  }

  // Method 2: Check for common dark mode class on html/body
  const root = document.documentElement;
  const body = document.body;
  const darkClassNames = ['dark', 'dark-mode', 'theme-dark'];

  for (const className of darkClassNames) {
    if (root.classList.contains(className) || body.classList.contains(className)) {
      return true;
    }
  }

  // Method 3: Check background color brightness
  const bgColor = window.getComputedStyle(body).backgroundColor;
  if (bgColor) {
    const rgb = bgColor.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
      const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
      return brightness < 128; // Dark if brightness < 50%
    }
  }

  return false;
}

/**
 * Validates required configuration
 * @param {object} config - Button configuration
 * @returns {object|null} Error object if invalid, null if valid
 */
function validateConfig(config) {
  if (!config.operatorId || typeof config.operatorId !== 'string') {
    return { message: 'operatorId is required and must be a string' };
  }

  if (!config.templateId || typeof config.templateId !== 'string') {
    return { message: 'templateId is required and must be a string' };
  }

  // Validate theme color format if provided
  if (config.themeColor && !/^#[0-9A-F]{6}$/i.test(config.themeColor)) {
    return { message: 'themeColor must be a valid hex color (e.g., #FF5722)' };
  }

  return null;
}

/**
 * Builds iframe URL with embed parameters
 * @param {object} config - Button configuration
 * @returns {string} Full iframe URL
 */
function buildIframeUrl(config) {
  // Build URL to template page with embed parameter
  const params = new URLSearchParams({
    embed: 'true',
    operator_id: config.operatorId,
    lang: getCurrentLanguage(),
    version: CONFIG.embedVersion
  });

  // Add optional parameters
  if (config.participants) {
    params.set('participants', config.participants);
  }

  // Open template page (user selects date/schedule from there)
  return `${CONFIG.iframeBaseUrl}/template/${config.templateId}?${params.toString()}`;
}

/**
 * Setup postMessage handler for iframe communication
 * @param {HTMLElement} overlay - Modal overlay element
 * @param {object} config - Button configuration
 */
function setupPostMessageHandler(overlay, config) {
  const handler = (event) => {
    // Security: Verify origin
    const allowedOrigins = [
      'https://tourist.vai.studio',
      'https://vai-tickets-staging.onrender.com',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:4173'
    ];

    if (!allowedOrigins.includes(event.origin)) {
      return;
    }

    // Handle booking completion
    if (event.data.type === 'vai:booking:complete') {
      track('embed.booking.completed', {
        operator_id: config.operatorId,
        template_id: config.templateId,
        booking_id: event.data.bookingId
      });

      // Call onBookingComplete callback if provided
      if (config.onBookingComplete && typeof config.onBookingComplete === 'function') {
        config.onBookingComplete(event.data);
      }

      // Auto-close modal after 2 seconds
      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = '';
      }, 2000);
    }

    // Handle iframe loaded
    if (event.data.type === 'vai:iframe:loaded') {
      hideLoading(overlay);
    }

    // Handle errors
    if (event.data.type === 'vai:error') {
      showError(overlay, event.data.message || t('error'));
      track('embed.error', {
        operator_id: config.operatorId,
        template_id: config.templateId,
        error: event.data.message
      });
    }
  };

  window.addEventListener('message', handler);

  // Cleanup handler when modal closes
  overlay.addEventListener('remove', () => {
    window.removeEventListener('message', handler);
  });
}

/**
 * Opens booking modal
 * @param {object} config - Button configuration
 * @returns {HTMLElement|null} Modal overlay element or null if error
 */
function openBookingModal(config) {
  // Validate configuration
  const error = validateConfig(config);
  if (error) {
    console.error('[VAI Embed]', error.message);
    track('embed.error', {
      operator_id: config.operatorId || 'unknown',
      error: error.message
    });
    return null;
  }

  // Detect dark mode
  const isDarkMode = config.darkMode !== undefined ? config.darkMode : detectDarkMode();

  // Create modal overlay
  const overlay = createModalOverlay(isDarkMode, config.themeColor);

  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.className = 'vai-modal-iframe';
  iframe.src = buildIframeUrl(config);
  iframe.allow = 'payment'; // Allow Stripe payment iframe
  iframe.setAttribute('title', 'VAI Booking');

  // Add iframe to modal content
  const modalContent = overlay.querySelector('.vai-modal-content');
  modalContent.appendChild(iframe);

  // Setup postMessage communication
  setupPostMessageHandler(overlay, config);

  // Setup iframe error handling
  iframe.addEventListener('error', () => {
    showError(overlay, t('error'));
    track('embed.iframe.error', {
      operator_id: config.operatorId,
      template_id: config.templateId
    });
  });

  // Show modal
  showModal(overlay);

  // Track analytics
  track('embed.modal.opened', {
    operator_id: config.operatorId,
    template_id: config.templateId,
    dark_mode: isDarkMode,
    theme_color: config.themeColor,
    language: getCurrentLanguage()
  });

  return overlay;
}

/**
 * Creates a booking button (Programmatic API)
 * @param {object} config - Button configuration
 * @param {string} config.operatorId - Operator ID (required)
 * @param {string} config.templateId - Template ID (required)
 * @param {number} [config.participants] - Number of participants (optional)
 * @param {string} [config.buttonText] - Custom button text (optional)
 * @param {string} [config.themeColor] - Custom theme color hex (optional)
 * @param {boolean} [config.darkMode] - Force dark mode (optional, auto-detect if not set)
 * @param {function} [config.onBookingComplete] - Callback when booking completes (optional)
 * @returns {HTMLElement} Button element
 */
export function createBookingButton(config) {
  const button = document.createElement('button');
  button.className = 'vai-booking-button';
  button.textContent = config.buttonText || 'Book Now';
  button.type = 'button';

  // Add click handler
  button.addEventListener('click', () => {
    openBookingModal(config);
  });

  // Track widget initialization
  track('embed.widget.loaded', {
    operator_id: config.operatorId,
    template_id: config.templateId,
    integration_method: 'programmatic'
  });

  return button;
}

/**
 * Auto-initialize buttons with data attributes
 * Looks for buttons with data-vai-operator and data-vai-template
 */
function autoInitialize() {
  const buttons = document.querySelectorAll('[data-vai-operator][data-vai-template]');

  buttons.forEach((button) => {
    // Skip if already initialized
    if (button.hasAttribute('data-vai-initialized')) {
      return;
    }

    // Mark as initialized
    button.setAttribute('data-vai-initialized', 'true');

    // Extract configuration from data attributes
    const config = {
      operatorId: button.getAttribute('data-vai-operator'),
      templateId: button.getAttribute('data-vai-template'),
      participants: button.getAttribute('data-vai-participants') || undefined,
      themeColor: button.getAttribute('data-vai-theme') || undefined,
      darkMode: button.hasAttribute('data-vai-dark') ? button.getAttribute('data-vai-dark') === 'true' : undefined
    };

    // Add click handler
    button.addEventListener('click', (e) => {
      e.preventDefault();
      openBookingModal(config);
    });

    // Track widget initialization
    track('embed.widget.loaded', {
      operator_id: config.operatorId,
      template_id: config.templateId,
      integration_method: 'data-attributes'
    });
  });
}

/**
 * Initialize on DOM ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoInitialize);
} else {
  // DOM already loaded
  autoInitialize();
}

// Watch for dynamically added buttons
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      autoInitialize();
      break; // Only run once per batch
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Export public API
export default {
  createBookingButton,
  version: CONFIG.embedVersion
};

// Global namespace for non-module usage
if (typeof window !== 'undefined') {
  window.VAI = window.VAI || {};
  window.VAI.createBookingButton = createBookingButton;
  window.VAI.version = CONFIG.embedVersion;
}
