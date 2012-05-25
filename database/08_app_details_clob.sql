ALTER TABLE APPLICATION_DETAILS add value CLOB;
update application_details set value = details;
alter table application_details drop column details;

