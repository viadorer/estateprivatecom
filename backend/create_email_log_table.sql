CREATE TABLE IF NOT EXISTS email_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  recipient_user_id INTEGER,
  template_key TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  error_message TEXT,
  message_id TEXT,
  variables TEXT,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_email_log_recipient ON email_log(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_email_log_template ON email_log(template_key);
CREATE INDEX IF NOT EXISTS idx_email_log_sent_at ON email_log(sent_at);
