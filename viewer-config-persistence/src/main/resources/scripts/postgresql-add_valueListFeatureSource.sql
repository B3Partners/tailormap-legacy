



ALTER TABLE configured_attribute
  ADD COLUMN      value_list_label_name varchar(255);

  ALTER TABLE configured_attribute
  ADD COLUMN value_list_value_name varchar(255);
  
  ALTER TABLE configured_attribute
  ADD COLUMN value_list_feature_source int8;

  ALTER TABLE configured_attribute
  ADD COLUMN value_list_feature_type int8;



  ALTER TABLE configured_attribute
  ADD COLUMN value_list varchar(255);
  
          alter table configured_attribute 
        add constraint FK521A69DBEC20F033 
        foreign key (value_list_feature_type) 
        references feature_type;

    alter table configured_attribute 
        add constraint FK521A69DB72DC0207 
        foreign key (value_list_feature_source) 
        references feature_source;