  create table solr_conf (
        id number(19,0) not null,
        last_updated timestamp,
        name varchar2(255 char),
        simple_feature_type number(19,0),
        primary key (id)
    );

    create table solr_conf_index_attributes (
        solr_conf number(19,0) not null,
        attribute_ number(19,0) not null
    );

    create table solr_conf_result_attributes (
        solr_conf number(19,0) not null,
        attribute_ number(19,0) not null
    );
 alter table solr_conf 
        add constraint FKBE7330614AC66EED 
        foreign key (simple_feature_type) 
        references feature_type;

    alter table solr_conf_index_attributes 
        add constraint FKC4645F0253A60848 
        foreign key (solr_conf) 
        references solr_conf;

    alter table solr_conf_index_attributes 
        add constraint FKC4645F0291241D0D 
        foreign key (attribute_) 
        references attribute_descriptor;

    alter table solr_conf_result_attributes 
        add constraint FKF0AA165B53A60848 
        foreign key (solr_conf) 
        references solr_conf;

    alter table solr_conf_result_attributes 
        add constraint FKF0AA165B91241D0D 
        foreign key (attribute_) 
        references attribute_descriptor;

    create sequence ft_solrconf_key_id_seq;
