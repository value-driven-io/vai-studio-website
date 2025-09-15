# VAI Tourism Platform - Complete Operator User Guide

**📅 Last Updated**: September 15, 2025
**📋 Version**: 3.0 - Complete System Guide
**🎯 Audience**: Tourism Operators using VAI Platform
**📖 Status**: Production Ready - All Features Documented

---

## 🎯 **QUICK START OVERVIEW**

### **What is the VAI Operator Dashboard?**
The VAI Operator Dashboard is your central command center for managing tourism activities in French Polynesia. Think of it as your business management system that helps you:
- Create reusable activity templates
- Set up recurring schedules
- Manage individual bookings
- Handle customer communications
- Track business performance

### **The Core Workflow: Template → Schedule → Bookings**
```
1. Templates Tab    → Create activity blueprints (what you offer)
2. Schedules Tab    → Set when activities happen (recurring patterns)
3. Individual Tours → Generated automatically, customizable per date
4. Bookings Tab     → Manage customer reservations
```

**🔑 Key Principle**: You never create individual tours directly. Everything flows from templates through schedules.

---

## 📱 **TAB-BY-TAB COMPLETE GUIDE**

### **1. SETUP TAB** 🛠️

**Purpose**: Initial platform configuration (one-time setup)

#### **What You'll Do Here**:
- Complete your operator profile
- Set business information
- Configure payment settings
- Upload required documents

#### **When to Use**:
- ✅ **First time**: When you join the platform
- ✅ **Updates**: When business info changes
- ❌ **Avoid**: Daily operations (this is setup only)

#### **Key Sections**:
| Section | Purpose | Required |
|---------|---------|----------|
| Business Profile | Legal name, address, contact | ✅ Required |
| Payment Setup | Stripe Connect, bank details | ✅ Required |
| Document Upload | Business license, insurance | ✅ Required |
| Notification Preferences | Email/SMS settings | ⚪ Optional |

#### **⚠️ Important Notes**:
- **Complete setup first** - other tabs won't work properly without it
- **Business license** must be valid and current
- **Bank details** are secure and encrypted
- **Changes may require verification** and can take 24-48 hours

---

### **2. DASHBOARD TAB** 📊

**Purpose**: Business overview and quick actions

#### **What You'll See**:
- **Revenue metrics** for current month
- **Booking statistics** and trends
- **Upcoming activities** requiring attention
- **System notifications** and alerts
- **Quick action buttons** for common tasks

#### **Key Metrics Explained**:

**📈 Revenue Section**:
- **This Month**: Total confirmed bookings revenue
- **Last Month**: Previous month comparison
- **Growth %**: Month-over-month change
- **Average Booking**: Revenue per booking

**📅 Activity Overview**:
- **Active Templates**: Number of activity types you offer
- **Live Schedules**: Currently running recurring schedules
- **This Week's Tours**: Individual activities happening this week
- **Pending Bookings**: Reservations awaiting confirmation

#### **Quick Actions Available**:
- 🔵 **Create New Template** → Jump to Templates tab
- 🟢 **Add Schedule** → Jump to Schedules tab with create modal
- 🟡 **View Today's Activities** → Jump to Schedules calendar view
- 🔴 **Check Pending Bookings** → Jump to Bookings tab

#### **🎯 Best Practices**:
- Check dashboard **daily** for notifications
- Monitor **revenue trends** weekly
- Use **quick actions** for efficiency
- Review **pending items** regularly

---

### **3. TEMPLATES TAB** 🎨 **(MOST IMPORTANT)**

**Purpose**: Create reusable activity blueprints - the foundation of everything

#### **Why Templates Matter**:
Templates are the heart of the VAI system. Think of them as "master recipes" for your activities:
- **Reusable**: Create once, use many times
- **Consistent**: Ensures all tours have same quality standards
- **Efficient**: Changes to template affect all future activities
- **Professional**: Standardized descriptions and pricing

#### **What You Create Here**:

