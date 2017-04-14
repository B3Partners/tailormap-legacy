ALTER TABLE start_level ADD COLUMN removed bool not null DEFAULT false;
ALTER TABLE start_layer ADD COLUMN removed bool not null DEFAULT false;

