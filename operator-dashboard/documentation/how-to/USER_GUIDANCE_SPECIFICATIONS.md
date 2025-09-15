# VAI Tourism Platform - User Guidance System Specifications

## 🎯 **Template-First Workflow - Complete User Education System**

### **CORE CONCEPT EDUCATION**

**Primary Message**: "Create once, schedule anywhere" workflow
**Visual**: Template → Schedule → Individual Activities → Customization

---

## 📋 **1. TEMPLATES TAB - "Your Activity Blueprints"**

### **Empty State Message**:
```
🎨 Create Your First Activity Template
Templates are reusable blueprints for your activities. Create them once, then schedule them multiple times with different dates and frequencies.

[+ Create Template] button with tooltip: "Templates contain all your activity details except dates and times"
```

### **Template Creation Guidance**:
**Form Header**: "Activity Template"
**Subtitle**: "This template can be scheduled multiple times with different dates"

**Key Field Tooltips**:
- **Activity Name**: "Choose a clear name - you'll see this in all schedules" 
- **Pricing**: "Set your standard pricing - you can customize individual instances later"
- **Capacity**: "Default group size - adjustable per schedule or individual activity"
- **Meeting Point**: "Standard location - can be customized for specific dates"

**Success Message**:
```
✅ Template Created Successfully!
Ready to schedule your "Sunset Lagoon Tour"?
[Schedule This Template] [Create Another Template]
```

### **Template List View**:
**Header**: "Your Activity Templates (3)" with info icon:
"Templates are reusable Activities. Schedule them to create bookable activity instances."

**Template Card Elements**:
```
🌅 Sunset Lagoon Tour                    [Schedule] [Edit] [•••]
Cultural Experience • 2h • 8 people
💰 12,000 XPF • 📍 Raiatea Ferry
📊 Active in 2 schedules • 15 total activities

Status Badge: "Template" (distinctive color/icon)
```

---

## 📅 **2. SCHEDULES TAB - "When Your Activities Happen"**

### **Empty State Message**:
```
📅 Schedule Your First Activities
Choose a template, set when it happens, and VAI will create all your bookable activities automatically.

[+ Create Schedule] button with tooltip: "Turn templates into scheduled activities"
```

### **Schedule Creation Modal**:

**Modal Header**: "Create New Schedule"
**Subtitle**: "Choose a template and set when it happens"

**Step-by-Step Flow**:

#### **Step 1: Template Selection**
```
1️⃣ Choose Activity Template
Select which activity you want to schedule

[Template Dropdown with preview]
Selected: "Sunset Lagoon Tour" 
Preview: 2h • 8 people • 12,000 XPF
```

#### **Step 2: Schedule Pattern**
```
2️⃣ Set Schedule Pattern
How often does this activity happen?

○ One Time Only     ○ Daily     ● Weekly     ○ Custom
Days: [Fri] [Sat] ✓   Time: [5:30 PM ▼]
```

#### **Step 3: Date Range**
```
3️⃣ Choose Date Range
When does this schedule start and end?

Start: [Sep 12, 2025] End: [Dec 31, 2025]
ℹ️ We'll create individual activities for each scheduled date
```

#### **Step 4: Preview & Confirm**
```
4️⃣ Preview Your Schedule
We'll create 24 bookable activities:

Sep 13 • Sep 14 • Sep 20 • Sep 21... (showing first few)

Total: 24 activities will be created
[← Back] [Create Schedule]
```

### **Schedule Creation Success**:
```
🎉 Schedule Created Successfully!
Created 24 bookable activities for "Weekend Sunset Tours"

📍 Next steps:
• Activities are now bookable by customers
• Customize individual dates if needed
• View your calendar to see all activities

[View Calendar] [Create Another Schedule]
```

### **Schedule List View - Two Modes**:

#### **List View**:
```
📅 Weekend Sunset Tours
🗓️  Fri-Sat 5:30 PM • Sep 12 - Dec 31, 2025
👥  8 spots each • 💰 12,000 XPF • 🟢 Active
📊  24 activities • 3 customized • 67 bookings

[Edit Schedule] [Pause] [📅 Calendar] [Archive]

Status indicators:
🟢 Active  🟡 Paused  🔴 Archived  📅 Scheduled
```

#### **Calendar View**:
```
Calendar with clickable instances:
• Standard tours: Blue dots with time
• Customized tours: Orange dots with 🏷️ badge
• Sold out: Red dots
• Available: Green dots with capacity number

Click behavior:
• Click dot → Customize activity modal
• Click schedule name → Edit schedule
```

### **Schedule Update - CRITICAL USER COMMUNICATION**:

