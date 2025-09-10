VAI Operator: Process Flows & Workflows

  1. User Registration & Onboarding Flows

  1.1 Operator Registration Process

  START → Registration Form (Multi-step)
  ├── Step 1: Company Information
  │   ├── Company name, contact person, email (required)
  │   ├── WhatsApp number (optional)
  │   ├── Island selection (required)
  │   └── Language preference selection
  ├── Step 2: Business Details (HIDDEN - skipped to Step 3)
  │   ├── Business description
  │   ├── Tour types selection (multi-select)
  │   ├── Target booking volume
  │   └── Customer type preferences
  ├── Step 3: Terms & Legal
  │   ├── Terms acceptance (required)
  │   ├── Marketing emails opt-in (optional)
  │   └── Founding member program enrollment
  └── SUBMIT → Backend Processing
      ├── Create tourist_users record (dual-role capability)
      ├── Create operators record (status: pending)
      ├── Generate temp password (format: VAI_email)
      ├── Create Supabase Auth user
      ├── Send webhook notification to admin
      ├── Return login credentials for immediate access
      └── Redirect to PendingApprovalScreen

  1.2 Approval Process Flow

  Registration Complete → Pending Status
  ├── Operator can login immediately with temp password
  ├── Access limited dashboard (pending approval)
  ├── Auto-refresh status every 30 seconds
  ├── Admin reviews application (external process)
  └── Status Change Event
      ├── APPROVED → status: 'active'
      │   ├── Full platform access unlocked
      │   ├── Force password change modal
      │   └── Redirect to full dashboard
      ├── SUSPENDED → status: 'suspended'
      │   ├── Account locked message
      │   └── Contact support instructions
      └── REJECTED → status: 'inactive'
          ├── Account disabled
          └── Reapplication process

  1.3 Password Security Flow

  Login Success → Password Security Check
  ├── Check: auth_setup_completed flag
  ├── Check: temp_password existence
  └── Decision Matrix:
      ├── Status=pending + no auth_setup → Show pending screen
      ├── Status=active + no auth_setup → FORCE password change
      ├── Status=suspended + no auth_setup → Show suspended message
      └── Auth_setup=true → Normal dashboard access

  Password Change Modal (Context-Aware):
  ├── FORCED (cannot dismiss)
  │   ├── No current password required
  │   ├── New password + confirm
  │   ├── Password strength validation (5 requirements)
  │   └── Update auth_setup_completed = true
  ├── VOLUNTARY (can dismiss)
  │   ├── Current password verification
  │   ├── New password + confirm
  │   ├── Prevent same password reuse
  │   └── Success without auth_setup change
  └── RESET (password reset link)
      ├── No current password required
      ├── Clear temp_password
      └── Set auth_setup_completed = true

  2. Authentication & Session Management Flows

  2.1 Login Process Flow

  Login Attempt → Supabase Auth
  ├── Email/password validation
  ├── AUTH SUCCESS → Operator Lookup
  │   ├── Query operators table by auth_user_id
  │   ├── OPERATOR FOUND → Status Check
  │   │   ├── Status=active → Full access + password check
  │   │   ├── Status=pending → Limited access + pending screen
  │   │   ├── Status=suspended → Error + contact support
  │   │   └── Status=inactive → Error + reapplication
  │   └── OPERATOR NOT FOUND → Sign out + error message
  └── AUTH FAILURE → Localized error display
      ├── Invalid credentials → "Email or password incorrect"
      ├── Too many attempts → "Too many login attempts"
      ├── Network error → "Connection problem, try again"
      └── Unknown error → Generic error message

  2.2 Session Persistence & Chrome Compatibility

  App Load → Session Check (Chrome-Safe)
  ├── getSession() with 3-second timeout
  │   ├── SUCCESS → Operator data retrieval
  │   └── TIMEOUT → Rely on onAuthStateChange
  ├── onAuthStateChange listener setup
  │   ├── SIGNED_IN → Operator lookup with 5-second timeout
  │   ├── SIGNED_OUT → Clear operator state
  │   └── ERROR → Handle gracefully, maintain UI
  └── Session Restoration
      ├── Valid session → Restore operator state
      ├── Invalid session → Clear state + redirect to login
      └── Network issues → Show connection error

  2.3 Cross-Platform Authentication (AuthCallback)

  Auth Callback URL → User Type Detection
  ├── Check URL parameters (type=recovery for password reset)
  ├── Get Supabase session
  ├── OPERATOR CHECK (Priority)
  │   ├── Query operators by auth_user_id
  │   ├── FOUND → Status-based redirect
  │   │   ├── Active → VAI Operator Dashboard
  │   │   ├── Pending → VAI Operator with pending message
  │   │   └── Suspended → Error message
  │   └── NOT FOUND → Tourist check
  ├── TOURIST CHECK (Fallback)
  │   ├── Query tourist_users by auth_user_id
  │   ├── FOUND → Redirect to VAI Tickets
  │   └── NOT FOUND → Account not found error
  └── ERROR HANDLING → Appropriate app redirect with error message

  3. Tour Management Flows

  3.1 Tour Creation Process

  Create Tab → Tour Creation Form
  ├── Basic Information
  │   ├── Tour name (required)
  │   ├── Tour type selection from predefined list
  │   ├── Description with rich text support
  │   └── Duration and capacity settings
  ├── Pricing Configuration
  │   ├── Base price in XPF (required)
  │   ├── Commission rate display (automatic calculation)
  │   ├── Operator share calculation
  │   └── Final customer price preview
  ├── Location & Logistics
  │   ├── Meeting point specification
  │   ├── Island/location selection
  │   ├── Transportation details
  │   └── Special requirements/equipment
  ├── Media & Marketing
  │   ├── Photo uploads (multiple)
  │   ├── Video links (optional)
  │   ├── Marketing description
  │   └── Tags and categories
  └── PUBLISH → Database Insert
      ├── Create tours record
      ├── Link to operator
      ├── Set status: 'active'
      ├── Generate tour ID
      └── Success notification + redirect to dashboard

  3.2 Schedule Management Process

  Schedules Tab → Schedule Creation Modal
  ├── Tour Selection (from operator's active tours)
  ├── Recurrence Pattern Setup
  │   ├── Type: once, daily, weekly, monthly
  │   ├── Weekly: Day-of-week selection (visual calendar)
  │   │   ├── Individual day toggles
  │   │   ├── Quick select: weekdays, weekends, all days
  │   │   └── Visual feedback with selected days summary
  │   ├── Start time configuration
  │   └── Date range (start date → end date)
  ├── Exception Dates (Optional)
  │   ├── Add specific dates to skip
  │   ├── Holiday/maintenance exclusions
  │   ├── Visual calendar integration
  │   └── Exception list management
  ├── Real-time Preview Generation
  │   ├── Auto-generate schedule preview
  │   ├── Show first 10 instances
  │   ├── Date, time, and day name display
  │   └── Exception highlighting
  └── SAVE → Schedule Processing
      ├── Validate date ranges
      ├── Generate all tour instances
      ├── Create schedule record
      ├── Link to tour and operator
      └── Success confirmation

  4. Booking Management Flows

  4.1 Booking Reception & Processing

  Customer Books Tour (External) → Booking Creation
  ├── Booking data received from VAI Tickets platform
  ├── Database Insert (bookings table)
  │   ├── Link to tour, operator, customer
  │   ├── Set initial status: 'pending'
  │   ├── Payment intent creation
  │   └── Generate booking reference
  ├── Real-time Notification Trigger
  │   ├── WebSocket notification to operator dashboard
  │   ├── Push notification (if configured)
  │   ├── Email notification to operator
  │   └── Badge counter update in navigation
  └── Operator Dashboard Update
      ├── Booking appears in BookingsTab
      ├── Pending status indicator
      ├── Customer information display
      └── Action buttons available

  4.2 Booking Status Management

  Booking Status Updates → Multi-Channel Synchronization
  ├── Status Change Triggers
  │   ├── Operator manual action
  │   ├── Payment status change
  │   ├── Customer action (cancellation)
  │   └── System automated change (expiry)
  ├── Status Transition Rules
  │   ├── pending → confirmed (payment authorized)
  │   ├── confirmed → cancelled (operator/customer action)
  │   ├── confirmed → completed (post-tour)
  │   └── completed → paid (payout processed)
  ├── Real-time Updates
  │   ├── Database update
  │   ├── WebSocket broadcast
  │   ├── UI state synchronization
  │   └── Notification dispatch
  └── Audit Trail
      ├── Status change logging
      ├── User action tracking
      ├── Timestamp recording
      └── Reason code storage

  4.3 Booking Detail Management

  Booking Detail Modal → Comprehensive Management
  ├── Customer Information Display
  │   ├── Contact details
  │   ├── Booking preferences
  │   ├── Special requirements
  │   └── Booking history
  ├── Tour Details
  │   ├── Tour information
  │   ├── Date and time
  │   ├── Meeting point
  │   └── Capacity status
  ├── Payment Information
  │   ├── Payment status indicator
  │   ├── Amount breakdown
  │   ├── Commission calculation
  │   └── Payment action buttons
  ├── Communication Hub
  │   ├── Chat history display
  │   ├── Real-time messaging
  │   ├── Message status indicators
  │   └── File sharing capability
  └── Action Center
      ├── Status change buttons
      ├── Payment actions
      ├── Cancellation processing
      └── Tour completion marking

  5. Payment & Financial Flows

  5.1 Stripe Connect Integration Flow

  Operator Registration → Stripe Account Setup
  ├── Country Selection (25+ supported countries)
  │   ├── Recommended: France (for French Polynesia)
  │   ├── Popular: US, Australia, New Zealand
  │   └── Full list with regional notes
  ├── Stripe Connect Account Creation
  │   ├── Generate account with business_type: 'individual'
  │   ├── Set operator_country from selection
  │   ├── Create onboarding URL
  │   └── Open Stripe onboarding in new window
  ├── Onboarding Process (External - Stripe)
  │   ├── Business information collection
  │   ├── Bank account verification
  │   ├── Identity verification
  │   └── Compliance requirements
  ├── Account Status Monitoring
  │   ├── Real-time status checks
  │   ├── Requirements tracking
  │   ├── Capabilities monitoring (charges_enabled, payouts_enabled)
  │   └── Issues detection and alerts
  └── Integration Complete
      ├── Account ID storage
      ├── Commission rate configuration
      ├── Payout schedule setup
      └── Dashboard integration active

  5.2 Payment Processing Flow

  Customer Payment → Stripe Processing
  ├── Payment Intent Creation (External - VAI Tickets)
  │   ├── Amount calculation (tour price)
  │   ├── Commission split calculation
  │   ├── Payment intent generation
  │   └── Authorization request
  ├── Payment Authorization
  │   ├── Customer card processing
  │   ├── Authorization hold placed
  │   ├── Booking status → 'confirmed'
  │   └── Operator notification sent
  ├── Payment Capture (Conditional)
  │   ├── Automatic: 24 hours before tour
  │   ├── Manual: Operator-triggered
  │   ├── Conditions: booking confirmed, tour not cancelled
  │   └── Status update → 'captured'
  ├── Tour Completion Process
  │   ├── Operator marks tour complete
  │   ├── 48-hour payout delay starts
  │   ├── Payout eligibility calculation
  │   └── Status tracking updates
  └── Payout Processing
      ├── Eligibility check (48 hours post-completion)
      ├── Commission deduction
      ├── Transfer to operator Stripe account
      ├── Confirmation and tracking
      └── Status → 'paid'

  5.3 Manual Payment Management

  Payment Actions → Operator Controls
  ├── Manual Capture
  │   ├── Conditions: payment authorized, tour not cancelled
  │   ├── Stripe API call to capture payment
  │   ├── Database status update
  │   ├── Notification to customer
  │   └── Commission calculation and split
  ├── Refund Processing
  │   ├── Confirmation dialog with amount
  │   ├── Reason selection (dropdown)
  │   ├── Stripe refund API call
  │   ├── Database update and audit trail
  │   └── Customer and operator notifications
  ├── Payment Investigation
  │   ├── Direct Stripe dashboard link
  │   ├── Payment intent details
  │   ├── Transaction history view
  │   └── Dispute management access
  └── Error Handling
      ├── Network failure recovery
      ├── API error interpretation
      ├── User-friendly error messages
      └── Retry mechanism with exponential backoff

  6. Communication & Messaging Flows

  6.1 Real-time Chat System

  Chat Initiation → WebSocket Connection
  ├── Booking Eligibility Check
  │   ├── Status must be 'confirmed'
  │   ├── Customer and operator authentication
  │   └── Permission validation
  ├── Chat Modal Opening
  │   ├── Load existing conversation history
  │   ├── Enrich messages with sender information
  │   ├── Mark messages as read (for current user)
  │   └── Auto-scroll to latest message
  ├── Real-time Subscription Setup
  │   ├── Subscribe to booking_conversations table
  │   ├── Filter by booking_id
  │   ├── Event deduplication system
  │   └── Connection health monitoring
  ├── Message Exchange
  │   ├── Optimistic UI updates
  │   ├── Real-time delivery to other party
  │   ├── Read status synchronization
  │   ├── Typing indicators (planned)
  │   └── Delivery confirmations
  └── Message Persistence
      ├── Database storage
      ├── Message history preservation
      ├── Search capability (planned)
      └── Export functionality (planned)

  6.2 Notification System Flow

  Event Trigger → Notification Pipeline
  ├── Event Sources
  │   ├── New booking received
  │   ├── Payment status changes
  │   ├── Customer messages
  │   ├── System announcements
  │   └── Tour completion reminders
  ├── Notification Processing
  │   ├── Event validation and filtering
  │   ├── User preference checking
  │   ├── Language localization
  │   ├── Template selection and rendering
  │   └── Delivery channel determination
  ├── Multi-Channel Delivery
  │   ├── In-app notifications (immediate)
  │   ├── Push notifications (cross-device)
  │   ├── Email notifications (configurable)
  │   ├── SMS/WhatsApp (planned)
  │   └── Badge counter updates
  ├── Notification Management
  │   ├── Read/unread status tracking
  │   ├── Notification history
  │   ├── Bulk mark as read
  │   ├── Notification preferences
  │   └── Do not disturb settings
  └── Analytics & Monitoring
      ├── Delivery success rates
      ├── User engagement metrics
      ├── Channel performance analysis
      └── System health monitoring

  7. User Interface & Experience Flows

  7.1 Onboarding Tour Flow

  First Login (New Operator) → Onboarding Detection
  ├── Check: localStorage for tour completion
  ├── Check: Operator tour creation count (new operators)
  ├── Tour Eligibility → Start Interactive Tour
  │   ├── Step 1: Welcome & Platform Overview
  │   ├── Step 2: Dashboard Statistics Explanation
  │   ├── Step 3: Tour Creation Guidance
  │   ├── Step 4: Booking Management Introduction
  │   └── Step 5: Completion & Next Steps
  ├── Tour Mechanics
  │   ├── UI element highlighting with blue glow
  │   ├── Contextual tooltip positioning
  │   ├── Progress tracking (1 of 5, 40% complete)
  │   ├── Navigation controls (Previous, Next, Skip)
  │   └── Mobile-responsive positioning
  ├── Tour Completion
  │   ├── localStorage flag setting
  │   ├── Completion celebration
  │   ├── Next steps guidance
  │   └── Tour restart option (via notifications)
  └── Tour Management
      ├── Admin-triggered tour restart
      ├── User-requested tour replay
      ├── Tour progress analytics
      └── A/B testing capability (planned)

  7.2 Navigation & State Management

  App Navigation → State Synchronization
  ├── Bottom Tab Navigation (Mobile-First)
  │   ├── Dashboard (analytics overview)
  │   ├── Create (tour creation)
  │   ├── Bookings (booking management) + badge
  │   └── Profile (settings and account)
  ├── Badge Management
  │   ├── Pending bookings counter
  │   ├── Unread messages counter
  │   ├── Real-time updates via WebSocket
  │   └── Visual attention indicators
  ├── State Persistence
  │   ├── Active tab memory
  │   ├── Form data preservation
  │   ├── Filter preferences storage
  │   └── Session state management
  └── Responsive Behavior
      ├── Mobile: Bottom navigation
      ├── Tablet: Sidebar navigation
      ├── Desktop: Full sidebar + top nav
      └── Touch-friendly interactions

  8. Administrative & Control Flows

  8.1 Admin Settings & Controls

  Admin Configuration → Platform Behavior
  ├── Global Settings Management
  │   ├── Minimum tour date restrictions
  │   ├── Commission rate defaults
  │   ├── Feature flags and toggles
  │   └── Maintenance mode controls
  ├── Role-Based Permissions
  │   ├── Onboarding operators (restricted)
  │   │   ├── Date restrictions enforced
  │   │   ├── Tour creation limited
  │   │   └── Educational mode active
  │   └── Verified operators (full access)
  │       ├── No date restrictions
  │       ├── Full feature access
  │       └── Advanced capabilities
  ├── Operator Status Management
  │   ├── Approval workflow controls
  │   ├── Suspension and reactivation
  │   ├── Role upgrades and downgrades
  │   └── Account termination procedures
  └── Platform Monitoring
      ├── Usage analytics and reporting
      ├── Performance monitoring
      ├── Error tracking and alerting
      └── Business intelligence dashboards

  8.2 Approval & Moderation Flow

  Operator Application → Admin Review Process
  ├── Application Submission (Automatic)
  │   ├── Webhook notification to admin systems
  │   ├── Application data validation
  │   ├── Duplicate operator checking
  │   └── Initial scoring/prioritization
  ├── Admin Review Interface (External)
  │   ├── Application details review
  │   ├── Business verification checks
  │   ├── Background screening (if applicable)
  │   └── Decision making tools
  ├── Decision Processing
  │   ├── APPROVE → Status change to 'active'
  │   │   ├── Full platform access granted
  │   │   ├── Email notification sent
  │   │   ├── Onboarding tour triggered
  │   │   └── Welcome package delivery
  │   ├── SUSPEND → Status change to 'suspended'
  │   │   ├── Account access limited
  │   │   ├── Reason communication
  │   │   └── Appeal process information
  │   └── REJECT → Status change to 'inactive'
  │       ├── Account deactivated
  │       ├── Rejection reason provided
  │       └── Reapplication guidelines
  └── Status Communication
      ├── Real-time dashboard updates
      ├── Email notifications
      ├── In-app status messages
      └── Next steps guidance

  9. Error Handling & Recovery Flows

  9.1 Network & Connectivity

  Network Issue Detection → Graceful Recovery
  ├── Connection Monitoring
  │   ├── API request timeout detection
  │   ├── WebSocket connection health
  │   ├── Real-time subscription status
  │   └── User action feedback delays
  ├── Error Classification
  │   ├── Temporary network issues (retry)
  │   ├── Server overload (exponential backoff)
  │   ├── Authentication expiry (re-login)
  │   └── Critical system failures (maintenance mode)
  ├── Recovery Strategies
  │   ├── Automatic retry with exponential backoff
  │   ├── Offline data caching
  │   ├── Queue pending actions
  │   ├── User notification and guidance
  │   └── Alternative workflow suggestions
  └── User Communication
      ├── Connection status indicators
      ├── Progress and retry information
      ├── Alternative action suggestions
      └── Support contact information

  9.2 Data Consistency & Synchronization

  Data Sync Issues → Consistency Resolution
  ├── Real-time Sync Monitoring
  │   ├── WebSocket message delivery tracking
  │   ├── Database state verification
  │   ├── UI state consistency checking
  │   └── Cross-tab synchronization
  ├── Conflict Detection
  │   ├── Concurrent modification detection
  │   ├── Stale data identification
  │   ├── Version mismatch handling
  │   └── User action collision resolution
  ├── Resolution Strategies
  │   ├── Server-side truth enforcement
  │   ├── Optimistic update rollback
  │   ├── User confirmation dialogs
  │   ├── Merge conflict resolution
  │   └── Manual intervention escalation
  └── Recovery Actions
      ├── Automatic data refresh
      ├── User notification of changes
      ├── Action replay mechanisms
      └── Audit trail maintenance

  10. Integration & External System Flows

  10.1 Cross-Platform Integration (VAI Tickets)

  User Action in VAI Tickets → Operator Dashboard Impact
  ├── Booking Creation
  │   ├── Customer books tour in VAI Tickets
  │   ├── Booking data creation in shared database
  │   ├── Real-time notification to operator dashboard
  │   └── UI updates in operator BookingsTab
  ├── Customer Communication
  │   ├── Customer sends message in VAI Tickets
  │   ├── Message stored in booking_conversations
  │   ├── Real-time delivery to operator chat
  │   └── Unread counter updates
  ├── Payment Processing
  │   ├── Payment processed in VAI Tickets
  │   ├── Payment status updates in shared system
  │   ├── Operator notification of payment status
  │   └── Commission calculation and display
  └── Data Synchronization
      ├── Shared database architecture
      ├── Real-time WebSocket synchronization
      ├── Cross-platform user identity management
      └── Consistent state maintenance

  10.2 Third-Party Service Integration

  External Service Communication → Platform Enhancement
  ├── Stripe Connect
  │   ├── Account creation and management
  │   ├── Payment processing
  │   ├── Webhook event handling
  │   ├── Payout management
  │   └── Account status monitoring
  ├── Email Services (Planned)
  │   ├── Transactional email delivery
  │   ├── Marketing campaign integration
  │   ├── Email template management
  │   └── Delivery tracking and analytics
  ├── SMS/WhatsApp (Planned)
  │   ├── Notification delivery
  │   ├── Two-factor authentication
  │   ├── Customer communication
  │   └── Marketing message delivery
  └── Analytics & Monitoring
      ├── User behavior tracking
      ├── Performance monitoring
      ├── Error reporting and alerting
      └── Business intelligence integration

  ---
  Key Process Flow Characteristics

  Technical Architecture Patterns

  - Event-Driven Architecture: Real-time updates via WebSocket
  - Optimistic UI Updates: Immediate feedback with server confirmation
  - Graceful Degradation: Fallback strategies for network issues
  - State Synchronization: Multi-channel data consistency
  - Error Recovery: Comprehensive error handling with user guidance

  Business Logic Patterns

  - Role-Based Access: Different capabilities based on operator status
  - Progressive Disclosure: Features unlocked as operators advance
  - Audit Trails: Complete action tracking for compliance
  - Multi-Language Support: Localized experiences across all flows
  - Cross-Platform Consistency: Synchronized experience across VAI ecosystem

  User Experience Patterns

  - Mobile-First Design: Touch-optimized interactions
  - Real-Time Feedback: Immediate response to user actions
  - Contextual Help: Guided assistance throughout workflows
  - Progressive Enhancement: Advanced features for power users
  - Accessibility: Support for diverse user needs and capabilities

  This comprehensive process flow documentation provides the complete understanding needed for developers to implement features,
  product owners to define requirements, and marketing managers to understand user journeys and platform capabilities.

