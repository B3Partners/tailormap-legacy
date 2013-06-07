alter table layer_details add value text;
update layer_details set value = details;
alter table layer_details drop column details;

