# Supabase CLI Reference for LLM Assistants

**Purpose**: This document serves as a comprehensive reference for LLM assistants working with this project's Supabase CLI setup. It explains the correct approach, common pitfalls, and troubleshooting strategies based on real project experience.

## 🎯 Key Lessons Learned

### 1. **Manual vs CLI Migration Reality**
- **Reality**: This project uses a **hybrid approach** - migrations are often applied manually via Supabase dashboard, then CLI history is repaired
- **Why**: Manual application via SQL editor is faster and more reliable for complex changes
- **CLI Role**: Primarily for tracking and synchronizing migration history, not always for applying changes

### 2. **Authentication Environment Issues**
- **LLM Limitation**: Non-TTY environments (like LLM sessions) cannot perform interactive `supabase login`
- **User Environment**: Users typically have proper authentication stored from previous sessions
- **Troubleshooting**: If CLI fails for LLM, user should try commands in their own terminal

## 🏗️ Project Structure

### Environments
- **Local Development**: `supabase start` (Docker containers) - *Optional*
- **Staging**: `wewwhxhtpqjqhxfxbzyz` - *Primary testing environment*
- **Production**: `rizqwxcmpzhdmqjjqgyw`
- **Database Password**: `2AdEXM$#cfL9kUi` (for both staging and production)

### Docker Usage Decision
**Current Workflow**: Testing directly against staging database
- ✅ **Skip Docker** if testing with staging and have reliable internet
- ✅ **Use Docker** only for offline development or clean state testing
- ✅ **Resource Saving**: `supabase stop` when not needed locally

### Migration Files Location
```
tourist-app/supabase/migrations/
├── 20250802122442_remote_schema.sql
├── 20250804143917_create_waitlist_table.sql
├── 20250818115603_stripe_payment_fields_to_bookings_table.sql
├── 20250915000001_enhance_tours_view_for_template_system.sql
├── 20250915000002_create_template_discovery_functions.sql
├── 20250917000001_add_template_cover_image_field.sql
├── 20250917000002_add_operator_logo_field.sql
├── 20250917000004_add_operator_logo_to_views_safe.sql
└── 20250917000006_add_operator_to_activity_templates_view.sql
```

## 📋 Standard Workflow (Kevin's Proven Process)

### Creating New Migrations
```bash
# Navigate to project directory
cd tourist-app

# Create new migration file
supabase migration new [descriptive_name]
# This creates: supabase/migrations/[timestamp]_[descriptive_name].sql
```

### Applying to Staging
```bash
# Connect to staging
supabase link --project-ref wewwhxhtpqjqhxfxbzyz

# Mark old migrations as applied if needed (skip them)
supabase migration repair --status applied [migration_id]

# Push new migrations only
supabase db push
```

### Applying to Production
```bash
# Connect to production
supabase link --project-ref rizqwxcmpzhdmqjjqgyw

# Same repair needed for production
supabase migration repair --status applied [migration_id]

# Push migrations
supabase db push
```

## 🚨 Common Issues & Solutions

### 1. **Connection Timeouts/Auth Failures**
**Symptoms**:
- `failed SASL auth (invalid SCRAM server-final-message received from server)`
- `timeout: context deadline exceeded`
- `Cannot use automatic login flow inside non-TTY environments`

**Solutions**:
```bash
# Re-authenticate (user terminal only)
supabase login

# Re-link to project
supabase link --project-ref [project_ref]

# Try without debug mode first
supabase [command]
```

### 2. **Migration History Mismatch**
**Symptoms**:
```
Local          | Remote         | Time (UTC)
---------------|----------------|---------------------
20250915000001 |                | 2025-09-15 00:00:01
               | 20250814105140 | 2025-08-14 10:51:40
```

**Solution - Repair Migration History**:
```bash
# Check current status
supabase migration list --linked

# Mark manually applied migrations as applied
supabase migration repair --status applied [migration_id_1] [migration_id_2] ...

# Verify repair
supabase migration list --linked
```

### 3. **Manual Migration Application**
**When Manual is Preferred**:
- Complex schema changes
- CLI connectivity issues
- Faster iteration during development

**Process**:
1. Create `.sql` file locally for documentation
2. Copy content to Supabase dashboard SQL editor
3. Apply manually in dashboard
4. Use `supabase migration repair --status applied [id]` to sync CLI history

## 🔧 Diagnostic Commands

### Check Current State
```bash
# See which project is linked
supabase projects list

# Check local Supabase status
supabase status

# Check migration status
supabase migration list --linked

# Test connectivity
supabase db push  # Should say "No changes" if synced
```

### Debugging Connection Issues
```bash
# Add debug output
supabase [command] --debug

# Check project configuration
cat supabase/config.toml

# Verify Docker is running (for local)
docker ps | grep supabase
```

## 📊 Migration States Explained

| State | Meaning | Action Needed |
|-------|---------|---------------|
| `Local \| Remote` | Both exist, synced | ✅ None |
| `Local \|` | Local file exists, not applied to remote | Apply: `supabase db push` |
| `\| Remote` | Applied to remote, no local file | Create local file or mark as applied |

## 🎯 Best Practices for LLM Assistants

### 1. **Always Check Current State First**
```bash
supabase projects list
supabase migration list --linked
```

### 2. **Respect User's Proven Workflow**
- Don't override user's established processes
- If CLI fails for LLM, guide user to run commands in their terminal
- Manual application via dashboard is valid and often preferred

### 3. **Use Migration Repair Strategically**
```bash
# When migrations were applied manually
supabase migration repair --status applied [migration_ids]

# When migrations should be skipped
supabase migration repair --status reverted [migration_ids]
```

### 4. **Handle Command Line Wrapping**
```bash
# WRONG (will cause command not found errors)
supabase migration repair --status applied 20250915000001
20250915000002 20250917000001

# CORRECT (all on one line)
supabase migration repair --status applied 20250915000001 20250915000002 20250917000001
```

## 🚀 Testing CLI Functionality

### Verify Everything Works
```bash
# Should show all migrations synced
supabase migration list --linked

# Should report "Remote database is up to date."
supabase db push

# Test new migration creation
supabase migration new test_migration
```

### Successful Test Results
When everything is working correctly, `supabase db push` will show:
```
Remote database is up to date.
```

Note: Initial connection may fail and retry - this is normal and expected.

## 📝 Quick Reference Commands

```bash
# Authentication & Linking
supabase login
supabase link --project-ref [project_ref]
supabase projects list

# Migration Management
supabase migration new [name]
supabase migration list --linked
supabase migration repair --status applied [ids...]
supabase db push
supabase db pull

# Local Development (Optional - see Docker Usage Decision above)
supabase start    # Only when needed for offline development
supabase stop     # Save resources when testing with staging
supabase status   # Check what's running locally

# Debugging
supabase [command] --debug
```

## ⚠️ Critical Reminders for LLMs

1. **Don't assume CLI connectivity will work** - be prepared for manual workflows
2. **Always verify current state** before making changes
3. **Respect that manual application is often the preferred method**
4. **Guide users to use their own terminal** when CLI auth fails
5. **Migration repair is normal and expected** in this workflow
6. **All commands should be on single lines** to avoid shell parsing errors
7. **Docker is optional** - user tests with staging database, not local containers

## 📚 Project Context

This is a tourist booking application with:
- **Tours table** with template system
- **Operators table** with logos and ratings
- **Bookings system** with payment integration
- **Activity templates** for tour discovery
- **Multi-environment deployment** (staging → production)

The CLI setup supports this complex schema while allowing flexible development practices that prioritize speed and reliability over strict CLI adherence.