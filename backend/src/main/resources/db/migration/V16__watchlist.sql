-- V16: Watchlist / Bookmarks Persistence

CREATE TABLE IF NOT EXISTS watchlist_items (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('SKILL', 'MENTOR')),
    item_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uq_user_watchlist_item UNIQUE(user_id, item_type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist_items (user_id, created_at DESC);