**🏷️ Basic Information**:
- **Activity Name**: What customers see (e.g., "Sunset Lagoon Tour")
- **Activity Type**: Category (Water Sports, Cultural, Adventure, etc.)
- **Description**: Detailed explanation for customers
- **Duration**: How long the activity takes
- **Languages**: Which languages you offer

**💰 Pricing Structure**:
- **Original Price (Adult)**: Your standard rate
- **Discount Price (Adult)**: Your actual selling price
- **Child Price**: Special rate for children (optional)
- **Child Age Range**: What ages qualify for child pricing

**👥 Capacity & Logistics**:
- **Maximum Capacity**: How many people you can handle
- **Minimum Capacity**: Minimum for tour to run (optional)
- **Meeting Point**: Where customers should arrive
- **Pickup Locations**: Available pickup points (optional)

**📋 Requirements & Features**:
- **Fitness Level**: Required physical condition
- **Equipment Provided**: What you supply
- **What to Bring**: What customers need
- **Special Requirements**: Medical, age, or other restrictions

#### **🎯 Template Creation Best Practices**:

**✅ DO**:
- **Be descriptive** - customers book based on this info
- **Set realistic capacity** - better to underestimate
- **Include all requirements** - avoid surprises later
- **Use high-quality photos** - they sell your activity
- **Price competitively** - research market rates

**❌ DON'T**:
- **Include specific dates/times** - that's for schedules
- **Make capacity too high** - quality over quantity
- **Skip required fields** - incomplete templates cause errors
- **Use vague descriptions** - be specific and clear

#### **⚠️ Critical Warnings**:
- **Template changes affect ALL future tours** - existing bookings stay unchanged
- **Deleting templates** breaks associated schedules - be very careful
- **Price changes** don't affect existing bookings automatically

#### **🔧 Advanced Template Features**:

**Seasonal Pricing** (Coming Soon):
- Different prices for high/low season
- Automatic price switching based on dates

**Multi-Language Support**:
- Same template, multiple language versions
- Automatic language detection for customers

**Group Discounts**:
- Automatic pricing for large groups
- Special rates for repeat customers

---

### **4. SCHEDULES TAB** 📅 **(WHERE THE MAGIC HAPPENS)**

**Purpose**: Turn templates into bookable activities with recurring patterns

#### **The Big Picture**:
Schedules take your templates and create actual bookable tours. Think of it as:
- **Template** = Recipe for "Sunset Tour"
- **Schedule** = "Every Saturday at 6 PM from March to October"
- **Generated Tours** = Individual Saturday tours customers can book

#### **Two Powerful View Modes**:

**📋 List View** - Schedule Management:
```
📅 Morning Lagoon Tours (Template: Lagoon Discovery)
🗓️  Mon-Fri 9:00 AM | Jan 1 - Dec 31, 2024
👥  8 spots each | 💰 12,000 XPF | 🟢 Active
📊  45 instances | 12 customized | 150 bookings
[Edit Schedule] [Pause] [View Calendar] [Archive]
```

**📅 Calendar View** - Individual Tour Management:
- Monthly calendar showing all generated tours
- Click any tour to customize pricing, capacity, or details
- Visual indicators for booking status, customizations
- Filter by specific schedule or view all

#### **Creating a New Schedule** - Step by Step:

**Step 1: Choose Template**
- Select from your existing templates
- Can't proceed without choosing a template
- Template determines activity details

**Step 2: Set Recurrence Pattern**
- **One-Time**: Single date activity
- **Daily**: Every day within date range
- **Weekly**: Specific days of week (Mon, Tue, etc.)
- **Custom**: Complex patterns (every 2nd Tuesday, etc.)

**Step 3: Define Date Range**
- **Start Date**: When schedule begins
- **End Date**: When schedule stops
- **Exceptions**: Skip specific dates (holidays, etc.)

**Step 4: Set Time Slots**
- **Primary Time**: Main tour time (e.g., 9:00 AM)
- **Multiple Times**: Add more times same day (9 AM + 2 PM)
- **Time Zone**: Always Pacific/Tahiti

**Step 5: Capacity Overrides** (Optional)
- Use template capacity OR
- Override for this schedule only
- Affects ALL tours in this schedule

