
insert into category (id,name) values(0,'root');

insert into category (id,name,parent,children_order) values(1,'Administratieve grenzen',0,0);

insert into geo_services(id,protocol,monitoring_enabled,name,url,category,services_order) values
 (1,'wms',0,'Gemeentes (CBS 2010)','http://mapserver.openwion.nl/cgi-bin/mapserv?map=/srv/b3p-wion/maps/gemeentes_cbs_2010.map',1,0);
-- id sequences start with 1
