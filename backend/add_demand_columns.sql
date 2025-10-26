ALTER TABLE demands ADD COLUMN property_requirements TEXT;
ALTER TABLE demands ADD COLUMN common_filters TEXT;
ALTER TABLE demands ADD COLUMN locations TEXT;
ALTER TABLE demands ADD COLUMN valid_until DATETIME;
ALTER TABLE demands ADD COLUMN last_confirmed_at DATETIME;