#### **🎨 Calendar Visual Indicators Explained**:

**Tour Status Colors**:
- 🟢 **Green**: Active tours available for booking
- 🟡 **Yellow**: Sold out (no spots left)
- 🔴 **Red**: Cancelled tours
- 🟠 **Orange**: Paused tours (not bookable)
- ⚫ **Grey**: Hidden tours (not visible to customers)

**Special Indicators**:
- 🔧 **Settings Icon**: Tour has customizations
- 🔌 **Unplug Icon**: Tour is detached from schedule
- ⭐ **Yellow Dot**: Promotional pricing applied
- 📊 **Blue Background**: Customized tour

**Calendar Legend Categories**:

**Tour Status (Primary)**:
- Active, Paused, Hidden, Sold Out, Cancelled

**Tour Features (Secondary)**:
- Customized, Detached, Promo Pricing

**Calendar Indicators**:
- Today marker, Click to customize

#### **🔧 Individual Tour Customization**:

**Click any calendar tour to open customization modal**:

**Pricing Customizations**:
- **Override Adult Price**: Set different price for this date
- **Override Child Price**: Adjust child pricing
- **Promotional Discount**: Apply percentage or fixed amount discount
- **Promo Badge**: Automatically shows for discounted tours

**Capacity Adjustments**:
- **Reduce Capacity**: For equipment/weather limitations
- **Never Increase**: Beyond template maximum (safety rule)

**Special Notes**:
- **Instance Note**: Visible to customers for this date only
- **Special Requirements**: Additional requirements for this tour
- **Meeting Point Override**: Different location for this date

**Status Management**:
- **Active**: Normal bookable tour
- **Paused**: Not bookable, existing bookings honored
- **Hidden**: Not visible to customers
- **Cancelled**: No new bookings, existing cancelled
- **Sold Out**: Manually mark as full

#### **🎯 Schedule Management Best Practices**:

**✅ Smart Scheduling**:
- **Start simple** - one time slot, standard capacity
- **Test first** - create short schedule to verify everything works
- **Plan ahead** - schedules can run for months automatically
- **Monitor regularly** - check calendar view weekly

**⚠️ Critical Schedule Rules**:
- **Template Required**: Cannot create schedule without template
- **Time Zone Matters**: Always Pacific/Tahiti - check carefully
- **Date Logic**: End date must be after start date
- **Booking Deadline**: Respect template's auto-close hours

#### **🚨 Schedule Update Warnings**:

**When you edit existing schedules, the system shows warning modal**:
- **Existing Tours**: How many tours already created
- **Customized Tours**: Tours with special pricing/settings
- **Impact Preview**: What will change

**Schedule Update Rules**:
- **Customized tours preserved** - your special pricing stays
- **Standard tours updated** - adopt new schedule settings
- **New dates added** - tours created for new time slots
- **Removed dates** - standard tours deleted, customized tours detached

#### **🔄 Pause/Resume System**:

**Pause Schedule**:
- **Stops new bookings** for ALL tours in schedule
- **Preserves existing bookings** - customers keep reservations
- **Visual indication** - amber colors in calendar
- **Instant effect** - takes effect immediately

**Resume Schedule**:
- **Restores booking availability**
- **Maintains all customizations**
- **No data loss** - everything returns as it was

**Use Cases for Pause/Resume**:
- 🛠️ **Equipment maintenance**
- 🌧️ **Bad weather periods**
- 👨‍💼 **Staff unavailability**
- 📅 **Seasonal closures**

#### **🔌 Detached Tours Explained**:

**What are Detached Tours?**
- Tours that were part of a schedule but are now independent
- Happen when schedule dates are removed but tour was customized
- Keep all customizations but operate independently

**Why Do Tours Get Detached?**
- Schedule updated to remove certain dates
- Customized tour on removed date gets "detached" instead of deleted
- Preserves customer bookings and special pricing

**Managing Detached Tours**:
- ✅ **Keep running** - honor existing bookings
- ✅ **Customize further** - can still modify price/capacity
- ⚫ **Set to hidden** - if you don't want new bookings
- ❌ **Cancel** - if tour can't operate

