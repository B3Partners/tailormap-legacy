ALTER TABLE configured_attribute ADD COLUMN allow_value_list_only bool not null DEFAULT false;
ALTER TABLE configured_attribute ADD COLUMN disallow_null_value bool not null DEFAULT false;