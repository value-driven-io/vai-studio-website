# User Guidance System - Implementation Guide

## 🚀 **Priority Implementation Roadmap**

### **Phase 1: Critical Messages (Week 1)**
**Essential for preventing user confusion and data loss**

#### **A. Schedule Update Safety Messages**
```javascript
// Before schedule update
const UpdateWarningModal = () => (
  <Modal>
    <h3>⚠️ Smart Update System</h3>
    <div className="update-preview">
      <div className="preserved">
        🔒 <strong>{customizedCount} customized activities</strong> will keep their changes
      </div>
      <div className="updated">  
        ✅ <strong>{standardCount} standard activities</strong> will update with your changes
      </div>
      {newDates.length > 0 && (
        <div className="added">
          ➕ <strong>{newDates.length} new activities</strong> will be added
        </div>
      )}
    </div>
    <Button onClick={proceedWithUpdate}>Apply Changes</Button>
  </Modal>
)
```

#### **B. Schedule Update Success Messages**
```javascript
// After successful update
const UpdateSuccessToast = ({ results }) => (
  <Toast type="success" duration={6000}>
    <div>
      <strong>✅ Schedule Updated Successfully!</strong>
      <ul>
        <li>{results.updated} activities updated</li>
        <li>{results.preserved} customizations preserved 🔒</li>
        {results.added > 0 && <li>{results.added} new activities added</li>}
      </ul>
      <small>Your customizations are safe!</small>
    </div>
  </Toast>
)
```

#### **C. Template-First Education**
```javascript
// Empty state in Templates tab
const TemplatesEmptyState = () => (
  <EmptyState>
    <h3>🎨 Create Your First Activity Template</h3>
    <p>Templates are reusable and the foundation for your Activity instances. Create them once, then schedule them multiple times.</p>
    <Button primary>
      <Tooltip content="Templates contain all your activity details except dates and times">
        + Create Template
      </Tooltip>
    </Button>
  </EmptyState>
)
```

### **Phase 2: Enhanced UX (Week 2)**
**Improve user understanding and workflow**

#### **A. Customization Modal**
```javascript
const CustomizationModal = ({ activity, onSave }) => (
  <Modal header="Customize Activity - Sep 15, 2025">
    <div className="status-indicator">
      {activity.is_customized ? (
        <Badge color="orange">● Customized Activity</Badge>
      ) : (
        <Badge color="blue">○ Standard Activity</Badge>
      )}
    </div>
    
    <Section title="💰 Pricing">
      <div className="price-comparison">
        <div>Standard Price: {activity.template_price} XPF</div>
        <div>
          Custom Price: <Input value={customPrice} />
          <Checkbox> 🔒 Lock this price</Checkbox>
        </div>
      </div>
      
      <Tooltip content="Locked fields won't change during schedule updates">
        <InfoIcon />
      </Tooltip>
    </Section>
  </Modal>
)
```

#### **B. Calendar Visual Indicators**
```javascript
// Calendar activity rendering
const CalendarActivity = ({ activity }) => {
  const getActivityStyle = () => {
    if (activity.is_customized) return 'customized-activity'
    if (activity.available_spots === 0) return 'sold-out-activity'
    return 'standard-activity'
  }
  
  return (
    <div className={getActivityStyle()}>
      <div className="activity-time">{activity.time_slot}</div>
      <div className="activity-capacity">{activity.available_spots} spots</div>
      {activity.is_customized && <Badge size="small">🏷️</Badge>}
      {activity.promo_discount_percent && <Badge size="small">PROMO</Badge>}
    </div>
  )
}
```

### **Phase 3: Advanced Guidance (Week 3-4)**
**Proactive help and optimization suggestions**

#### **A. Onboarding Flow**
```javascript
const OnboardingFlow = () => {
  const [step, setStep] = useState(1)
  
  return (
    <OnboardingModal>
      {step === 1 && (
        <WelcomeStep>
          <h2>🌴 Welcome to VAI Tourism!</h2>
          <p>Let's get your first activity live in 3 minutes.</p>
          <Steps>
            <Step>1️⃣ Create an activity template</Step>
            <Step>2️⃣ Schedule it for your preferred times</Step>
            <Step>3️⃣ Start accepting bookings immediately</Step>
          </Steps>
        </WelcomeStep>
      )}
    </OnboardingModal>
  )
}
```

