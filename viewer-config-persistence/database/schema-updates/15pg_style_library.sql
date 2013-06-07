    create table geo_service_style_libraries (
        geo_service int8 not null,
        style_library int8 not null,
        list_index int4 not null,
        primary key (geo_service, list_index),
        unique (style_library)
    );

    create table style_library (
        id  bigserial not null,
        default_style bool not null,
        external_url varchar(1000),
        sld_body text,
        title varchar(255) not null,
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
        
        

