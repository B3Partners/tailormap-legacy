create table layer_prevent_geom_editors (
    layer int8 not null,
    role_name varchar(255)
);

alter table layer_prevent_geom_editors
    add constraint FKF2CC57D82AB24981
    foreign key (layer)
    references layer;
