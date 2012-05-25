alter table application_details add temp varchar2(255);
update application_details set temp = details;
alter table application_details drop column details;
ALTER TABLE APPLICATION_DETAILS add DETAILS CLOB;
update application_details set details = temp;
alter table application_details drop column temp;

