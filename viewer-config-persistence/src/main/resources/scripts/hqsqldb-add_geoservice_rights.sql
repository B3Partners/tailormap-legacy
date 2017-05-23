

    create table geo_service_readers (
        geo_service bigint not null,
        role_name varchar(255)
    );

    
    alter table geo_service_readers 
        add constraint FKE59CB987531126C 
        foreign key (geo_service) 
        references geo_service;