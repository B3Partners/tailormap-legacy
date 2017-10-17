ALTER TABLE start_level ADD COLUMN removed bit not null DEFAULT false;
ALTER TABLE start_layer ADD COLUMN removed bit not null DEFAULT false;

