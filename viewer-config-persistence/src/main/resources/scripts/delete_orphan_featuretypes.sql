
delete from application_layer_attributes where attribute_ in (select id  from configured_attribute where feature_type in (select id from feature_type where id not in (select feature_type from feature_source_feature_types)));
update configured_attribute set feature_type = null where feature_type in (select id from feature_type where id not in (select feature_type from feature_source_feature_types));
update configured_attribute set value_list_feature_type = null where value_list_feature_type in (select id from feature_type where id not in (select feature_type from feature_source_feature_types));
delete from feature_type_attributes where feature_type in (select id from feature_type where id not in (select feature_type from feature_source_feature_types));
delete from feature_type_relation_key where relation in (select id from feature_type_relation where feature_type in (select id from feature_type where id not in (select feature_type from feature_source_feature_types)));
delete from feature_type_relation where feature_type in (select id from feature_type where id not in (select feature_type from feature_source_feature_types));
update layer set feature_type = null where feature_type in (select id from feature_type where id not in (select feature_type from feature_source_feature_types));
delete from feature_type where id not in (select feature_type from feature_source_feature_types);