#### **Schedule Edit Modal**:
**Header**: "Edit Schedule: Weekend Sunset Tours"
**Important Notice Box**:
```
⚠️ Smart Update System
• Customized activities will keep their changes
• Standard activities will update with your changes  
• New dates will be added automatically
• Removed dates will only delete standard activities

Current: 24 activities (3 customized)
```

#### **Schedule Update Preview**:
```
📊 Update Preview
Your changes will:
✅ Update 21 standard activities with new time
🔒 Preserve 3 customized activities unchanged  
➕ Add 5 new activities for extended dates
➖ Remove 2 activities for deleted dates

[Cancel] [Apply Changes]
```

#### **Schedule Update Success**:
```
✅ Schedule Updated Successfully!
Smart update completed:
• 21 activities updated with new time (10:00 AM → 11:00 AM)
• 3 customized activities preserved unchanged
• 5 new activities added
• 2 standard activities removed

Your customizations are safe! 🔒
[View Updated Calendar]
```

---

## 🎨 **3. ACTIVITY CUSTOMIZATION - "Make It Special"**

### **Calendar Click - Customization Modal**:

**Modal Header**: "Customize Activity - Sep 15, 2025"
**Activity Info**: "Sunset Lagoon Tour • 5:30 PM • 8 spots"

**Customization Notice**:
```
🎨 Individual Customization
Make this specific date special without affecting your schedule or other activities.

Status: ○ Standard Activity  ● Customized Activity
```

### **Customization Form**:

#### **Pricing Section**:
```
💰 Pricing for Sep 15, 2025
Standard Price: 12,000 XPF
Custom Price:  [10,000] XPF  
🔒 Lock this price (won't change with schedule updates)

Promo Badge: [Last Minute Deal ▼] ✓ Show badge to customers
```

#### **Capacity Section**:
```
👥 Capacity for Sep 15, 2025  
Standard: 8 people
Custom:   [6] people
🔒 Lock this capacity

ℹ️ Existing bookings (2) will be preserved
```

#### **Meeting Point Section**:
```
📍 Meeting Point for Sep 15, 2025
Standard: Raiatea Ferry
Custom: [Private Beach Access] 
🔒 Lock this location
```

### **Customization Success**:
```
✅ Activity Customized Successfully!
Sep 15th is now special:
• 🏷️ Last Minute Deal - 10,000 XPF  
• 👥 Limited to 6 people
• 📍 Private Beach Access

This activity is now protected from schedule changes 🔒
[Close] [Customize Another Date]
```

### **Customization Indicators**:

#### **Calendar Visual Cues**:
```
Standard Activity:  🔵 Sep 14 • 5:30 PM • 8 spots
Customized:        🟠 Sep 15 • 5:30 PM • 6 spots 🏷️ 
Locked:            🔒 Sep 16 • 5:30 PM • 8 spots
Sold Out:          🔴 Sep 17 • 5:30 PM • FULL
```

#### **Customization Badge System**:
- 🏷️ **Promo** - Special pricing
- 🔒 **Locked** - Protected from updates  
- 👥 **Limited** - Reduced capacity
- 📍 **Special** - Custom location
- ⭐ **Premium** - Enhanced experience

---

## 🔄 **4. SMART UPDATE NOTIFICATIONS**

### **Real-Time Feedback During Operations**:

#### **Schedule Update Progress**:
```
🔄 Updating Your Schedule...
✅ Schedule pattern updated
🔍 Analyzing existing activities...
🎯 Planning smart changes...
📝 Applying updates...
```

#### **Detailed Update Results**:
```
📊 Update Complete!

Activities Updated: 18
• Time changed: 5:30 PM → 6:00 PM
• Dates added: 3 new weekend dates

Customizations Preserved: 6
• Sep 15: Last Minute Deal (kept 5:30 PM)
• Sep 22: Private Group (kept custom capacity)
• Oct 1: Special Location (kept all changes)

Your special activities stayed special! 🎨
```

### **Conflict Resolution Messages**:

#### **When Template Changes Affect Customizations**:
```
⚠️ Template Update Detected
Your template "Sunset Tour" was updated, but you have customized activities.

What should we do with your 4 customized dates?
○ Keep my customizations (recommended)
○ Update everything to match new template
○ Let me choose for each date

[Smart Update] [Manual Review]
```

---

## 🎯 **5. CONTEXTUAL HELP & TOOLTIPS**

### **Always-Visible Helpers**:

#### **Tab Headers with Context**:
```
Templates (5)     Schedules (3)     Bookings (28)
"Your blueprints" "When they happen" "Customer bookings"
```

