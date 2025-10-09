/**
 * VAI Analytics - Stub Implementation (MVP)
 *
 * This is a lightweight stub for the embed widget MVP.
 * Logs events to console for development/debugging.
 *
 * FUTURE: Will be replaced with full analytics module that writes to
 * the unified `events` table. See: VAI_UNIFIED_ANALYTICS_SYSTEM.md
 *
 * Interface matches production analytics module for easy swap later.
 */

/**
 * Track an analytics event
 * @param {string} eventName - Event name (e.g., 'embed.widget.loaded')
 * @param {object} properties - Event properties (operator_id, tour_id, etc.)
 */
export const track = (eventName, properties = {}) => {
  const event = {
    event_name: eventName,
    timestamp: new Date().toISOString(),
    source: 'embed',
    ...properties
  };

  // MVP: Console log only
  console.log('[VAI Analytics]', event);

  // TODO: Production implementation
  // await supabase.from('events').insert({
  //   event_name: eventName,
  //   properties: properties,
  //   source: 'embed',
  //   session_id: getSessionId(),
  //   created_at: new Date().toISOString()
  // });
};

/**
 * Track multiple events in batch
 * @param {Array} events - Array of {eventName, properties} objects
 */
export const trackBatch = (events) => {
  events.forEach(({ eventName, properties }) => {
    track(eventName, properties);
  });
};

/**
 * Identify user (for future use)
 * @param {string} userId - User ID
 * @param {object} traits - User traits
 */
export const identify = (userId, traits = {}) => {
  console.log('[VAI Analytics] Identify:', { userId, traits });
  // TODO: Production implementation
};

// Export default for convenience
export default { track, trackBatch, identify };