## 🎨 **UI Components Needed**

### **1. Toast Notification System**
```javascript
// Toast for different message types
const useToast = () => {
  const showToast = (type, message, duration = 4000) => {
    // Implementation for success, warning, error, info toasts
  }
  
  return { showToast }
}

// Usage
const { showToast } = useToast()
showToast('success', 'Schedule updated - 3 customizations preserved!', 6000)
```

### **2. Smart Tooltip System**
```javascript
const SmartTooltip = ({ children, content, trigger = 'hover', showFor = 'beginners' }) => {
  const userLevel = useUserLevel() // beginner, intermediate, advanced
  const shouldShow = showFor.includes(userLevel)
  
  if (!shouldShow) return children
  
  return <Tooltip content={content} trigger={trigger}>{children}</Tooltip>
}
```

### **3. Progressive Disclosure**
```javascript
const AdvancedOptions = ({ children, level = 'intermediate' }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const userLevel = useUserLevel()
  
  if (userLevel === 'beginner') {
    return (
      <Collapsible
        trigger={<Button variant="text">Show Advanced Options</Button>}
        open={isExpanded}
        onToggle={setIsExpanded}
      >
        {children}
      </Collapsible>
    )
  }
  
  return children // Show directly for advanced users
}
```

### **4. Status Badge System**
```javascript
const StatusBadge = ({ type, children }) => {
  const badgeStyles = {
    template: { bg: 'blue', icon: '🎨' },
    customized: { bg: 'orange', icon: '🔒' },
    promo: { bg: 'green', icon: '🏷️' },
    sold_out: { bg: 'red', icon: '🔴' }
  }
  
  const style = badgeStyles[type]
  
  return (
    <Badge className={`badge-${style.bg}`}>
      {style.icon} {children}
    </Badge>
  )
}
```

## 📱 **Mobile Optimization**

### **Compact Messaging**
```javascript
const useResponsiveMessage = (desktop, mobile) => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  return isMobile ? mobile : desktop
}

// Usage
const message = useResponsiveMessage(
  "Your schedule update will preserve customized activities and apply changes to standard ones",
  "🔒 Custom activities stay safe, others update"
)
```

### **Progressive Actions on Mobile**
```javascript
const MobileScheduleCreation = () => {
  const [currentStep, setCurrentStep] = useState(1)
  
  const steps = [
    { title: 'Choose Template', component: TemplateSelector },
    { title: 'Set Schedule', component: SchedulePattern },
    { title: 'Pick Dates', component: DateRange }
  ]
  
  return (
    <MobileWizard currentStep={currentStep}>
      {steps.map((step, index) => (
        <MobileStep key={index} title={step.title}>
          <step.component />
        </MobileStep>
      ))}
    </MobileWizard>
  )
}
```

## 🔧 **Implementation Priority**

### **Immediate (This Week)**
1. **Schedule Update Warning Modal** - Prevent user confusion
2. **Update Success Toast** - Show what happened
3. **Customization Status Badges** - Visual differentiation

### **Short Term (Next 2 Weeks)**
1. **Template Empty State** - Guide first-time users
2. **Calendar Visual Indicators** - Clear activity status
3. **Customization Modal Enhancement** - Better field locking UI

### **Medium Term (Month)**
1. **Onboarding Flow** - First-time user experience
2. **Smart Tooltips System** - Contextual help
3. **Mobile Optimization** - Compact messaging

### **Long Term (Quarter)**
1. **Analytics Integration** - Success celebrations
2. **Advanced Progressive Disclosure** - Power user features
3. **A/B Testing Framework** - Message optimization

## 🎯 **Success Metrics**

**User Understanding**:
- Time to first successful schedule creation
- Reduction in support tickets about "lost customizations"
- User survey: "I understand what will happen when I update a schedule"

**Feature Adoption**:
- Percentage of users who customize activities
- Frequency of schedule updates
- Template reuse rate

**Error Reduction**:
- Fewer accidental data modifications
- Reduced user errors in workflow
- Lower bounce rate from confusion

This implementation guide prioritizes the most critical user guidance needs while providing a roadmap for comprehensive user education and experience enhancement.