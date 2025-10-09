# Platform Overview

  VAI is a two-sided marketplace connecting French Polynesian tourism operators with international tourists through two
   interconnected applications:

  1. Tourist App (tourist-app/)

  - Purpose: Tourist-facing Progressive Web App for discovering and booking activities
  - Tech Stack: React 18.2.0 + Vite, Zustand state management
  - Key Features:
    - Mood-based discovery algorithm (innovative emotional engagement)
    - 8-language support (EN, FR, ES, DE, IT, JA, ZH, TY)
    - Multi-currency support (XPF, USD, EUR)
    - Stripe payment integration
    - Real-time chat with operators
    - PWA installable on any device
    - Offline capabilities

  2. Operator Dashboard (operator-dashboard/)

  - Purpose: Business management platform for tourism operators
  - Tech Stack: React 19.1.0, Tailwind CSS
  - Key Features:
    - Template-first activity creation system
    - Automated schedule generation (recurring tours)
    - Booking management & real-time notifications
    - Stripe Connect payment processing (11% commission, 89% to operators)
    - 6-language interface
    - Mobile-responsive design
    - Customer communication (integrated chat)

  Shared Infrastructure

  Database: Single Supabase PostgreSQL instance
  - Shared tables: tours, bookings, booking_conversations, operators, tourist_users
  - Real-time subscriptions for live updates across both apps
  - Row-level security (RLS) for data isolation

  Payment Flow: Stripe Connect marketplace model
  1. Tourist authorizes payment → Operator confirms → Payment captured
  2. 48-hour payout delay after tour completion
  3. Automatic 11%/89% split (platform/operator)

  Core Workflow:
  Operator creates template → Publishes schedule → Tour instances auto-generated
  Tourist discovers on VAI Tickets → Books & pays → Operator receives notification
  Operator confirms → Payment captured → Tour completed → Payout processed

  Business Model

  - Zero upfront costs for operators
  - 11% commission only on confirmed bookings
  - 89% revenue retention for operators (vs 70-80% with foreign OTAs)
  - Focus on tourism dispersal across all 118 French Polynesian islands
  - Cultural authenticity (Tahitian language support)
  
# Database Insights Summary & Platform Integration - Latest Update 08.10.2025

