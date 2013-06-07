    create table geo_service_details (
        geoservice number(19,0) not null,
        value clob,
        details_key varchar2(255 char),
        primary key (geoservice, details_key)
    );

    alter table geo_service_details 
        add constraint FK2ACCFDCA292680E9 
        foreign key (geoservice) 
        references geo_service;

