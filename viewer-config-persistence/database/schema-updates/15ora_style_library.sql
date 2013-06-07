    create table geo_service_style_libraries (
        geo_service number(19,0) not null,
        style_library number(19,0) not null,
        list_index number(10,0) not null,
        primary key (geo_service, list_index),
        unique (style_library)
    );
    
    create table style_library (
        id number(19,0) not null,
        default_style number(1,0) not null,
        external_url varchar2(1000 char),
        sld_body clob,
        title varchar2(255 char) not null,
        primary key (id)
    );

    alter table geo_service_style_libraries 
        add constraint FK95F1251313076638 
        foreign key (style_library) 
        references style_library;

    alter table geo_service_style_libraries 
        add constraint FK95F125137531126C 
        foreign key (geo_service) 
        references geo_service;

    create sequence style_library_id_seq;

