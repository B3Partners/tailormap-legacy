
    create table solr_configuration (
        id  bigserial not null,
        name varchar(255),
        simple_feature_type int8,
        primary key (id)
    );

    create table solr_configuration_attributes (
        solr_configuration int8 not null,
        attribute_ int8 not null
    );


    alter table solr_configuration 
        add constraint FKB8F008594AC66EED 
        foreign key (simple_feature_type) 
        references feature_type;

    alter table solr_configuration_attributes 
        add constraint FKE40974FD893D7FEC 
        foreign key (solr_configuration) 
        references solr_configuration;

    alter table solr_configuration_attributes 
        add constraint FKE40974FD91241D0D 
        foreign key (attribute_) 
        references attribute_descriptor;

