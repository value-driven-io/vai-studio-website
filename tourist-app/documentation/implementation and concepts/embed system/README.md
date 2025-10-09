# Embed System Documentation

## Overview
This directory contains all documentation for VAI's **Embeddable Booking Widget** - allowing operators to add VAI booking functionality to their own websites.

---

## Documents in This Folder

### 📘 **VAI_EMBED_WIDGET_MVP_SPEC.md** (CURRENT)
**Status:** ✅ Active - Ready for implementation
**Purpose:** Lean, focused specification for 6-week MVP
**Audience:** Developers building the feature

**What's inside:**
- Technical architecture (monorepo, button script, iframe modal)
- Implementation plan (week-by-week tasks)
- Operator integration guide (how they add script to their site)
- **5 critical alignment questions** (styling, i18n, analytics, docs, customization)
- Success metrics (50+ operators, >2% conversion)
- Industry best practices from expert perspective

**Read this if:** You're building the embed widget or need to understand MVP scope

---

### 📕 **VAI_EMBED_WIDGET_PROJECT_SPEC.md** (ARCHIVED)
**Status:** ⚠️ Archived - Reference only
**Purpose:** Original detailed spec (includes analytics design)
**Why archived:** Too much detail, mixed concerns (embed + analytics)

**What changed:**
- Analytics content moved to separate document (see below)
- Removed over-engineering (100+ pages → 20 pages)
- Focused on MVP only (removed Phase 2/3 details)

**Read this if:** You need historical context on original design decisions

---

## Related Documentation

### 📗 **[../analytics/VAI_UNIFIED_ANALYTICS_SYSTEM.md](../analytics/VAI_UNIFIED_ANALYTICS_SYSTEM.md)**
**Status:** ✅ Active - Separate project
**Purpose:** Platform-wide analytics infrastructure
**Audience:** Backend developers, data engineers

**What's inside:**
- Unified `events` table design (all products use this)
- Analytics module API (`track()` function)
- Dashboard queries (conversion funnels, user journeys)
- 6-month implementation roadmap
- GDPR compliance (privacy-first design)

**Connection to Embed Widget:**
- Embed widget will use this analytics system
- For MVP: **stubbed** (console.log only)
- Post-MVP: Full integration with `events` table

**Read this if:** You're building analytics infrastructure or need to understand tracking strategy

---

## Key Decisions Made

### ✅ Confirmed
1. **Architecture:** Monorepo (embed code lives in `tourist-app/src/embed/`)
2. **Styling:** Inline CSS (no Tailwind in button script - keep bundle <10KB)
3. **i18n:** English only for MVP (iframe shows localized Tourist App)
4. **Analytics:** Stubbed for MVP (full system built post-launch)
5. **Documentation:** Written during beta testing (Week 3-4)

### ⏳ Pending
- Assign frontend developer
- Assign backend developer
- Validate 6-week timeline with team capacity

---

## Quick Start (For Developers)

### To Build Embed Widget:
1. Read **VAI_EMBED_WIDGET_MVP_SPEC.md** (current spec)
2. Review Section 5 (Critical Alignment Questions)
3. Confirm all decisions with Kevin
4. Start Week 1 tasks (setup `src/embed/` directory)

### To Understand Analytics:
1. Read **[../analytics/VAI_UNIFIED_ANALYTICS_SYSTEM.md](../analytics/VAI_UNIFIED_ANALYTICS_SYSTEM.md)**
2. Note: This is a **separate project** (not blocking embed MVP)
3. Embed widget stubs analytics for now (console.log)

---

## Timeline

```
Week 0:  ✅ Strategic planning complete
Week 1:  [ ] Setup embed module + button script
Week 2:  [ ] Tourist App embed mode detection
Week 3:  [ ] Beta testing (5 operators)
Week 4:  [ ] Beta testing + docs
Week 5:  [ ] Production deployment
Week 6:  [ ] Launch (20-50 operators)
Month 3: [ ] Validate success (50+ operators, >2% conversion)
```

---

## Contact

**Project Owner:** Kevin De Silva (kevin@vai.studio)
**Questions?** Open an issue or message on Slack

---

## Document Changelog

| Date | Change | Author |
|------|--------|--------|
| Oct 8, 2025 | Created MVP spec (lean version) | Kevin De Silva |
| Oct 8, 2025 | Extracted analytics to separate doc | Kevin De Silva |
| Oct 8, 2025 | Archived original spec (too detailed) | Kevin De Silva |
