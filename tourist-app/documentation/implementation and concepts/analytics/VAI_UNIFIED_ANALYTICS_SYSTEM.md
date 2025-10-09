# VAI Unified Analytics System

**Project Type:** Platform Infrastructure
**Status:** Planning Phase
**Priority:** High (Foundational)
**Owner:** TBD
**Timeline:** 6 months (Post Embed Widget MVP)

---

## Executive Summary

### The Problem
VAI currently has **no unified analytics system**. Each feature that needs tracking would create its own table:
- Embed Widget → `embed_analytics` table
- Tourist App → `page_views` table
- Operator Dashboard → `operator_actions` table
- Future products (VAI Maps, VAI Skills) → more fragmented tables

**Result:** Impossible to analyze cross-product user journeys, fragmented data, duplicate code.

### The Solution
Build a **single, unified analytics system** that all VAI products use:
- One `events` table for all platform interactions
- Shared analytics module (`src/lib/analytics`)
- Product-agnostic design (works for Tourist App, Operator Dashboard, Embed Widget, future products)
- Privacy-first (GDPR compliant, auto-anonymization)

---

## Design Principles

### 1. Product-Agnostic
Analytics module should know nothing about specific products. It just tracks events.

```javascript
// ❌ BAD: Product-specific logic in analytics
if (source === 'embed') {
  trackEmbedWidgetLoad();
} else if (source === 'tourist_app') {
  trackTouristPageView();
}

// ✅ GOOD: Generic event tracking
track(eventName, properties);
```

### 2. Privacy-First
- No PII in event names (use `user_id` references, not emails/names)
- Auto-anonymize after retention period
- GDPR-compliant (users can request data deletion)
- Configurable retention policies (default: 365 days)

