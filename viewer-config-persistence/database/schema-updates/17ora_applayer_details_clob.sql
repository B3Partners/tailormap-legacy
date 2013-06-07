alter table application_layer_details add value CLOB;
update application_layer_details set value = details;
alter table application_layer_details drop column details;

