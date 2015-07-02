create table layer_prevent_geom_editors (
    layer number(19,0) not null,
    role_name varchar2(255 char)
);

alter table layer_prevent_geom_editors
    add constraint FKF2CC57D82AB24981
    foreign key (layer)
    references layer;