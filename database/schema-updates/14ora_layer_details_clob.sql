ALTER TABLE LAYER_DETAILS add value CLOB;
update layer_details set value = details;
alter table layer_details drop column details;