---

### **5. BOOKINGS TAB** 🎫

**Purpose**: Manage customer reservations and communications

#### **What You'll Find Here**:
- **All Bookings**: Complete list of customer reservations
- **Booking Details**: Customer info, tour details, payment status
- **Communication Tools**: Message customers directly
- **Payment Tracking**: Revenue and payment status
- **Cancellation Management**: Handle cancellations and refunds

#### **Booking Status Explained**:
- 🟢 **Confirmed**: Paid and ready to go
- 🟡 **Pending**: Awaiting payment
- 🔴 **Cancelled**: Booking cancelled
- 🔵 **Completed**: Tour finished successfully

#### **Daily Booking Workflow**:
1. **Morning Check**: Review today's confirmed bookings
2. **Customer Communication**: Send reminders or updates
3. **Capacity Monitoring**: Check for last-minute bookings
4. **Problem Resolution**: Handle cancellations or changes

#### **🎯 Booking Management Best Practices**:
- **Confirm bookings** within 2 hours during business hours
- **Send reminders** 24 hours before tour
- **Keep customer info** updated and secure
- **Process refunds** promptly for cancellations

---

### **6. MARKETING TAB** 📈

**Purpose**: Promote your activities and track performance

#### **Key Features**:
- **Performance Analytics**: Which activities are most popular
- **Customer Reviews**: Manage and respond to feedback
- **Promotional Tools**: Create discount codes and special offers
- **SEO Optimization**: Improve search visibility

#### **Marketing Best Practices**:
- **Monitor reviews** daily and respond professionally
- **Create seasonal promotions** for slow periods
- **Track performance metrics** to optimize offerings
- **Update photos** regularly to keep listings fresh

---

### **7. PROFILE TAB** 👤

**Purpose**: Manage account settings and business information

#### **What You Can Update**:
- **Business Information**: Address, phone, email
- **Notification Preferences**: How you want to be contacted
- **Password and Security**: Account protection settings
- **Integration Settings**: Connect external tools

---

## 🎮 **ADVANCED FEATURES & SPECIAL FUNCTIONS**

### **🔧 Tour Customization System**

**What Can Be Customized**:
- ✅ **Pricing**: Adult/child prices, promotional discounts
- ✅ **Capacity**: Reduce (never increase) for specific dates
- ✅ **Notes**: Special instructions for specific tours
- ✅ **Meeting Points**: Different locations per tour
- ✅ **Status**: Active, paused, hidden, cancelled

**What CANNOT Be Customized**:
- ❌ **Activity Name**: Fixed from template
- ❌ **Duration**: Set in template
- ❌ **Core Description**: Template-defined
- ❌ **Increase Capacity**: Safety limit from template

### **🎯 Promotional Pricing System**

**Two Types of Discounts**:
1. **Percentage Discount**: 20% off regular price
2. **Fixed Amount**: 2,000 XPF off regular price

**Promotional Best Practices**:
- 🎯 **Last-minute deals** - day before or same day
- 🌧️ **Weather compensations** - for poor conditions
- 👥 **Group discounts** - for large parties
- 📅 **Seasonal promotions** - off-peak periods

### **🔒 Field Freezing System**

**What is Field Freezing?**
- Protects specific customizations from template updates
- Ensures your special pricing stays even if template changes
- Automatically applied when you customize tours

**When Fields Get Frozen**:
- ✅ **Price customization** - automatically freezes pricing fields
- ✅ **Capacity changes** - freezes capacity field
- ✅ **Manual freeze** - you can freeze any field manually

---

## ⚠️ **CRITICAL WARNINGS & SAFETY GUIDELINES**

### **🚨 HIGH-RISK OPERATIONS**

**Template Deletion**:
- ⚠️ **DANGER**: Deleting template breaks ALL associated schedules
- ✅ **SAFE ALTERNATIVE**: Set template to inactive instead
- 🔒 **PROTECTION**: System warns before template deletion

**Schedule Bulk Updates**:
- ⚠️ **RISK**: Can affect hundreds of tours at once
- ✅ **PREVIEW**: Always review impact before confirming
- 🛡️ **PROTECTION**: Customized tours are preserved

