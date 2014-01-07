ALTER TABLE solr_configuration RENAME TO solr_conf;
ALTER TABLE solr_conf DROP CONSTRAINT fkb8f008594ac66eed;
ALTER TABLE solr_conf ADD CONSTRAINT fkb8f008594ac66eed FOREIGN KEY (simple_feature_type)
      REFERENCES feature_type (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION;


ALTER TABLE solr_configuration_index_attributes RENAME TO solr_conf_index_attributes;
ALTER TABLE solr_conf_index_attributes DROP CONSTRAINT fk83a3760a893d7fec;
ALTER TABLE solr_conf_index_attributes DROP CONSTRAINT fk83a3760a91241d0d;
ALTER TABLE solr_conf_index_attributes ADD CONSTRAINT fk83a3760a893d7fec FOREIGN KEY (solr_configuration)
      REFERENCES solr_conf (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE solr_conf_index_attributes ADD CONSTRAINT fk83a3760a91241d0d FOREIGN KEY (attribute_)
      REFERENCES attribute_descriptor (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE solr_configuration_result_attributes RENAME TO solr_conf_result_attributes;
ALTER TABLE solr_conf_result_attributes DROP CONSTRAINT fk194de053893d7fec;
ALTER TABLE solr_conf_result_attributes DROP CONSTRAINT fk194de05391241d0d;
ALTER TABLE solr_conf_result_attributes ADD CONSTRAINT fk194de053893d7fec FOREIGN KEY (solr_configuration)
      REFERENCES solr_conf (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE solr_conf_result_attributes ADD CONSTRAINT fk194de05391241d0d FOREIGN KEY (attribute_)
      REFERENCES attribute_descriptor (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE solr_configuration_id_seq RENAME TO solr_conf_id_seq;

ALTER TABLE solr_conf
   ALTER COLUMN id SET DEFAULT nextval('solr_conf_id_seq'::regclass);
ALTER TABLE solr_conf DROP CONSTRAINT fkb8f008594ac66eed;
ALTER TABLE solr_conf ADD CONSTRAINT fkb8f008594ac66eed FOREIGN KEY (simple_feature_type)
      REFERENCES feature_type (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE solr_conf_index_attributes RENAME solr_configuration  TO solr_conf;
ALTER TABLE solr_conf_index_attributes DROP CONSTRAINT fk83a3760a893d7fec;
ALTER TABLE solr_conf_index_attributes DROP CONSTRAINT fk83a3760a91241d0d;
ALTER TABLE solr_conf_index_attributes ADD CONSTRAINT fk83a3760a893d7fec FOREIGN KEY (solr_conf)
      REFERENCES solr_conf (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE solr_conf_index_attributes ADD CONSTRAINT fk83a3760a91241d0d FOREIGN KEY (attribute_)
      REFERENCES attribute_descriptor (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION;


ALTER TABLE solr_conf_result_attributes RENAME solr_configuration  TO solr_conf;
ALTER TABLE solr_conf_result_attributes DROP CONSTRAINT fk194de053893d7fec;
ALTER TABLE solr_conf_result_attributes DROP CONSTRAINT fk194de05391241d0d;
ALTER TABLE solr_conf_result_attributes ADD CONSTRAINT fk194de053893d7fec FOREIGN KEY (solr_conf)
      REFERENCES solr_conf (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE solr_conf_result_attributes ADD CONSTRAINT fk194de05391241d0d FOREIGN KEY (attribute_)
      REFERENCES attribute_descriptor (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION;

