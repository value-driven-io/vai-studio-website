/**
 * VAI Embed Widget - Modal Component
 *
 * Creates a full-screen modal overlay with:
 * - Dark mode support (auto-detect)
 * - Custom theme colors (CSS variables)
 * - Accessibility (ARIA labels, keyboard navigation)
 * - Multiple close methods (button, overlay click, Escape key)
 */

import { t } from './i18n.js';

/**
 * Creates modal overlay element
 * @param {boolean} isDarkMode - Whether to apply dark mode styling
 * @param {string|null} themeColor - Custom theme color (hex)
 * @returns {HTMLElement} Modal overlay element
 */
export function createModalOverlay(isDarkMode = false, themeColor = null) {
  const overlay = document.createElement('div');
  overlay.className = `vai-modal-overlay${isDarkMode ? ' dark-mode' : ''}`;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'VAI Booking Modal');

  // Apply custom theme color if provided
  if (themeColor && /^#[0-9A-F]{6}$/i.test(themeColor)) {
    overlay.style.setProperty('--vai-theme-color', themeColor);
    // Calculate darker shade for hover (simple darken by 15%)
    const darker = darkenColor(themeColor, 15);
    overlay.style.setProperty('--vai-theme-color-dark', darker);
  }

  // Create modal structure
  overlay.innerHTML = `
    <div class="vai-modal-content">
      <button
        class="vai-modal-close"
        aria-label="${t('close')}"
        type="button"
      >
        <span aria-hidden="true">×</span>
      </button>
      <div class="vai-modal-loading" role="status" aria-live="polite">
        ${t('loading')}
      </div>
    </div>
  `;

  // Setup close handlers
  setupCloseHandlers(overlay);

  return overlay;
}

/**
 * Setup all modal close handlers
 * @param {HTMLElement} overlay - Modal overlay element
 */
function setupCloseHandlers(overlay) {
  // Close on overlay background click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal(overlay);
    }
  });

  // Close on close button click
  const closeButton = overlay.querySelector('.vai-modal-close');
  closeButton.addEventListener('click', () => {
    closeModal(overlay);
  });

  // Close on Escape key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal(overlay);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  // Store handler for cleanup
  overlay._escHandler = escHandler;
}

/**
 * Close modal and cleanup
 * @param {HTMLElement} overlay - Modal overlay element
 */
function closeModal(overlay) {
  // Remove overlay
  overlay.remove();

  // Restore body scroll
  document.body.style.overflow = '';

  // Cleanup escape key listener
  if (overlay._escHandler) {
    document.removeEventListener('keydown', overlay._escHandler);
  }

  // Restore focus to previously focused element
  if (overlay._previousFocus && overlay._previousFocus.focus) {
    overlay._previousFocus.focus();
  }
}

/**
 * Show modal
 * @param {HTMLElement} overlay - Modal overlay element
 */
export function showModal(overlay) {
  // Store currently focused element for restoration later
  overlay._previousFocus = document.activeElement;

  // Add to DOM
  document.body.appendChild(overlay);

  // Prevent body scroll
  document.body.style.overflow = 'hidden';

  // Focus close button for accessibility
  const closeButton = overlay.querySelector('.vai-modal-close');
  if (closeButton) {
    closeButton.focus();
  }
}

/**
 * Hide loading state and show iframe
 * @param {HTMLElement} overlay - Modal overlay element
 */
export function hideLoading(overlay) {
  const loading = overlay.querySelector('.vai-modal-loading');
  if (loading) {
    loading.style.display = 'none';
  }
}

/**
 * Show error message
 * @param {HTMLElement} overlay - Modal overlay element
 * @param {string} message - Error message
 */
export function showError(overlay, message = t('error')) {
  const content = overlay.querySelector('.vai-modal-content');
  const errorDiv = document.createElement('div');
  errorDiv.className = 'vai-modal-error';
  errorDiv.setAttribute('role', 'alert');
  errorDiv.textContent = message;
  content.appendChild(errorDiv);
}

/**
 * Darken a hex color by percentage
 * @param {string} hex - Hex color (e.g., '#0066cc')
 * @param {number} percent - Percentage to darken (0-100)
 * @returns {string} Darkened hex color
 */
function darkenColor(hex, percent) {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Darken
  const factor = 1 - (percent / 100);
  const newR = Math.round(r * factor);
  const newG = Math.round(g * factor);
  const newB = Math.round(b * factor);

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// Export close function for external use
export { closeModal };
