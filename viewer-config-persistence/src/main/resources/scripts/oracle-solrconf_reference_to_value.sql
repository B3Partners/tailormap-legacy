ALTER TABLE solr_conf_index_attributes
  ADD  attributename varchar(255);

update solr_conf_index_attributes scia
set attributename = 
(select name 
from attribute_descriptor ad 
where ad.id = scia.attribute_);

ALTER TABLE solr_conf_result_attributes
  ADD  attributename varchar(255);

update solr_conf_result_attributes scia
set attributename = 
(select name 
from attribute_descriptor ad 
where ad.id = scia.attribute_);


alter table solr_conf_index_attributes drop column attribute_;
alter table solr_conf_result_attributes drop column attribute_;

alter table solr_conf_index_attributes rename column attributename to attribute_;
alter table solr_conf_result_attributes rename column attributename to attribute_;
