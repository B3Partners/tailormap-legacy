alter table geo_service
  add version varchar2(6 char);
update geo_service set version = '1.1.1';
