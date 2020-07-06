alter table configured_attribute
add automatic_value number(1,0);
update configured_attribute set automatic_value = 0;
alter table configured_attribute modify (automatic_value not null);
alter table configured_attribute add automatic_value_type varchar2(255 char);
