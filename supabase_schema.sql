-- ============================================================
-- NetworkOS — Supabase Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- CORE: Profiles (extends Supabase auth.users)
-- ============================================================

CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- CORE: Companies (directory shared across a user's contacts)
-- ============================================================

CREATE TABLE companies (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  domain          TEXT,                        -- e.g. "stripe.com"
  -- Used to auto-construct work emails: {first}.{last}@domain
  email_format    TEXT,                        -- e.g. "{first}.{last}" or "{first}{last}"
  industry        TEXT,
  website         TEXT,
  linkedin_url    TEXT,
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- CORE: Contacts
-- ============================================================

CREATE TABLE contacts (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id          UUID REFERENCES companies(id) ON DELETE SET NULL,
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  role                TEXT,
  work_email          TEXT,                    -- manual or auto-derived from company email_format
  personal_email      TEXT,
  linkedin_url        TEXT,
  phone               TEXT,
  status              TEXT DEFAULT 'cold'
                        CHECK (status IN ('cold', 'networking', 'warm', 'mentor', 'advocate')),
  relationship_score  INTEGER DEFAULT 0
                        CHECK (relationship_score BETWEEN 0 AND 100),
  last_contact_at     TIMESTAMPTZ,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- CONNECTED ACCOUNTS: Email Inboxes
-- ============================================================

CREATE TABLE email_accounts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider          TEXT NOT NULL CHECK (provider IN ('gmail', 'outlook', 'other')),
  email_address     TEXT NOT NULL,
  access_token      TEXT,                      -- store encrypted (use Supabase Vault in prod)
  refresh_token     TEXT,
  token_expires_at  TIMESTAMPTZ,
  is_primary        BOOLEAN DEFAULT FALSE,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, email_address)
);


-- ============================================================
-- CONNECTED ACCOUNTS: Calendars
-- ============================================================

CREATE TABLE calendar_accounts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider          TEXT NOT NULL CHECK (provider IN ('google', 'outlook', 'other')),
  email_address     TEXT NOT NULL,
  access_token      TEXT,
  refresh_token     TEXT,
  token_expires_at  TIMESTAMPTZ,
  is_primary        BOOLEAN DEFAULT FALSE,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, email_address)
);


-- ============================================================
-- OUTREACH: Threads
-- One thread = one outreach campaign to one contact
-- ============================================================

