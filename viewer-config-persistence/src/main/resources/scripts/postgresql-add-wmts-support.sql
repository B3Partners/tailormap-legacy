
    create table layer_matrix_sets (
        layer int8 not null,
        matrix_set int8 not null unique,
        list_index int4 not null,
        primary key (layer, list_index)
    );


    create table tile_matrix (
        id  bigserial not null,
        description varchar(255),
        identifier varchar(255),
        matrix_height int4 not null,
        matrix_width int4 not null,
        scale_denominator varchar(255),
        tile_height int4 not null,
        tile_witdh int4 not null,
        title varchar(255),
        top_left_point varchar(255),
        matrix_set int8,
        primary key (id)
    );

    create table tile_matrix_set (
        id  bigserial not null,
        crs varchar(255),
        identifier varchar(255),
        tile_service int8,
        primary key (id)
    );



    alter table layer_matrix_sets 
        add constraint FK118A64219EBB0496 
        foreign key (matrix_set) 
        references tile_matrix_set;

    alter table layer_matrix_sets 
        add constraint FK118A64212AB24981 
        foreign key (layer) 
        references layer;


    alter table tile_matrix 
        add constraint FK937382729EBB0496 
        foreign key (matrix_set) 
        references tile_matrix_set;

    alter table tile_matrix_set 
        add constraint FKD055E515591F39EA 
        foreign key (tile_service) 
        references geo_service;