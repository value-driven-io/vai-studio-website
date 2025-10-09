/**
 * VAI Embed Mode Hook
 *
 * Detects when the app is loaded inside an iframe (embed mode)
 * and provides utilities for communicating with the parent window.
 *
 * Usage:
 * const { isEmbedMode, embedParams, sendToParent } = useEmbedMode();
 */

import { useState, useEffect } from 'react';

/**
 * Check if running in iframe
 * @returns {boolean}
 */
function isInIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    // If we can't access window.top due to cross-origin, we're definitely in an iframe
    return true;
  }
}

/**
 * Get embed parameters from URL
 * @returns {object}
 */
function getEmbedParams() {
  const params = new URLSearchParams(window.location.search);

  return {
    isEmbed: params.get('embed') === 'true',
    operatorId: params.get('operator_id'),
    tourId: params.get('tour_id'),
    scheduleId: params.get('schedule_id'),
    participants: params.get('participants'),
    language: params.get('lang'),
    version: params.get('version')
  };
}

/**
 * Custom hook for embed mode detection and communication
 * @returns {object} Embed mode state and utilities
 */
export function useEmbedMode() {
  const [isEmbedMode, setIsEmbedMode] = useState(false);
  const [embedParams, setEmbedParams] = useState({});

  useEffect(() => {
    const params = getEmbedParams();
    const inIframe = isInIframe();

    // Only set embed mode if both conditions are true
    setIsEmbedMode(params.isEmbed && inIframe);
    setEmbedParams(params);

    // Send iframe loaded message to parent
    if (params.isEmbed && inIframe) {
      sendToParent('vai:iframe:loaded', {
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  /**
   * Send postMessage to parent window
   * @param {string} type - Message type
   * @param {object} data - Message data
   */
  const sendToParent = (type, data = {}) => {
    if (!isEmbedMode) return;

    try {
      window.parent.postMessage(
        {
          type,
          ...data,
          source: 'vai-embed'
        },
        '*' // In production, you might want to restrict this to specific origins
      );
    } catch (error) {
      console.error('[VAI Embed] Failed to send message to parent:', error);
    }
  };

  /**
   * Send error message to parent
   * @param {string} message - Error message
   */
  const sendError = (message) => {
    sendToParent('vai:error', { message });
  };

  /**
   * Send booking complete message to parent
   * @param {string} bookingId - Booking ID
   * @param {object} bookingData - Additional booking data
   */
  const sendBookingComplete = (bookingId, bookingData = {}) => {
    sendToParent('vai:booking:complete', {
      bookingId,
      ...bookingData
    });
  };

  return {
    isEmbedMode,
    embedParams,
    sendToParent,
    sendError,
    sendBookingComplete
  };
}

export default useEmbedMode;