CREATE TABLE outreach_threads (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_id        UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  email_account_id  UUID REFERENCES email_accounts(id) ON DELETE SET NULL,
  subject           TEXT,
  -- The prompt the user gave to the AI (e.g. "interested in 30-min coffee chat")
  ai_context        TEXT,
  ai_prompt_source  TEXT DEFAULT 'chatbot'
                      CHECK (ai_prompt_source IN ('chatbot', 'wispr_flow', 'manual')),
  status            TEXT DEFAULT 'draft'
                      CHECK (status IN (
                        'draft', 'sent', 'awaiting_reply', 'replied',
                        'follow_up_scheduled', 'meeting_scheduled', 'completed', 'dead'
                      )),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- OUTREACH: Emails (drafts, scheduled, sent, received)
-- ============================================================

CREATE TABLE emails (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id             UUID REFERENCES outreach_threads(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_id            UUID REFERENCES contacts(id) ON DELETE SET NULL,
  email_account_id      UUID REFERENCES email_accounts(id) ON DELETE SET NULL,
  direction             TEXT NOT NULL DEFAULT 'outbound'
                          CHECK (direction IN ('outbound', 'inbound')),
  subject               TEXT,
  body_html             TEXT,
  body_text             TEXT,
  status                TEXT DEFAULT 'draft'
                          CHECK (status IN (
                            'draft', 'scheduled', 'sent', 'delivered', 'failed', 'received'
                          )),
  is_follow_up          BOOLEAN DEFAULT FALSE,
  follow_up_number      INTEGER,               -- 1 = first follow-up, 2 = second, etc.
  scheduled_at          TIMESTAMPTZ,           -- for scheduled sends
  sent_at               TIMESTAMPTZ,
  received_at           TIMESTAMPTZ,
  external_message_id   TEXT,                  -- provider's message ID
  external_thread_id    TEXT,                  -- provider's thread ID
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- FOLLOW-UPS: Rule Configs
-- contact_id NULL = global default rule for all outreach
-- contact_id SET  = per-contact override
-- ============================================================

CREATE TABLE follow_up_configs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_id    UUID REFERENCES contacts(id) ON DELETE CASCADE,   -- NULL = global
  name          TEXT NOT NULL DEFAULT 'Default',
  -- TRUE = "never follow up with this contact at all"
  is_disabled   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  -- One rule per (user + contact). Global rule: (user_id, NULL) is unique per user.
  UNIQUE (user_id, contact_id)
);

-- Individual steps within a follow-up config
-- Example: step 1 = 5 days, step 2 = 12 days
CREATE TABLE follow_up_steps (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id     UUID NOT NULL REFERENCES follow_up_configs(id) ON DELETE CASCADE,
  step_number   INTEGER NOT NULL,
  delay_days    INTEGER NOT NULL,              -- days after the previous email
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (config_id, step_number)
);

-- Actual scheduled follow-up instances tied to a specific thread
CREATE TABLE scheduled_follow_ups (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id     UUID NOT NULL REFERENCES outreach_threads(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  step_number   INTEGER NOT NULL,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  status        TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending', 'sent', 'cancelled', 'skipped')),
  email_id      UUID REFERENCES emails(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- AI: Response Classifications
-- Agent classifies inbound replies and flags obscure ones
-- ============================================================

CREATE TABLE ai_classifications (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_id          UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  thread_id         UUID REFERENCES outreach_threads(id) ON DELETE SET NULL,
  classification    TEXT NOT NULL
                      CHECK (classification IN (
                        'interested',        -- wants to connect
                        'not_interested',    -- decline
                        'maybe',             -- soft interest, needs nurturing
                        'meeting_confirmed', -- explicit yes with a time
                        'time_suggestions',  -- suggested multiple slots (escalate to user)
                        'needs_more_info',   -- asked a question back
                        'out_of_office',     -- OOO auto-reply
                        'obscure',           -- agent can't determine intent → flag
                        'other'
                      )),
  confidence_score  FLOAT CHECK (confidence_score BETWEEN 0 AND 1),
  summary           TEXT,                    -- brief AI plain-english summary
  -- Escalations back to user
  is_flagged        BOOLEAN DEFAULT FALSE,
  flag_reason       TEXT,
  resolved_at       TIMESTAMPTZ,
  resolved_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Proposed time slots extracted from target's reply (when classification = 'time_suggestions')
CREATE TABLE proposed_meeting_times (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classification_id     UUID REFERENCES ai_classifications(id) ON DELETE CASCADE,
  thread_id             UUID NOT NULL REFERENCES outreach_threads(id) ON DELETE CASCADE,
  proposed_start_at     TIMESTAMPTZ NOT NULL,
  proposed_end_at       TIMESTAMPTZ,
  is_selected           BOOLEAN DEFAULT FALSE,  -- user picked this slot
  created_at            TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- MEETINGS
-- ============================================================

CREATE TABLE meetings (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_id            UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  thread_id             UUID REFERENCES outreach_threads(id) ON DELETE SET NULL,
  calendar_account_id   UUID REFERENCES calendar_accounts(id) ON DELETE SET NULL,
  title                 TEXT NOT NULL,
  description           TEXT,
  status                TEXT DEFAULT 'proposed'
                          CHECK (status IN (
                            'proposed', 'scheduled', 'completed', 'cancelled', 'rescheduled'
                          )),
  duration_minutes      INTEGER DEFAULT 30,
  scheduled_start_at    TIMESTAMPTZ,
  scheduled_end_at      TIMESTAMPTZ,
  meeting_link          TEXT,
  location              TEXT,
  external_event_id     TEXT,                  -- calendar provider's event ID
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting prep notes (reminders of key topics/questions before the call)
CREATE TABLE meeting_prep (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id      UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notes           TEXT,
  key_questions   TEXT[],                      -- array of questions to ask
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- RELATIONSHIP: Journal Entries
-- Manual notes, call transcripts (auto or uploaded)
-- ============================================================

CREATE TABLE journal_entries (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_id          UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  meeting_id          UUID REFERENCES meetings(id) ON DELETE SET NULL,
  type                TEXT NOT NULL DEFAULT 'note'
                        CHECK (type IN (
                          'note',             -- free-form user note
                          'call_transcript',  -- transcript of a call
                          'meeting_summary',  -- AI or manual post-meeting summary
                          'email_summary'     -- summary of an email thread
                        )),
  content             TEXT,
  transcript_source   TEXT
                        CHECK (transcript_source IN (
                          'auto_uploaded', 'user_uploaded', 'manual'
                        )),
  call_date           TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- RELATIONSHIP: Reconnect Reminders
-- "Ping this contact every X days"
-- contact_id NULL rows could be used for global defaults
-- ============================================================

CREATE TABLE reconnect_reminders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_id        UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  interval_days     INTEGER NOT NULL DEFAULT 30,
  last_reminded_at  TIMESTAMPTZ,
  next_remind_at    TIMESTAMPTZ,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, contact_id)
);


-- ============================================================
-- ACTIVITY LOG: Interactions (unified timestamped log)
-- ============================================================

CREATE TABLE interactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_id      UUID REFERENCES contacts(id) ON DELETE SET NULL,
  type            TEXT NOT NULL
                    CHECK (type IN (
                      'email_sent', 'email_received', 'meeting',
                      'call', 'note', 'reminder'
                    )),
  -- Polymorphic reference to the source record
  reference_id    UUID,
  reference_type  TEXT
                    CHECK (reference_type IN (
                      'email', 'meeting', 'journal_entry', 'reminder'
                    )),
  summary         TEXT,                        -- human-readable description
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- TRIGGERS: Auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at          BEFORE UPDATE ON profiles              FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_companies_updated_at         BEFORE UPDATE ON companies             FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_contacts_updated_at          BEFORE UPDATE ON contacts              FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_email_accounts_updated_at    BEFORE UPDATE ON email_accounts        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_calendar_accounts_updated_at BEFORE UPDATE ON calendar_accounts     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_outreach_threads_updated_at  BEFORE UPDATE ON outreach_threads      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_emails_updated_at            BEFORE UPDATE ON emails                FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_follow_up_configs_updated_at BEFORE UPDATE ON follow_up_configs     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_scheduled_follow_ups_upd_at  BEFORE UPDATE ON scheduled_follow_ups  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_meetings_updated_at          BEFORE UPDATE ON meetings              FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_meeting_prep_updated_at      BEFORE UPDATE ON meeting_prep          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_journal_entries_updated_at   BEFORE UPDATE ON journal_entries       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_reconnect_reminders_upd_at   BEFORE UPDATE ON reconnect_reminders   FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- TRIGGER: Auto-create profile on new auth user signup
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- TRIGGER: Auto-log interactions when an email is sent
-- ============================================================

CREATE OR REPLACE FUNCTION log_email_interaction()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'sent' AND (OLD.status IS NULL OR OLD.status <> 'sent') THEN
    INSERT INTO interactions (user_id, contact_id, type, reference_id, reference_type, summary, occurred_at)
    VALUES (
      NEW.user_id,
      NEW.contact_id,
      CASE WHEN NEW.direction = 'outbound' THEN 'email_sent' ELSE 'email_received' END,
      NEW.id,
      'email',
      CASE WHEN NEW.is_follow_up
        THEN 'Follow-up #' || NEW.follow_up_number || ' sent: ' || COALESCE(NEW.subject, '(no subject)')
        ELSE 'Email sent: ' || COALESCE(NEW.subject, '(no subject)')
      END,
      COALESCE(NEW.sent_at, NOW())
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_email_interaction
  AFTER INSERT OR UPDATE ON emails
  FOR EACH ROW EXECUTE FUNCTION log_email_interaction();


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Every user can only see and modify their own data.
-- ============================================================

ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies             ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_accounts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_accounts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_threads      ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails                ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_configs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_steps       ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_follow_ups  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_classifications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposed_meeting_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings              ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_prep          ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries       ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconnect_reminders   ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions          ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Own profile" ON profiles FOR ALL USING (auth.uid() = id);

-- companies (shared: any authenticated user can read; only creator can mutate)
CREATE POLICY "Read companies"   ON companies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Manage companies" ON companies FOR ALL   USING (auth.uid() = created_by);

-- contacts
CREATE POLICY "Own contacts" ON contacts FOR ALL USING (auth.uid() = user_id);

-- email_accounts
CREATE POLICY "Own email accounts" ON email_accounts FOR ALL USING (auth.uid() = user_id);

-- calendar_accounts
CREATE POLICY "Own calendar accounts" ON calendar_accounts FOR ALL USING (auth.uid() = user_id);

-- outreach_threads
CREATE POLICY "Own threads" ON outreach_threads FOR ALL USING (auth.uid() = user_id);

-- emails
CREATE POLICY "Own emails" ON emails FOR ALL USING (auth.uid() = user_id);

-- follow_up_configs
CREATE POLICY "Own follow-up configs" ON follow_up_configs FOR ALL USING (auth.uid() = user_id);

-- follow_up_steps (scoped via config ownership)
CREATE POLICY "Own follow-up steps" ON follow_up_steps FOR ALL
  USING (config_id IN (SELECT id FROM follow_up_configs WHERE user_id = auth.uid()));

-- scheduled_follow_ups
CREATE POLICY "Own scheduled follow-ups" ON scheduled_follow_ups FOR ALL USING (auth.uid() = user_id);

-- ai_classifications (scoped via email ownership)
CREATE POLICY "Own classifications" ON ai_classifications FOR ALL
  USING (email_id IN (SELECT id FROM emails WHERE user_id = auth.uid()));

-- proposed_meeting_times (scoped via thread ownership)
CREATE POLICY "Own proposed times" ON proposed_meeting_times FOR ALL
  USING (thread_id IN (SELECT id FROM outreach_threads WHERE user_id = auth.uid()));

-- meetings
CREATE POLICY "Own meetings" ON meetings FOR ALL USING (auth.uid() = user_id);

-- meeting_prep
CREATE POLICY "Own meeting prep" ON meeting_prep FOR ALL USING (auth.uid() = user_id);

-- journal_entries
CREATE POLICY "Own journal" ON journal_entries FOR ALL USING (auth.uid() = user_id);

-- reconnect_reminders
CREATE POLICY "Own reminders" ON reconnect_reminders FOR ALL USING (auth.uid() = user_id);

-- interactions
CREATE POLICY "Own interactions" ON interactions FOR ALL USING (auth.uid() = user_id);
