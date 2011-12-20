insert into application(id,name) values(1,'default');
SELECT app_id_seq.NEXTVAL FROM dual;

insert into category (id,name) values(0,'root');

insert into category (id,name) values(1,'Administratieve grenzen');
insert into category_children(category,child,list_index) values(0,1,0);

insert into geo_service(id,protocol,monitoring_enabled,name,url,category) values
 (1,'wms',0,'Gemeentes (CBS 2010)','http://mapserver.openwion.nl/cgi-bin/mapserv?map=/srv/b3p-wion/maps/gemeentes_cbs_2010.map',1);
insert into category_services(category,service,list_index) values(1,1,0); 
 
SELECT category_id_seq.NEXTVAL FROM dual;
SELECT geo_service_id_seq.NEXTVAL FROM dual;