**Capacity Increases**:
- ⚠️ **NEVER ALLOWED**: Can't increase beyond template maximum
- 🎯 **REASON**: Safety and equipment limitations
- ✅ **ALTERNATIVE**: Create new template with higher capacity

### **💰 Pricing & Revenue Warnings**

**Template Price Changes**:
- ⚠️ **IMPACT**: Affects all future tours, not existing bookings
- 💡 **TIP**: Use promotional pricing for temporary changes
- 🔒 **PROTECTION**: Existing customer bookings never change

**Promotional Discount Conflicts**:
- ⚠️ **WARNING**: Can't combine percentage and fixed discounts
- ✅ **RULE**: One discount type per tour
- 💡 **TIP**: Choose the one that gives better customer value

### **📅 Schedule & Time Warnings**

**Time Zone Critical**:
- ⚠️ **PACIFIC/TAHITI ONLY**: System uses local time zone
- 🌍 **CUSTOMER IMPACT**: Wrong time zone confuses tourists
- ✅ **VERIFICATION**: Always double-check times display correctly

**Booking Deadline Logic**:
- ⚠️ **AUTO-CLOSE**: Tours stop accepting bookings before start time
- ⏰ **TEMPLATE SETTING**: Each template has booking deadline
- 💡 **TIP**: Set realistic deadlines (2-4 hours minimum)

---

## 🔍 **TROUBLESHOOTING GUIDE**

### **❌ Common Problems & Solutions**

**"Cannot create schedule without template"**:
- 🎯 **CAUSE**: Trying to create schedule before creating template
- ✅ **SOLUTION**: Go to Templates tab, create activity template first

**"Tour date validation failed"**:
- 🎯 **CAUSE**: Date conflicts with booking deadline or time zone
- ✅ **SOLUTION**: Check template auto-close hours, verify time zone

**"Template data not showing in tours"**:
- 🎯 **CAUSE**: Schedule-template relationship broken
- ✅ **SOLUTION**: Edit schedule, reselect template, save

**"Customizations lost after schedule update"**:
- 🎯 **CAUSE**: Bug in older versions (now fixed)
- ✅ **SOLUTION**: System now preserves all customizations automatically

**"Tours not appearing in calendar"**:
- 🎯 **CAUSE**: Date range or status filter excluding tours
- ✅ **SOLUTION**: Check calendar filter settings, expand date range

### **🛠️ System Maintenance**

**Weekly Tasks**:
- 📊 Review dashboard metrics
- 📅 Check upcoming schedule gaps
- 💬 Respond to customer reviews
- 🔄 Update any seasonal pricing

**Monthly Tasks**:
- 📈 Analyze performance data
- 🎯 Adjust pricing based on demand
- 📱 Update template descriptions/photos
- 🧹 Archive old completed tours

---

## 📋 **FREQUENTLY ASKED QUESTIONS**

### **General System Questions**

**Q: Can I create tours without templates?**
A: No. The VAI system enforces template-first workflow for consistency and quality.

**Q: What happens to existing bookings when I change a template?**
A: Existing customer bookings never change. Only future tours adopt template changes.

**Q: Can customers book directly or do I need to confirm?**
A: Depends on your settings. You can enable instant booking or require manual confirmation.

### **Template Questions**

**Q: How many templates can I create?**
A: Unlimited. Create as many activity types as you offer.

**Q: Can I copy an existing template?**
A: Yes. Use the "Duplicate Template" feature to create variations.

**Q: What if I want different prices for different seasons?**
A: Create multiple templates (e.g., "Summer Lagoon Tour", "Winter Lagoon Tour") or use promotional pricing.

### **Schedule Questions**

**Q: Can I have multiple time slots per day?**
A: Yes. Create schedule with multiple times (e.g., 9 AM and 2 PM same day).

**Q: What if I need to skip certain dates?**
A: Use the "Exceptions" feature when creating schedules to skip holidays or maintenance days.

**Q: Can I pause just one day instead of whole schedule?**
A: Yes. Click the specific tour in calendar view and set status to "Paused".