##  Core Database Tables

  1. tours Table - Activity Inventory Hub

  Purpose: Unified table storing both templates and scheduled tour instances

  Key Architecture Features:
  - Template vs Instance System:
    - is_template = true: Reusable activity templates (no date/time)
    - is_template = false: Bookable tour instances (specific date/time)
    - parent_template_id: Links instances back to their template
    - parent_schedule_id: Links instances to recurring schedules
  - Advanced Scheduling:
    - activity_type: 'template' | 'scheduled' | 'last_minute'
    - is_customized: Individual instance modifications
    - is_detached: Detached from schedule (manual control)
    - frozen_fields: Locked fields that don't inherit template updates
    - overrides: Instance-specific field overrides (JSONB)
  - Promotional Pricing:
    - promo_discount_percent: Percentage discount
    - promo_discount_value: Fixed discount amount
    - Calculated fields: final_price_adult, promotional_discount_amount
  - GetYourGuide Channel Manager Integration (In Development):
    - gyg_product_id: Unique GYG product identifier
    - gyg_option_id: GYG option variant
    - gyg_sync_status: 'not_synced' | syncing states
    - gyg_last_sync: Last synchronization timestamp

  Platform Relationship:
  - Operator Dashboard creates templates → publishes schedules → generates instances
  - Tourist App reads active instances from this table
  - Shared by both applications via database views

  ---
  2. bookings Table - Transaction & Revenue Hub

  Purpose: Complete booking lifecycle tracking from authorization to payout

  Commission System:
  - applied_commission_rate: Locked rate at booking confirmation (default 11%)
  - commission_locked_at: Timestamp of rate lock (irreversible)
  - subtotal: Operator's portion (89%)
  - commission_amount: Platform's portion (11%)
  - total_amount: Full booking value (GENERATED COLUMN)

  Payment Flow Tracking:
  - payment_status: 'pending' | 'authorized' | 'paid' | 'refunded' | 'failed'
  - payment_intent_id: Stripe PaymentIntent reference
  - payment_captured_at: When payment was captured
  - stripe_fee: Stripe processing fee
  - stripe_charge_id: Stripe charge reference

  Operator Workflow:
  - booking_status: 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed' | 'no_show'
  - confirmation_deadline: 24-hour operator response deadline
  - confirmed_at: Operator confirmation timestamp
  - operator_response: Confirmation/decline reason

  Payout System:
  - tour_completed_at: Tour completion timestamp
  - payout_scheduled_at: 48-hour payout scheduled time
  - payout_status: 'pending' | 'scheduled' | 'processing' | 'paid' | 'failed'
  - payout_transfer_id: Stripe transfer ID
  - operator_amount_cents: Operator payout (USD cents for Stripe)
  - platform_fee_cents: Platform fee (USD cents)

  Automation Hooks:
  - webhook_sent: n8n webhook triggered
  - whatsapp_sent: WhatsApp notification sent
  - email_sent: Email notification sent
  - operator_whatsapp_sent_at: Operator notification timestamp

  Platform Relationship:
  - Tourist creates booking → Operator receives notification (via triggers)
  - Operator confirms → Payment captured → Tour completed → 48h wait → Payout

  ---
  3. operators Table - Business Entity Registry

  Purpose: Operator profiles and business information

  Key Fields:
  - commission_rate: Operator-specific commission (default 11%, range 0-50%)
  - stripe_connect_account_id: Stripe Connect account
  - stripe_connect_status: 'not_connected' | 'pending' | 'connected' | 'rejected'
  - stripe_charges_enabled: Can accept payments
  - stripe_payouts_enabled: Can receive payouts
  - onboarding_completed_at: Setup completion timestamp
  - operator_role: 'onboarding' | operational role
  - preferred_language: Operator dashboard language (default 'fr')

  Platform Relationship:
  - Links to auth.users via auth_user_id for authentication
  - Commission rate locked to bookings at confirmation
  - Stripe Connect integration for payment processing

  ---
  4. tourist_users Table - Customer Registry

  Purpose: Tourist profiles and preferences

  Key Fields:
  - preferred_language: Tourist app language (default 'en')
  - favorites: JSONB array of saved activities
  - marketing_emails: Consent for marketing
  - auth_user_id: Links to Supabase Auth (optional - guest checkout supported)

  Platform Relationship:
  - Optional authentication (guests can book without account)
  - Links bookings via customer_email for lookup
  - Enables favorites, booking history, messaging features

  ---
  5. schedules Table - Recurring Availability System

  Purpose: Define recurring patterns for template-based tour generation

  Key Fields:
  - template_id: Links to template in tours table
  - recurrence_type: 'daily' | 'weekly' | 'custom'
  - days_of_week: Array of days [0-6] (Sunday=0)
  - start_time: Daily start time
  - start_date / end_date: Active date range
  - exceptions: Array of excluded dates
  - is_paused: Pause schedule without deleting
  - schedule_type: 'template_based' (for future expansion)

  Platform Relationship:
  - Operator creates schedule → System auto-generates tour instances
  - Powers the template-first workflow automation
  - Reduces manual tour creation by 90%

  ---
  6. booking_conversations Table - Communication Hub

  Purpose: Real-time chat between tourists and operators

  Key Fields:
  - booking_id: Links to specific booking
  - sender_type: 'tourist' | 'operator' | 'admin'
  - sender_id: UUID of sender (from respective user table)
  - message_text: Message content
  - is_read: Read receipt tracking

  Platform Relationship:
  - Real-time messaging via Supabase Realtime subscriptions
  - Supports both Tourist App and Operator Dashboard
  - Critical for booking clarifications and customer service

  ---
##  Database Views - Optimized Read Access

  1. active_tours_with_operators - Tourist App Discovery View

  Purpose: Complete activity listings with all necessary metadata

  Features:
  - Joins: tours + templates + schedules + operators
  - Filters: Active tours, non-templates, active operators, non-paused schedules
  - Calculated fields: Effective pricing with overrides, promotional discounts
  - Includes: Operator info (name, rating, logo, WhatsApp), schedule details

  Platform Relationship:
  - Primary data source for Tourist App activity browsing
  - Powers mood-based discovery, explore tab, search
  - Optimized with multiple indexes for fast filtering

  ---
  2. activity_templates_view - Operator Dashboard Template Management

  Purpose: Template listing with operator metadata

  Platform Relationship:
  - Powers Operator Dashboard Templates Tab
  - Shows all templates for operator's management

  ---
  3. schedule_details - Schedule Management View

  Purpose: Schedule overview with linked template data

  Platform Relationship:
  - Powers Operator Dashboard Schedules Tab
  - Shows all schedules with template info, recurrence patterns

  ---
  4. tour_management_dashboard - Advanced Tour Management

  Purpose: Operator's unified view of all tour types and customizations

  Features:
  - Shows management status (Template/Scheduled/Customized/Detached/Last Minute)
  - Frozen fields summary for customized instances
  - Effective pricing with promotional calculations

  ---
