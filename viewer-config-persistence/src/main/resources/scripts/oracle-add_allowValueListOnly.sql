ALTER TABLE configured_attribute ADD allow_value_list_only number(1,0) default 1 not null;
ALTER TABLE configured_attribute ADD disallow_null_value number(1,0) default 1 not null;