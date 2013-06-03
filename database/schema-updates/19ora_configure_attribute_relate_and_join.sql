ALTER TABLE configured_attribute ADD (feature_type number(19,0));

alter table configured_attribute 
    add constraint FK521A69DBB7916580 
    foreign key (feature_type) 
    references feature_type;