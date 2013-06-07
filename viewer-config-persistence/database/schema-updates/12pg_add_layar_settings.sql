create table layar_source (
        id  bigserial not null,
        feature_type int8,
        layar_service int8,
        primary key (id)
);

create table layar_source_details (
    layar_source int8 not null,
    value text,
    details_key varchar(255),
    primary key (layar_source, details_key)
);

alter table layar_source 
    add constraint FKFC8466C580F5B5AC 
    foreign key (layar_service) 
    references layar_service;

alter table layar_source 
    add constraint FKFC8466C5B7916580 
    foreign key (feature_type) 
    references feature_type;

alter table layar_source_details 
    add constraint FK7ED06AC81E0B97B4 
    foreign key (layar_source) 
    references layar_source;