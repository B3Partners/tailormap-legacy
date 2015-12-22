ALTER TABLE configured_attribute
  ADD       value_list_label_name varchar2(255 char);

  ALTER TABLE configured_attribute
  ADD value_list_value_name varchar2(255 char);
  
  ALTER TABLE configured_attribute
  ADD value_list_feature_source number(19,0);

  ALTER TABLE configured_attribute
  ADD value_list_feature_type number(19,0);



  ALTER TABLE configured_attribute
  ADD value_list varchar2(255 char);
  
          alter table configured_attribute 
        add constraint FK521A69DBEC20F033 
        foreign key (value_list_feature_type) 
        references feature_type;

    alter table configured_attribute 
        add constraint FK521A69DB72DC0207 
        foreign key (value_list_feature_source) 
        references feature_source;