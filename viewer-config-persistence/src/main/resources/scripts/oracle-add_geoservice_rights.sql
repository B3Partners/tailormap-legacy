
    create table geo_service_readers (
        geo_service number(19,0) not null,
        role_name varchar2(255 char)
    );
    
    alter table geo_service_readers 
        add constraint FKE59CB987531126C 
        foreign key (geo_service) 
        references geo_service;
