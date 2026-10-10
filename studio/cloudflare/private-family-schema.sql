CREATE TABLE IF NOT EXISTS private_family_backups (token_hash TEXT PRIMARY KEY, iv TEXT NOT NULL, ciphertext TEXT NOT NULL, revision INTEGER NOT NULL, updated_at INTEGER NOT NULL, expires_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS private_family_expiry ON private_family_backups(expires_at);
