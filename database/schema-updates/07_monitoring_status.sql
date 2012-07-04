alter table geo_service add monitoring_statusok number(1,0);
update geo_service set monitoring_statusok=1;
alter table geo_service modify monitoring_statusok not null;