### **Customization Questions**

**Q: Can I offer group discounts?**
A: Yes. Use promotional pricing to apply discounts to specific tours.

**Q: What's the difference between "Hidden" and "Cancelled"?**
A: Hidden tours aren't visible to customers but can still be booked if you send direct links. Cancelled tours can't be booked at all.

**Q: Can I change the meeting point for one specific tour?**
A: Yes. Use tour customization to override meeting point for individual dates.

### **Technical Questions**

**Q: What browsers are supported?**
A: Chrome, Firefox, Safari, Edge (latest versions). Mobile browsers supported.

**Q: Is my data backed up?**
A: Yes. Daily automated backups with 30-day retention.

**Q: Can I export my booking data?**
A: Yes. Export features available in Bookings tab (CSV, Excel formats).

---

## 🎯 **BEST PRACTICES SUMMARY**

### **🏆 Golden Rules for Success**

1. **Start with Great Templates**
   - Detailed descriptions that sell the experience
   - High-quality photos from multiple angles
   - Accurate capacity and duration
   - Clear requirements and what's included

2. **Plan Schedules Strategically**
   - Start with simple patterns, add complexity later
   - Leave buffer time between tours
   - Plan for weather and equipment maintenance
   - Monitor demand and adjust capacity

3. **Customize Thoughtfully**
   - Use promotional pricing for special situations
   - Don't over-customize - templates are there for consistency
   - Monitor which customizations work best
   - Communicate changes clearly to customers

4. **Manage Bookings Proactively**
   - Respond to booking requests within 2 hours
   - Send confirmation and reminder messages
   - Have backup plans for weather cancellations
   - Keep detailed customer communication records

5. **Monitor and Optimize**
   - Check dashboard daily for trends
   - Analyze which activities are most popular
   - Adjust pricing based on demand patterns
   - Update templates based on customer feedback

### **📱 Mobile Usage Tips**

**On Mobile Devices**:
- ✅ **Dashboard tab** works perfectly for quick checks
- ✅ **Bookings tab** ideal for customer communication
- ⚠️ **Schedule creation** better on desktop (complex forms)
- ⚠️ **Template editing** recommended on desktop (many fields)

---

## 📞 **SUPPORT & RESOURCES**

### **Getting Help**

**Technical Support**:
- 📧 Email: support@vai-tourism.com
- 💬 Live Chat: Available in dashboard
- 📱 WhatsApp: +689 XX XX XX XX (Business hours)
- 🕐 Hours: Monday-Friday, 8 AM - 6 PM (Pacific/Tahiti)

**Training Resources**:
- 🎥 Video tutorials: Available in Help section
- 📚 Knowledge base: Searchable documentation
- 🎓 Webinar training: Monthly group sessions
- 👥 Operator community: Forum for peer support

**Emergency Contact**:
- 🆘 For urgent issues affecting customer bookings
- 📞 Emergency line: +689 XX XX XX XX (24/7)
- ⚡ Average response time: 15 minutes

---

## 📝 **DOCUMENT VERSION HISTORY**

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 3.0 | Sept 15, 2025 | Complete user guide creation | VAI Team |
| | | Hidden tour status implementation | |
| | | Professional status legend organization | |
| | | Comprehensive FAQ section | |
| 2.1 | Sept 14, 2025 | Detached tour architecture | VAI Team |
| | | Visual indicators implementation | |
| 2.0 | Sept 12, 2025 | Schedule pause/resume system | VAI Team |
| 1.5 | Sept 09, 2025 | Individual tour customization | VAI Team |
| 1.0 | Sept 06, 2025 | Template-first architecture | VAI Team |

**📅 Next Update Scheduled**: October 15, 2025
**🔄 Review Cycle**: Monthly updates based on user feedback
**📧 Feedback**: Send suggestions to docs@vai-tourism.com

---

**🎉 Congratulations!** You now have complete knowledge of the VAI Operator Dashboard. Remember, this system is designed to grow with your business. Start simple, experiment with features, and don't hesitate to reach out for support.

**Happy touring! 🏝️**