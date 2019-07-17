alter table configured_attribute
add column automatic_value bool not null default false,
add column automatic_value_type varchar(255);