### 3. Performance-Optimized
- **Batch events** (send every 5 events or 10 seconds, not on every action)
- **Async writes** (don't block UI)
- **Partitioned tables** (auto-partition `events` by month for fast queries)
- **Pre-computed metrics** (daily aggregations for dashboards)

---

## Database Schema

### Events Table (Main)

```sql
-- Single events table for ALL platform interactions
-- Partitioned by month for performance
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- What happened
  event_name TEXT NOT NULL,              -- 'embed.widget.loaded', 'tourist.tour.viewed', 'operator.booking.confirmed'
  event_category TEXT NOT NULL,          -- 'engagement', 'conversion', 'navigation', 'error'

  -- Who did it
  user_id UUID,                          -- Tourist or operator user ID (if authenticated)
  session_id UUID NOT NULL,              -- Anonymous session tracking (survives page refreshes)
  user_type TEXT,                        -- 'tourist', 'operator', 'anonymous'

  -- Where did it happen
  source TEXT NOT NULL,                  -- 'tourist_app', 'operator_dashboard', 'embed', 'api'
  channel TEXT,                          -- 'organic', 'operator_website', 'social', 'direct', 'paid'
  referrer TEXT,                         -- HTTP referrer
  page_url TEXT,                         -- Current page URL

  -- Context (JSONB for flexibility)
  properties JSONB,                      -- Event-specific data
  -- Examples:
  -- { operator_id, tour_id, booking_id, amount, currency }
  -- { search_query, filters_applied }
  -- { error_message, stack_trace }

  -- Device/Browser (auto-detected)
  user_agent TEXT,
  device_type TEXT,                      -- 'mobile', 'tablet', 'desktop'
  browser TEXT,                          -- 'Chrome', 'Safari', 'Firefox'
  os TEXT,                               -- 'iOS', 'Android', 'Windows', 'macOS'

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Privacy compliance
  anonymized BOOLEAN DEFAULT FALSE,      -- PII removed?
  retention_days INTEGER DEFAULT 365     -- Auto-delete after N days
) PARTITION BY RANGE (created_at);

-- Create partitions (automated via cron job)
CREATE TABLE events_2025_10 PARTITION OF events
  FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

CREATE TABLE events_2025_11 PARTITION OF events
  FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

-- Indexes for fast queries
CREATE INDEX idx_events_name_created ON events(event_name, created_at DESC);
CREATE INDEX idx_events_source_created ON events(source, created_at DESC);
CREATE INDEX idx_events_session ON events(session_id, created_at);
CREATE INDEX idx_events_user ON events(user_id, created_at) WHERE user_id IS NOT NULL;
CREATE INDEX idx_events_properties ON events USING GIN(properties); -- JSONB search
CREATE INDEX idx_events_category ON events(event_category, created_at DESC);
```

### Metrics Table (Pre-Computed)

```sql
-- Daily aggregated metrics for dashboards
CREATE TABLE metrics_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name TEXT NOT NULL,           -- 'embed.conversion_rate', 'tourist.bookings'
  metric_value NUMERIC,
  dimensions JSONB,                    -- { operator_id, tour_type, device_type }
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_metrics_name_date ON metrics_daily(metric_name, date DESC);
CREATE INDEX idx_metrics_dimensions ON metrics_daily USING GIN(dimensions);
```

---

## Analytics Module API

### Core Implementation

```javascript
// tourist-app/src/lib/analytics/index.js
// Shared by Tourist App, Operator Dashboard, Embed Widget

import { createClient } from '@supabase/supabase-js';

class VAIAnalytics {
  constructor() {
    this.batch = [];
    this.batchSize = 5;
    this.batchTimeout = 10000; // 10 seconds
    this.sessionId = this.getOrCreateSessionId();
  }

  /**
   * Track an event
   * @param {string} eventName - Event name (e.g. 'tourist.tour.viewed')
   * @param {object} properties - Event-specific data
   */
  track(eventName, properties = {}) {
    const event = {
      event_name: eventName,
      event_category: this.inferCategory(eventName),
      session_id: this.sessionId,
      user_id: this.getCurrentUserId(),
      user_type: this.getCurrentUserType(),
      source: this.getSource(),
      channel: this.getChannel(),
      referrer: document.referrer,
      page_url: window.location.href,
      properties: properties,
      user_agent: navigator.userAgent,
      device_type: this.getDeviceType(),
      browser: this.getBrowser(),
      os: this.getOS(),
      created_at: new Date().toISOString()
    };

    this.addToBatch(event);
  }

  // Batch management
  addToBatch(event) {
    this.batch.push(event);

    if (this.batch.length >= this.batchSize) {
      this.flush();
    } else {
      this.scheduleFlush();
    }
  }

  scheduleFlush() {
    if (this.flushTimer) return;

    this.flushTimer = setTimeout(() => {
      this.flush();
      this.flushTimer = null;
    }, this.batchTimeout);
  }

  async flush() {
    if (this.batch.length === 0) return;

    const eventsToSend = [...this.batch];
    this.batch = [];

    try {
      await supabase.from('events').insert(eventsToSend);
    } catch (error) {
      console.error('Analytics error:', error);
      // Retry logic or error tracking
    }
  }

  // Helper functions
  inferCategory(eventName) {
    if (eventName.includes('booking') || eventName.includes('purchase')) return 'conversion';
    if (eventName.includes('view') || eventName.includes('loaded')) return 'engagement';
    if (eventName.includes('click') || eventName.includes('select')) return 'interaction';
    if (eventName.includes('error')) return 'error';
    return 'other';
  }

  getSource() {
    if (window.location.hostname === 'app.vai.studio') return 'tourist_app';
    if (window.location.hostname === 'dashboard.vai.studio') return 'operator_dashboard';
    return 'embed';
  }

  getCurrentUserId() {
    const session = supabase.auth.getSession();
    return session?.user?.id || null;
  }

  getCurrentUserType() {
    if (this.getSource() === 'operator_dashboard') return 'operator';
    if (this.getSource() === 'tourist_app' && this.getCurrentUserId()) return 'tourist';
    return 'anonymous';
  }

  getOrCreateSessionId() {
    let sessionId = sessionStorage.getItem('vai_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('vai_session_id', sessionId);
    }
    return sessionId;
  }

  getDeviceType() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  getBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edge')) return 'Edge';
    return 'Other';
  }

  getOS() {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone')) return 'iOS';
    return 'Other';
  }

  getChannel() {
    const utmSource = new URLSearchParams(window.location.search).get('utm_source');
    if (utmSource) return utmSource;

    const referrer = document.referrer;
    if (!referrer) return 'direct';
    if (referrer.includes('google')) return 'organic_search';
    if (referrer.includes('facebook') || referrer.includes('instagram')) return 'social';
    return 'referral';
  }
}

// Export singleton
export const analytics = new VAIAnalytics();

// Convenience function
export const track = (eventName, properties) => {
  analytics.track(eventName, properties);
};
```

---

## Usage Examples

### Tourist App

```javascript
import { track } from '@/lib/analytics';

// Page view
track('tourist.page.viewed', { page: 'explore' });

// Tour interaction
track('tourist.tour.viewed', {
  tour_id: 'abc-123',
  tour_type: 'Whale Watching',
  price: 26000
});

track('tourist.tour.favorited', { tour_id: 'abc-123' });

// Booking
track('tourist.booking.started', { tour_id: 'abc-123' });
track('tourist.booking.completed', {
  booking_id: 'xyz-789',
  amount: 26000,
  currency: 'XPF',
  num_adults: 2,
  num_children: 1
});

// Search
track('tourist.search.performed', {
  query: 'snorkeling',
  filters: { location: 'Moorea', date: '2025-10-15' },
  results_count: 12
});

// Errors
track('tourist.error.occurred', {
  error_type: 'payment_failed',
  error_message: 'Card declined',
  tour_id: 'abc-123'
});
```

### Operator Dashboard

```javascript
import { track } from '@/lib/analytics';

// Template management
track('operator.template.created', {
  template_id: 'def-456',
  tour_type: 'Snorkeling'
});

track('operator.schedule.published', {
  schedule_id: 'ghi-789',
  recurrence: 'weekly',
  start_date: '2025-10-10',
  end_date: '2025-12-31'
});

// Booking management
track('operator.booking.confirmed', {
  booking_id: 'xyz-789',
  response_time_seconds: 120
});

track('operator.booking.declined', {
  booking_id: 'xyz-789',
  reason: 'Weather conditions'
});

// Revenue tracking
track('operator.payout.received', {
  payout_id: 'payout-123',
  amount: 234000,
  currency: 'XPF',
  bookings_count: 9
});
```

### Embed Widget

```javascript
import { track } from '@/lib/analytics';

// Widget lifecycle
track('embed.widget.loaded', {
  operator_id: 'moorea-diving',
  tour_id: 'abc-123',
  source_url: 'https://moorea-diving.pf/tours/whale-watching'
});

track('embed.modal.opened', {
  operator_id: 'moorea-diving',
  tour_id: 'abc-123'
});

track('embed.booking.completed', {
  booking_id: 'xyz-789',
  operator_id: 'moorea-diving',
  source_url: 'https://moorea-diving.pf'
});
```

---

## Dashboard Queries

### Embed Widget Conversion Funnel

```sql
SELECT
  COUNT(*) FILTER (WHERE event_name = 'embed.widget.loaded') AS widget_loads,
  COUNT(*) FILTER (WHERE event_name = 'embed.modal.opened') AS modal_opens,
  COUNT(*) FILTER (WHERE event_name = 'embed.booking.completed') AS bookings,
  (COUNT(*) FILTER (WHERE event_name = 'embed.booking.completed')::float /
   NULLIF(COUNT(*) FILTER (WHERE event_name = 'embed.widget.loaded'), 0)) * 100 AS conversion_rate
FROM events
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND event_name LIKE 'embed.%';
```

### Cross-Product Journey Analysis

```sql
-- Did tourist discover on VAI Tickets, then book via embed?
WITH tourist_sessions AS (
  SELECT
    session_id,
    ARRAY_AGG(event_name ORDER BY created_at) AS event_sequence,
    ARRAY_AGG(source ORDER BY created_at) AS source_sequence
  FROM events
  WHERE user_type IN ('tourist', 'anonymous')
    AND created_at >= NOW() - INTERVAL '7 days'
  GROUP BY session_id
)
SELECT
  COUNT(*) FILTER (WHERE 'tourist_app' = ANY(source_sequence) AND 'embed' = ANY(source_sequence)) AS cross_channel_journeys,
  COUNT(*) FILTER (WHERE source_sequence[array_length(source_sequence, 1)] = 'tourist_app') AS vai_tickets_conversions,
  COUNT(*) FILTER (WHERE source_sequence[1] = 'embed') AS direct_embed_conversions
FROM tourist_sessions
WHERE 'booking.completed' = ANY(event_sequence);
```

### Top Performing Operators (Embed Channel)

```sql
SELECT
  properties->>'operator_id' AS operator_id,
  COUNT(*) AS bookings,
  SUM((properties->>'amount')::integer) AS total_revenue,
  AVG((properties->>'amount')::integer) AS avg_booking_value
FROM events
WHERE event_name = 'embed.booking.completed'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY properties->>'operator_id'
ORDER BY bookings DESC
LIMIT 10;
```

---

## Implementation Roadmap

### Month 1-2: Planning & Design
- [ ] Finalize event taxonomy (naming conventions)
- [ ] Design dashboard mockups (Operator + Admin)
- [ ] Privacy audit (GDPR compliance review)
- [ ] Document event catalog

### Month 3-4: Core Development
- [ ] Create `events` table with partitioning
- [ ] Build analytics module (`src/lib/analytics`)
- [ ] Implement batching logic
- [ ] Add to Tourist App
- [ ] Add to Operator Dashboard
- [ ] Add to Embed Widget

### Month 5: Dashboards
- [ ] Operator Dashboard: Analytics page
- [ ] Admin Dashboard: Platform metrics
- [ ] Pre-compute daily aggregations (metrics_daily)
- [ ] Export functionality (CSV/PDF)

### Month 6: Production & Optimization
- [ ] Performance testing (handle 10k events/min)
- [ ] Auto-anonymization cron job
- [ ] Data retention policy enforcement
- [ ] Monitoring & alerting (Sentry integration)
- [ ] Launch to production

---

## Privacy & Compliance

### GDPR Requirements

1. **Right to Access**: Users can request their data
2. **Right to Deletion**: Users can request data deletion
3. **Data Minimization**: Only collect necessary data
4. **Retention Limits**: Auto-delete after 365 days (configurable)

### Implementation

```sql
-- User data export
CREATE FUNCTION export_user_data(p_user_id UUID)
RETURNS JSONB AS $$
  SELECT jsonb_agg(events)
  FROM events
  WHERE user_id = p_user_id;
$$ LANGUAGE SQL;

-- User data deletion
CREATE FUNCTION delete_user_data(p_user_id UUID)
RETURNS VOID AS $$
  DELETE FROM events WHERE user_id = p_user_id;
$$ LANGUAGE SQL;

-- Auto-anonymization (runs daily)
CREATE OR REPLACE FUNCTION anonymize_old_events()
RETURNS VOID AS $$
BEGIN
  UPDATE events
  SET anonymized = TRUE,
      user_id = NULL,
      properties = properties - 'email' - 'phone' - 'name'
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND anonymized = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Schedule via pg_cron
SELECT cron.schedule('anonymize-events', '0 2 * * *', 'SELECT anonymize_old_events();');
```

---

## Event Taxonomy (Naming Conventions)

### Format
`{product}.{object}.{action}`

Examples:
- `tourist.tour.viewed`
- `operator.booking.confirmed`
- `embed.widget.loaded`

### Categories
- **Engagement**: `loaded`, `viewed`, `scrolled`
- **Interaction**: `clicked`, `selected`, `toggled`
- **Conversion**: `booking.started`, `booking.completed`, `purchase.completed`
- **Error**: `error.occurred`, `payment.failed`

---

## Next Steps

1. **Create event catalog** (comprehensive list of all events across products)
2. **Build analytics module** (core functionality)
3. **Integrate into Tourist App** (first product)
4. **Beta test** (validate performance and usability)
5. **Roll out to all products** (Operator Dashboard, Embed Widget, future products)

---

## Related Documents

- [Embed Widget Spec](../embed%20system/VAI_EMBED_WIDGET_PROJECT_SPEC.md) - How embed uses analytics
- [Tourist App Master Spec](../../VAI_TICKETS_MASTER_SPECIFICATION.md)
- [Operator Dashboard Master Spec](../../../../operator-dashboard/documentation/VAI_OPERATOR_DASHBOARD_MASTER_SPECIFICATION.md)
