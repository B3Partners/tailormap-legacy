SET DATABASE REFERENTIAL INTEGRITY FALSE;
SET WRITE_DELAY 0

INSERT INTO application (id, authenticated_required, authorizations_modified, layout, max_crs, max_maxx, max_maxy, max_minx, max_miny, name, title, lang, start_crs, start_maxx, start_maxy, start_minx, start_miny, version, owner, root) VALUES (1, false, '2015-09-15 16:35:27.956', NULL, NULL, NULL, NULL, NULL, NULL, 'test', 'test title', 'nl_NL', NULL, NULL, NULL, NULL, NULL, '1', NULL, 2);

INSERT INTO application_details (application, value, details_key) VALUES (1, '#000000', 'steunkleur2');
INSERT INTO application_details (application, value, details_key) VALUES (1, '/resources/images/default_sprite.png', 'iconSprite');
INSERT INTO application_details (application, value, details_key) VALUES (1, '#FFFFFF', 'steunkleur1');
INSERT INTO application_details (application, value, details_key) VALUES (1, 'true', 'cachedSelectedContentDirty');
INSERT INTO application_details (application, value, details_key) VALUES (1, 'true', 'cachedExpandedSelectedContentDirty');

INSERT INTO application_layer (id, layer_name, service) VALUES (2, 'begroeid_terreinvakonderdeel_bestaand', 2);
INSERT INTO application_layer (id, layer_name, service) VALUES (3, 'begroeid_terreindeel', 2);
INSERT INTO application_layer (id, layer_name, service) VALUES (4, 'begroeid_terreinvakonderdeel', 2);
INSERT INTO application_layer (id, layer_name, service) VALUES (5, 'woonplaats', 3);
INSERT INTO application_layer (id, layer_name, service) VALUES (1, 'Openbasiskaart', 1);

INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (2, 1, 0);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (2, 2, 1);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (2, 3, 2);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (2, 4, 3);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (2, 5, 4);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (2, 6, 5);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (2, 7, 6);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (2, 8, 7);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (2, 9, 8);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (3, 10, 0);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (3, 11, 1);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (3, 12, 2);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (3, 13, 3);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (3, 14, 4);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (3, 15, 5);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (3, 16, 6);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (3, 17, 7);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (3, 18, 8);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (4, 19, 0);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (4, 20, 1);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (4, 21, 2);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (4, 22, 3);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (4, 23, 4);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (4, 24, 5);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (4, 25, 6);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (4, 26, 7);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (4, 27, 8);
INSERT INTO application_layer_attributes (application_layer, attribute_, list_index) VALUES (5, 28, 0);



INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (1, NULL, 'msGeometry', 'geometry');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (2, NULL, 'fid', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (3, NULL, 'id', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (4, NULL, 'dat_bgn', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (5, NULL, 'dat_end', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (6, NULL, 'fysiek_voork', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (7, NULL, 'ident', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (8, NULL, 'rel_hoogte', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (9, NULL, 'status', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (10, NULL, 'msGeometry', 'geometry');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (11, NULL, 'fid', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (12, NULL, 'id', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (13, NULL, 'dat_bgn', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (14, NULL, 'dat_end', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (15, NULL, 'fysiek_voork', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (16, NULL, 'ident', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (17, NULL, 'rel_hoogte', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (18, NULL, 'status', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (19, NULL, 'msGeometry', 'geometry');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (20, NULL, 'fid', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (21, NULL, 'id', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (22, NULL, 'dat_bgn', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (23, NULL, 'dat_end', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (24, NULL, 'fysiek_voork', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (25, NULL, 'ident', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (26, NULL, 'rel_hoogte', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (27, NULL, 'status', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (28, NULL, 'msGeometry', 'geometry');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (29, NULL, 'fid', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (30, NULL, 'id', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (31, NULL, 'dat_bgn', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (32, NULL, 'dat_end', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (33, NULL, 'fysiek_voork', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (34, NULL, 'ident', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (35, NULL, 'rel_hoogte', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (36, NULL, 'status', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (37, NULL, 'msGeometry', 'geometry');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (38, NULL, 'fid', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (39, NULL, 'id', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (40, NULL, 'dat_bgn', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (41, NULL, 'dat_end', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (42, NULL, 'fysiek_voork', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (43, NULL, 'ident', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (44, NULL, 'rel_hoogte', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (45, NULL, 'status', 'string');
INSERT INTO attribute_descriptor (id, name_alias, name, type) VALUES (46, NULL, 'msGeometry', 'geometry');


INSERT INTO category (id, name, parent) VALUES (0, 'Categoriën', NULL);
INSERT INTO category (id, name, parent) VALUES (1, 'Achtergrond', 0);
INSERT INTO category (id, name, parent) VALUES (2, 'Thematisch', 0);


INSERT INTO category_children (category, child, list_index) VALUES (0, 1, 0);
INSERT INTO category_children (category, child, list_index) VALUES (0, 2, 1);

INSERT INTO category_services (category, service, list_index) VALUES (1, 1, 0);
INSERT INTO category_services (category, service, list_index) VALUES (2, 2, 0);
INSERT INTO category_services (category, service, list_index) VALUES (2, 3, 1);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (1, 'msGeometry', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, false, 2, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (2, 'fid', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, true, 2, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (3, 'id', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, true, 2, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (4, 'dat_bgn', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, true, 2, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (5, 'dat_end', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, true, 2, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (6, 'fysiek_voork', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, true, 2, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (7, 'ident', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, true, 2, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (8, 'rel_hoogte', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, true, 2, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (9, 'status', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, true, 2, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (10, 'msGeometry', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, false, 5, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (11, 'fid', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, true, 5, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (12, 'id', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, true, 5, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (13, 'dat_bgn', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, true, 5, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (14, 'dat_end', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, true, 5, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (15, 'fysiek_voork', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, true, 5, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (16, 'ident', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, true, 5, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (17, 'rel_hoogte', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, true, 5, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (18, 'status', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, true, 5, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (19, 'msGeometry', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, false, 1, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (20, 'fid', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, true, 1, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (21, 'id', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, true, 1, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (22, 'dat_bgn', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, true, 1, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (23, 'dat_end', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, true, 1, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (24, 'fysiek_voork', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, true, 1, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (25, 'ident', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, true, 1, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (26, 'rel_hoogte', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, true, 1, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (27, 'status', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, true, 1, NULL, NULL, false, false, false, false, null);
INSERT INTO configured_attribute (id, attribute_name, default_value, edit_alias, edit_height, edit_values, editable, filterable, selectable, value_list, value_list_label_name, value_list_value_name, visible, feature_type, value_list_feature_source, value_list_feature_type, allow_value_list_only, disallow_null_value, disable_user_edit, automatic_value, automatic_value_type) VALUES (28, 'msGeometry', NULL, NULL, NULL, NULL, false, false, false, NULL, NULL, NULL, false, 4, NULL, NULL, false, false, false, false, null);

INSERT INTO feature_source (protocol, id, name, password, url, username, db_schema, linked_service) VALUES ('wfs', 1, 'Groen', 'w@chtw00rd', 'http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&', 'B3P', NULL, 2);
INSERT INTO feature_source (protocol, id, name, password, url, username, db_schema, linked_service) VALUES ('wfs', 2, 'woonplaatsen', 'w@chtw00rd', 'http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/woonplaats_productie.map&', 'B3P', NULL, 3);


INSERT INTO feature_source_feature_types (feature_source, feature_type, list_index) VALUES (1, 5, 0);
INSERT INTO feature_source_feature_types (feature_source, feature_type, list_index) VALUES (1, 1, 1);
INSERT INTO feature_source_feature_types (feature_source, feature_type, list_index) VALUES (1, 2, 2);
INSERT INTO feature_source_feature_types (feature_source, feature_type, list_index) VALUES (1, 3, 3);
INSERT INTO feature_source_feature_types (feature_source, feature_type, list_index) VALUES (1, 4, 4);
INSERT INTO feature_source_feature_types (feature_source, feature_type, list_index) VALUES (2, 6, 0);


INSERT INTO feature_type (id, description, geometry_attribute, type_name, writeable, feature_source) VALUES (1, 'begroeid_terreinvakonderdeel', 'msGeometry', 'begroeid_terreinvakonderdeel', false, 1);
INSERT INTO feature_type (id, description, geometry_attribute, type_name, writeable, feature_source) VALUES (2, 'begroeid_terreinvakonderdeel_bestaand', 'msGeometry', 'begroeid_terreinvakonderdeel_bestaand', false, 1);
INSERT INTO feature_type (id, description, geometry_attribute, type_name, writeable, feature_source) VALUES (3, 'begroeid_terreinvakonderdeel_historisch', 'msGeometry', 'begroeid_terreinvakonderdeel_historisch', false, 1);
INSERT INTO feature_type (id, description, geometry_attribute, type_name, writeable, feature_source) VALUES (4, 'begroeid_terreinvakonderdeel_plan', 'msGeometry', 'begroeid_terreinvakonderdeel_plan', false, 1);
INSERT INTO feature_type (id, description, geometry_attribute, type_name, writeable, feature_source) VALUES (5, 'begroeid_terreindeel', 'msGeometry', 'begroeid_terreindeel', false, 1);
INSERT INTO feature_type (id, description, geometry_attribute, type_name, writeable, feature_source) VALUES (6, 'woonplaats', 'msGeometry', 'woonplaats', false, 2);


INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (1, 1, 0);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (1, 2, 1);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (1, 3, 2);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (1, 4, 3);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (1, 5, 4);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (1, 6, 5);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (1, 7, 6);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (1, 8, 7);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (1, 9, 8);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (2, 10, 0);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (2, 11, 1);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (2, 12, 2);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (2, 13, 3);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (2, 14, 4);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (2, 15, 5);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (2, 16, 6);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (2, 17, 7);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (2, 18, 8);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (3, 19, 0);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (3, 20, 1);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (3, 21, 2);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (3, 22, 3);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (3, 23, 4);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (3, 24, 5);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (3, 25, 6);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (3, 26, 7);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (3, 27, 8);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (4, 28, 0);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (4, 29, 1);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (4, 30, 2);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (4, 31, 3);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (4, 32, 4);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (4, 33, 5);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (4, 34, 6);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (4, 35, 7);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (4, 36, 8);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (5, 37, 0);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (5, 38, 1);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (5, 39, 2);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (5, 40, 3);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (5, 41, 4);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (5, 42, 5);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (5, 43, 6);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (5, 44, 7);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (5, 45, 8);
INSERT INTO feature_type_attributes (feature_type, attribute_descriptor, list_index) VALUES (6, 46, 0);


INSERT INTO geo_service (protocol, id, authorizations_modified, monitoring_enabled, monitoring_statusok, name, password, url, username, tiling_protocol, exception_type, override_url, category, top_layer, geofence_header) VALUES ('tiled', 1, '2015-09-15 16:33:48.096', false, true, 'Openbasiskaart', NULL, 'http://www.openbasiskaart.nl/mapcache/tms/1.0.0/osm-nb@rd', NULL, 'TMS', NULL, NULL, 1, 1, NULL);
INSERT INTO geo_service (protocol, id, authorizations_modified, monitoring_enabled, monitoring_statusok, name, password, url, username, tiling_protocol, exception_type, override_url, category, top_layer, geofence_header) VALUES ('wms', 2, '2015-09-15 16:34:14.961', false, true, 'Groen', 'w@chtw00rd', 'http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&', 'B3P', NULL, 'Inimage', false, 2, 3, NULL);
INSERT INTO geo_service (protocol, id, authorizations_modified, monitoring_enabled, monitoring_statusok, name, password, url, username, tiling_protocol, exception_type, override_url, category, top_layer, geofence_header) VALUES ('wms', 3, '2015-09-15 16:34:29.301', false, true, 'woonplaatsen', 'w@chtw00rd', 'http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/woonplaats_productie.map&', 'B3P', NULL, 'Inimage', false, 2, 9, NULL);
INSERT INTO geo_service (protocol, id, authorizations_modified, monitoring_enabled, monitoring_statusok, name, password, url, username, tiling_protocol, exception_type, override_url, category, top_layer, geofence_header) VALUES ('wms', 4, '2018-11-22 13:34:29.301', false, true, 'woonplaatsen', 'w@chtw00rd', 'https://flamingo5.b3p.nl/geoserver/test_omgeving_fla5/wms', 'B3P', NULL, 'Inimage', false, 2, 1, NULL);

insert into geo_service_readers (geo_service, role_name) values (2, 'Admin');
insert into geo_service_readers (geo_service, role_name) values (4, 'Admin');

INSERT INTO geo_service_details (geoservice, value, details_key) VALUES (1, 'false', 'useIntersect');
INSERT INTO geo_service_details (geoservice, value, details_key) VALUES (2, 'false', 'useProxy');
INSERT INTO geo_service_details (geoservice, value, details_key) VALUES (2, 'false', 'useIntersect');
INSERT INTO geo_service_details (geoservice, value, details_key) VALUES (3, 'false', 'useProxy');
INSERT INTO geo_service_details (geoservice, value, details_key) VALUES (3, 'false', 'useIntersect');
INSERT INTO geo_service_details (geoservice, value, details_key) VALUES (4, 'true', 'useProxy');
INSERT INTO geo_service_details (geoservice, value, details_key) VALUES (4, 'true', 'useIntersect');


INSERT INTO geo_service_keywords (geo_service, keyword) VALUES (2, 'WMS');
INSERT INTO geo_service_keywords (geo_service, keyword) VALUES (2, 'http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&');
INSERT INTO geo_service_keywords (geo_service, keyword) VALUES (3, 'http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/woonplaats_productie.map');
INSERT INTO geo_service_keywords (geo_service, keyword) VALUES (3, 'WMS');
INSERT INTO geo_service_keywords (geo_service, keyword) VALUES (4, 'https://flamingo5.b3p.nl/geoserver/test_omgeving_fla5/wms');
INSERT INTO geo_service_keywords (geo_service, keyword) VALUES (4, 'WMS');


INSERT INTO group_ (name, description) VALUES ('Admin', 'Groep met toegang tot beheerapplicatie viewer');
INSERT INTO group_ (name, description) VALUES ('RegistryAdmin', 'Beheer van het gegevensregister');
INSERT INTO group_ (name, description) VALUES ('UserAdmin', 'Beheer van gebruikers en groepen');
INSERT INTO group_ (name, description) VALUES ('ApplicationAdmin', 'Beheer van applicaties');
INSERT INTO group_ (name, description) VALUES ('ServiceAdmin', 'Beheerders van services: e-mail notificatie bij monitoring');
INSERT INTO group_ (name, description) VALUES ('ExtendedUser', 'Interne medewerkers (via LDAP geauthenticeerd)');


INSERT INTO tile_set (name, height, width) VALUES ('Openbasiskaart', 256, 256);



INSERT INTO tile_set_resolutions (tile_set, resolution, list_index) VALUES ('Openbasiskaart', 3440.63999999999987, 0);
INSERT INTO tile_set_resolutions (tile_set, resolution, list_index) VALUES ('Openbasiskaart', 1720.31999999999994, 1);
INSERT INTO tile_set_resolutions (tile_set, resolution, list_index) VALUES ('Openbasiskaart', 860.159999999999968, 2);
INSERT INTO tile_set_resolutions (tile_set, resolution, list_index) VALUES ('Openbasiskaart', 430.079999999999984, 3);
INSERT INTO tile_set_resolutions (tile_set, resolution, list_index) VALUES ('Openbasiskaart', 215.039999999999992, 4);
INSERT INTO tile_set_resolutions (tile_set, resolution, list_index) VALUES ('Openbasiskaart', 107.519999999999996, 5);
INSERT INTO tile_set_resolutions (tile_set, resolution, list_index) VALUES ('Openbasiskaart', 53.759999999999998, 6);
INSERT INTO tile_set_resolutions (tile_set, resolution, list_index) VALUES ('Openbasiskaart', 26.879999999999999, 7);
INSERT INTO tile_set_resolutions (tile_set, resolution, list_index) VALUES ('Openbasiskaart', 13.4399999999999995, 8);
INSERT INTO tile_set_resolutions (tile_set, resolution, list_index) VALUES ('Openbasiskaart', 6.71999999999999975, 9);
INSERT INTO tile_set_resolutions (tile_set, resolution, list_index) VALUES ('Openbasiskaart', 3.35999999999999988, 10);
INSERT INTO tile_set_resolutions (tile_set, resolution, list_index) VALUES ('Openbasiskaart', 1.67999999999999994, 11);
INSERT INTO tile_set_resolutions (tile_set, resolution, list_index) VALUES ('Openbasiskaart', 0.839999999999999969, 12);
INSERT INTO tile_set_resolutions (tile_set, resolution, list_index) VALUES ('Openbasiskaart', 0.419999999999999984, 13);
INSERT INTO tile_set_resolutions (tile_set, resolution, list_index) VALUES ('Openbasiskaart', 0.209999999999999992, 14);
INSERT INTO tile_set_resolutions (tile_set, resolution, list_index) VALUES ('Openbasiskaart', 0.104999999999999996, 15);



INSERT INTO layer (id, filterable, legend_image_url, max_scale, min_scale, name, queryable, title, title_alias, virtual, feature_type, parent, service, tileset) VALUES (1, false, NULL, NULL, NULL, NULL, false, NULL, NULL, true, NULL, NULL, 1, NULL);
INSERT INTO layer (id, filterable, legend_image_url, max_scale, min_scale, name, queryable, title, title_alias, virtual, feature_type, parent, service, tileset) VALUES (2, false, NULL, NULL, NULL, 'Openbasiskaart', false, 'Openbasiskaart', NULL, false, NULL, 1, 1, 'Openbasiskaart');
INSERT INTO layer (id, filterable, legend_image_url, max_scale, min_scale, name, queryable, title, title_alias, virtual, feature_type, parent, service, tileset) VALUES (3, false, NULL, NULL, NULL, 'Groen', false, 'Groen', NULL, false, NULL, NULL, 2, NULL);
INSERT INTO layer (id, filterable, legend_image_url, max_scale, min_scale, name, queryable, title, title_alias, virtual, feature_type, parent, service, tileset) VALUES (4, false, 'http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=begroeid_terreindeel&format=image/png&STYLE=default', NULL, NULL, 'begroeid_terreindeel', true, 'begroeid_terreindeel', NULL, false, 5, 3, 2, NULL);
INSERT INTO layer (id, filterable, legend_image_url, max_scale, min_scale, name, queryable, title, title_alias, virtual, feature_type, parent, service, tileset) VALUES (5, false, 'http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=begroeid_terreinvakonderdeel&format=image/png&STYLE=default', NULL, NULL, 'begroeid_terreinvakonderdeel', true, 'begroeid_terreinvakonderdeel', NULL, false, 1, 3, 2, NULL);
INSERT INTO layer (id, filterable, legend_image_url, max_scale, min_scale, name, queryable, title, title_alias, virtual, feature_type, parent, service, tileset) VALUES (6, false, 'http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=begroeid_terreinvakonderdeel_bestaand&format=image/png&STYLE=default', NULL, NULL, 'begroeid_terreinvakonderdeel_bestaand', true, 'begroeid_terreinvakonderdeel_bestaand', NULL, false, 2, 3, 2, NULL);
INSERT INTO layer (id, filterable, legend_image_url, max_scale, min_scale, name, queryable, title, title_alias, virtual, feature_type, parent, service, tileset) VALUES (7, false, 'http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=begroeid_terreinvakonderdeel_historisch&format=image/png&STYLE=default', NULL, NULL, 'begroeid_terreinvakonderdeel_historisch', true, 'begroeid_terreinvakonderdeel_historisch', NULL, false, 3, 3, 2, NULL);
INSERT INTO layer (id, filterable, legend_image_url, max_scale, min_scale, name, queryable, title, title_alias, virtual, feature_type, parent, service, tileset) VALUES (8, false, 'http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=begroeid_terreinvakonderdeel_plan&format=image/png&STYLE=default', NULL, NULL, 'begroeid_terreinvakonderdeel_plan', true, 'begroeid_terreinvakonderdeel_plan', NULL, false, 4, 3, 2, NULL);
INSERT INTO layer (id, filterable, legend_image_url, max_scale, min_scale, name, queryable, title, title_alias, virtual, feature_type, parent, service, tileset) VALUES (9, false, NULL, NULL, NULL, 'woonplaatsen', false, 'woonplaatsen', NULL, false, NULL, NULL, 3, NULL);
INSERT INTO layer (id, filterable, legend_image_url, max_scale, min_scale, name, queryable, title, title_alias, virtual, feature_type, parent, service, tileset) VALUES (10, false, 'http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/woonplaats_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=woonplaats&format=image/png&STYLE=default', NULL, NULL, 'woonplaats', true, 'woonplaats', NULL, false, 6, 9, 3, NULL);

INSERT INTO layer_bounding_boxes (layer, name, maxx, maxy, minx, miny, crs) VALUES (2, '28992', 595401, 903401, -285401, 22598, '28992');



INSERT INTO layer_children (layer, child, list_index) VALUES (1, 2, 0);
INSERT INTO layer_children (layer, child, list_index) VALUES (3, 4, 0);
INSERT INTO layer_children (layer, child, list_index) VALUES (3, 5, 1);
INSERT INTO layer_children (layer, child, list_index) VALUES (3, 6, 2);
INSERT INTO layer_children (layer, child, list_index) VALUES (3, 7, 3);
INSERT INTO layer_children (layer, child, list_index) VALUES (3, 8, 4);
INSERT INTO layer_children (layer, child, list_index) VALUES (9, 10, 0);


INSERT INTO layer_crs_list (layer, crs) VALUES (3, 'EPSG:28992');
INSERT INTO layer_crs_list (layer, crs) VALUES (4, 'EPSG:28992');
INSERT INTO layer_crs_list (layer, crs) VALUES (5, 'EPSG:28992');
INSERT INTO layer_crs_list (layer, crs) VALUES (6, 'EPSG:28992');
INSERT INTO layer_crs_list (layer, crs) VALUES (7, 'EPSG:28992');
INSERT INTO layer_crs_list (layer, crs) VALUES (8, 'EPSG:28992');
INSERT INTO layer_crs_list (layer, crs) VALUES (9, 'EPSG:28992');
INSERT INTO layer_crs_list (layer, crs) VALUES (10, 'EPSG:28992');


INSERT INTO layer_details (layer, value, details_key) VALUES (2, 'png', 'image_extension');
INSERT INTO layer_details (layer, value, details_key) VALUES (4, '[{"name":"default","legendURLs":["http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=begroeid_terreindeel&format=image/png&STYLE=default"],"title":"default"}]', 'wms.styles');
INSERT INTO layer_details (layer, value, details_key) VALUES (5, '[{"name":"default","legendURLs":["http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=begroeid_terreinvakonderdeel&format=image/png&STYLE=default"],"title":"default"}]', 'wms.styles');
INSERT INTO layer_details (layer, value, details_key) VALUES (6, '[{"name":"default","legendURLs":["http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=begroeid_terreinvakonderdeel_bestaand&format=image/png&STYLE=default"],"title":"default"}]', 'wms.styles');
INSERT INTO layer_details (layer, value, details_key) VALUES (7, '[{"name":"default","legendURLs":["http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=begroeid_terreinvakonderdeel_historisch&format=image/png&STYLE=default"],"title":"default"}]', 'wms.styles');
INSERT INTO layer_details (layer, value, details_key) VALUES (8, '[{"name":"default","legendURLs":["http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/groen_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=begroeid_terreinvakonderdeel_plan&format=image/png&STYLE=default"],"title":"default"}]', 'wms.styles');
INSERT INTO layer_details (layer, value, details_key) VALUES (10, '[{"name":"default","legendURLs":["http://x12.b3p.nl/cgi-bin/mapserv?map=/srv/maps/solparc/woonplaats_productie.map&version=1.1.1&service=WMS&request=GetLegendGraphic&layer=woonplaats&format=image/png&STYLE=default"],"title":"default"}]', 'wms.styles');

INSERT INTO level_ (id, background, info, name, url, parent) VALUES (2, false, NULL, 'Applicatie', NULL, NULL);
INSERT INTO level_ (id, background, info, name, url, parent) VALUES (1, true, NULL, 'Achtergrond', NULL, 2);
INSERT INTO level_ (id, background, info, name, url, parent) VALUES (4, false, NULL, 'Thema', NULL, 2);
INSERT INTO level_ (id, background, info, name, url, parent) VALUES (3, false, NULL, 'OSM', NULL, 1);
INSERT INTO level_ (id, background, info, name, url, parent) VALUES (5, false, NULL, 'Groen', NULL, 4);
INSERT INTO level_ (id, background, info, name, url, parent) VALUES (6, false, NULL, 'Woonplaatsen', NULL, 4);

INSERT INTO level_children (level_, child, list_index) VALUES (2, 1, 0);
INSERT INTO level_children (level_, child, list_index) VALUES (1, 3, 0);
INSERT INTO level_children (level_, child, list_index) VALUES (2, 4, 1);
INSERT INTO level_children (level_, child, list_index) VALUES (4, 5, 0);
INSERT INTO level_children (level_, child, list_index) VALUES (4, 6, 1);



INSERT INTO level_layers (level_, layer, list_index) VALUES (3, 1, 0);
INSERT INTO level_layers (level_, layer, list_index) VALUES (5, 2, 0);
INSERT INTO level_layers (level_, layer, list_index) VALUES (5, 3, 1);
INSERT INTO level_layers (level_, layer, list_index) VALUES (5, 4, 2);
INSERT INTO level_layers (level_, layer, list_index) VALUES (6, 5, 0);

insert into solr_conf (id, name, simple_feature_type) values (1, 'pietje', 5);

insert into SOLR_CONF_INDEX_ATTRIBUTES (solr_conf, attribute_) values(1, 43); 
insert into SOLR_CONF_INDEX_ATTRIBUTES (solr_conf, attribute_) values(1, 45); 

insert into SOLR_CONF_RESULT_ATTRIBUTES (solr_conf, attribute_) values(1, 43); 
insert into SOLR_CONF_RESULT_ATTRIBUTES (solr_conf, attribute_)	values(1, 45); 

INSERT INTO START_LEVEL (ID, SELECTED_INDEX, APPLICATION, LEVEL_,REMOVED) VALUES (42, null, 1, 1, false);
INSERT INTO START_LEVEL (ID, SELECTED_INDEX, APPLICATION, LEVEL_,REMOVED) VALUES (43, null, 1, 2, false);
INSERT INTO START_LEVEL (ID, SELECTED_INDEX, APPLICATION, LEVEL_,REMOVED) VALUES (44, 0, 1, 3, false);
INSERT INTO START_LEVEL (ID, SELECTED_INDEX, APPLICATION, LEVEL_,REMOVED) VALUES (45, null, 1, 4, false);
INSERT INTO START_LEVEL (ID, SELECTED_INDEX, APPLICATION, LEVEL_,REMOVED) VALUES (46, 1, 1, 5, false);
INSERT INTO START_LEVEL (ID, SELECTED_INDEX, APPLICATION, LEVEL_,REMOVED) VALUES (47, 2, 1, 6, false);

INSERT INTO START_LAYER (ID, CHECKED, SELECTED_INDEX, APPLICATION, APPLICATION_LAYER, REMOVED) VALUES (24, true, null, 1, 1, false);
INSERT INTO START_LAYER (ID, CHECKED, SELECTED_INDEX, APPLICATION, APPLICATION_LAYER, REMOVED) VALUES (25, false, null, 1, 2, false);
INSERT INTO START_LAYER (ID, CHECKED, SELECTED_INDEX, APPLICATION, APPLICATION_LAYER, REMOVED) VALUES (26, false, null, 1, 3, false);
INSERT INTO START_LAYER (ID, CHECKED, SELECTED_INDEX, APPLICATION, APPLICATION_LAYER, REMOVED) VALUES (27, false, null, 1, 4, false);
INSERT INTO START_LAYER (ID, CHECKED, SELECTED_INDEX, APPLICATION, APPLICATION_LAYER, REMOVED) VALUES (28, false, null, 1, 5, false);

INSERT INTO metadata (id, config_key, config_value) VALUES (1, 'database_version', '39');

INSERT INTO user_ (username, password) VALUES ('admin', '14c06474bec5e7def0304925d09f2b977af3146a');
INSERT INTO user_ (username, password) VALUES ('pietje', '14c06474bec5e7def0304925d09f2b977af3146a');



INSERT INTO user_groups (username, group_) VALUES ('admin', 'Admin');
INSERT INTO user_groups (username, group_) VALUES ('pietje', 'UserAdmin');

SET DATABASE REFERENTIAL INTEGRITY TRUE;
