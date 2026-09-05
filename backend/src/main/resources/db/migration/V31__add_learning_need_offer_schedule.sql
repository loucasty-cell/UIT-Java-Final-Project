ALTER TABLE learning_need_offers
    ADD COLUMN proposed_start TIMESTAMP WITH TIME ZONE;

UPDATE learning_need_offers
SET proposed_start = created_at + INTERVAL '1 day'
WHERE proposed_start IS NULL;

ALTER TABLE learning_need_offers
    ALTER COLUMN proposed_start SET NOT NULL;