##  Trigger Functions - Business Logic Automation

  1. trigger_booking_webhook - n8n Workflow Automation

  What It Does:
  - Fires on booking INSERT/UPDATE
  - Sends comprehensive JSON payload to n8n webhooks
  - Different webhooks for different events:
    - booking_created → New booking notification
    - booking_confirmed → Send confirmation emails
    - booking_declined → Refund processing
    - booking_cancelled → Cancellation workflow
    - booking_completed → Review request
    - payment_status_changed → Payment notifications

  Data Sent to n8n:
  - Complete booking details
  - Tourist information (with preferred_language for email localization)
  - Tour details
  - Operator information (with preferred_language)

  Platform Relationship:
  - Powers email automation, WhatsApp notifications, deadline monitoring
  - Enables customer lifecycle automation without code changes

  ---
  2. create_booking_notification - Real-Time Operator Alerts

  What It Does:
  - Fires on booking INSERT
  - Creates multilingual notification record
  - Supports English and French notification content
  - Links notification to booking for navigation

  Platform Relationship:
  - Powers Operator Dashboard notification center
  - Cross-device notification sync
  - Real-time booking alerts

  ---
  3. auto_populate_schedule_relationship - Smart Linking

  What It Does:
  - Automatically links scheduled tours to their parent schedule
  - Fires on tour INSERT

  Platform Relationship:
  - Ensures data integrity for template-schedule-instance hierarchy
  - Enables proper schedule management and instance tracking

  ---
  4. auto_set_customization_timestamp - Customization Tracking

  What It Does:
  - Automatically timestamps when tour instance is customized
  - Clears timestamp and overrides when un-customized

  Platform Relationship:
  - Tracks which instances have been manually modified
  - Powers customization management features

  ---
##  Row-Level Security (RLS) - Multi-Tenancy Protection

  Tours Table:
  - Operators manage their own tours: Operators can only see/edit tours where operator_id matches their authenticated
  user

  Bookings Table:
  - Public can create bookings: Guest checkout support
  - Operators can view own bookings: Filtered by operator_id
  - Tourists can view own bookings: Filtered by customer_email or user_id
  - Users can link bookings: Tourists can claim bookings made as guest

  Platform Relationship:
  - Ensures data privacy in shared database
  - Supports both authenticated and guest flows
  - Protects operator business data from competitors

  ---
##  Database Indexes - Performance Optimization

  Key Performance Indexes:
  - idx_tours_active_available: Fast filtering for bookable tours
  - idx_bookings_commission_locked: Commission rate queries
  - idx_bookings_timeout_check: Deadline monitoring for auto-decline
  - idx_tours_gyg_product_id: Channel manager lookups
  - idx_tours_promotional_pricing: Promo campaign queries

  ---
##  How Database Supports Platform Business Model

  Commission Lock System:

  Tourist books → Payment authorized → booking.applied_commission_rate = 11%
  → Operator confirms → booking.commission_locked_at = NOW()
  → Rate can never change for this booking

  48-Hour Payout Protection:

  Tour completed → booking.tour_completed_at = NOW()
  → Wait 48 hours (dispute window)
  → booking.payout_scheduled_at = completed_at + 48h
  → Stripe transfer created
  → booking.payout_status = 'paid'

  Template-Schedule-Instance Hierarchy:

  Template (is_template=true, no date)
    ↓
  Schedule (recurrence_type='weekly', days=[1,3,5])
    ↓
  Auto-generated Instances (is_template=false, specific dates)
    ↓
  Individual Customization (is_customized=true, overrides={...})
    ↓
  Detachment (is_detached=true, manual control)

  This database architecture enables VAI's core value proposition: zero-friction onboarding for operators with
  automated tour management and transparent, predictable revenue distribution through commission locking and delayed
  payouts.