#### **Smart Empty States**:
```
When Templates exist but no Schedules:
📅 Ready to Schedule Your Templates?
You have 5 templates ready to be scheduled.
[Schedule "Lagoon Tour"] [Schedule "Hiking Adventure"]

When Schedules exist but few bookings:
🎯 Boost Your Bookings
Your activities are live! Here are some tips:
• Add promotional pricing for slow dates
• Share your booking link on social media
• Enable automatic confirmation
```

### **Progressive Disclosure**:

#### **Beginner Tips (First 2 weeks)**:
- Show explanation tooltips on every action
- Include "Why?" context for each step
- Highlight next recommended actions

#### **Intermediate Tips (After 2 weeks)**:
- Reduce basic tooltips
- Focus on efficiency tips
- Show advanced features

#### **Advanced Tips (Power users)**:
- Keyboard shortcuts
- Bulk operations
- Advanced customization options

---

## 💡 **6. ONBOARDING FLOW**

### **First-Time User Experience**:

#### **Welcome Modal**:
```
🌴 Welcome to VAI Tourism!
Let's get your first activity live in 3 minutes.

We'll help you:
1️⃣ Create an activity template
2️⃣ Schedule it for your preferred times  
3️⃣ Start accepting bookings immediately

[Start Setup] [Watch 2-min Video] [Skip for Now]
```

#### **Guided Template Creation**:
```
Step 1 of 3: Create Your First Template
🎨 Think of this as your activity's DNA - all the details except when it happens.

What's your signature experience?
[Sunset Lagoon Tour                    ] 
💡 Tip: Choose a name customers will love

This will be your reusable blueprint for all future schedules.
[Continue] [Need Help?]
```

### **Success Milestones**:
```
🎉 Milestone Achieved!
Your first activity is live and bookable!

"Sunset Lagoon Tour" - Sep 15, 5:30 PM
Booking link: vai.pf/book/sunset-tour-sept-15

📈 Next steps to success:
□ Add more scheduled dates
□ Set up promotional pricing  
□ Share your booking link

[Add More Dates] [View Booking Page] [Share Link]
```

---

## 🔧 **7. ERROR PREVENTION & RECOVERY**

### **Smart Validation Messages**:

#### **Friendly Error Prevention**:
```
Instead of: "End date must be after start date"
Show: "📅 Your end date (Sep 10) is before start date (Sep 15). 
       Did you mean Sep 25th for the end date?"
```

#### **Context-Aware Warnings**:
```
⚠️ Heads Up!
You're about to schedule 45 activities. 
That's a lot! Most operators start with 1-2 weeks.

Want to try a shorter date range first?
[Use 2 Weeks] [Continue with 45] [Let Me Adjust]
```

### **Recovery Assistance**:

#### **When Things Go Wrong**:
```
😅 Oops! Something didn't work as expected.
Don't worry - your data is safe.

What happened: Schedule update encountered an issue
Your activities: All preserved and unchanged
What's next: We'll help you retry with a different approach

[Try Again] [Contact Support] [Manual Fix]
```

---

## 📱 **8. MOBILE-FIRST MESSAGING**

### **Compact, Clear Communication**:
```
Desktop: "Your schedule update will preserve customized activities"
Mobile:  "🔒 Custom activities stay safe"

Desktop: "Generate bookable activities from your template"  
Mobile:  "Template → Bookable activities"
```

### **Progressive Actions**:
```
Instead of overwhelming mobile modal:
Step 1: Choose template  [Next]
Step 2: Set schedule     [Next]  
Step 3: Pick dates       [Create]
```

---

## 🎨 **9. VISUAL HIERARCHY & BRANDING**

### **Consistent Icon System**:
- 🎨 Templates (creation/blueprint)
- 📅 Schedules (time/calendar)  
- 🎯 Activities (individual instances)
- 🔒 Customizations (protected/special)
- 🏷️ Promotions (deals/discounts)
- ✨ Premium features

### **Color-Coded Status System**:
- **Blue**: Standard/default state
- **Orange**: Customized/special  
- **Green**: Active/successful
- **Red**: Issues/sold out
- **Gray**: Inactive/paused

---

## 📊 **10. SUCCESS METRICS & FEEDBACK**

### **Achievement Celebrations**:
```
🎉 Great Job!
10 bookings this week - that's 150% more than last week!

Your "Sunset Tours" are popular:
• Sep 15: Sold out! 
• Sep 16: 6/8 spots booked
• Sep 17: 3/8 spots available

Keep the momentum: [Add More Dates] [Create Promo]
```

### **Helpful Analytics Context**:
```
📈 Booking Insights
Your customized activities get 40% more bookings!

Top performers:
🏷️ "Last Minute Deals" - 85% booking rate
🔒 "Private Beach Access" - 100% booking rate

💡 Try adding promotions to slower dates
```

This comprehensive guidance system ensures users understand each action, feel confident in their decisions, and never lose important data or customizations.