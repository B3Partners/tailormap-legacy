
    create table solr_configuration (
        id number(19,0) not null,
        name varchar2(255 char),
        simple_feature_type number(19,0),
        primary key (id)
    );

    create table solr_configuration_index_attributes (
        solr_configuration number(19,0) not null,
        attribute_ number(19,0) not null
    );

    create table solr_configuration_result_attributes (
        solr_configuration number(19,0) not null,
        attribute_ number(19,0) not null
    );


    alter table solr_configuration 
        add constraint FKB8F008594AC66EED 
        foreign key (simple_feature_type) 
        references feature_type;

    alter table solr_configuration_index_attributes 
        add constraint FK83A3760A893D7FEC 
        foreign key (solr_configuration) 
        references solr_configuration;

    alter table solr_configuration_index_attributes 
        add constraint FK83A3760A91241D0D 
        foreign key (attribute_) 
        references attribute_descriptor;

    alter table solr_configuration_result_attributes 
        add constraint FK194DE053893D7FEC 
        foreign key (solr_configuration) 
        references solr_configuration;

    alter table solr_configuration_result_attributes 
        add constraint FK194DE05391241D0D 
        foreign key (attribute_) 
        references attribute_descriptor;

    create sequence ft_solrconfiguration_key_id_seq;

