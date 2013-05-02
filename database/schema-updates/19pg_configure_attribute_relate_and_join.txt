ALTER TABLE configured_attribute ADD COLUMN feature_type int8;

alter table configured_attribute 
    add constraint FK521A69DBB7916580 
    foreign key (feature_type) 
    references feature_type;