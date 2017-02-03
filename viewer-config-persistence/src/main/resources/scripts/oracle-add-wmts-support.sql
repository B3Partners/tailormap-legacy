create table layer_matrix_sets (
        layer number(19,0) not null,
        matrix_set number(19,0) not null,
        list_index number(10,0) not null,
        primary key (layer, list_index)
    );

    create table tile_matrix (
        id number(19,0) not null,
        description varchar2(255 char),
        identifier varchar2(255 char),
        matrix_height number(10,0) not null,
        matrix_width number(10,0) not null,
        scale_denominator varchar2(255 char),
        tile_height number(10,0) not null,
        tile_width number(10,0) not null,
        title varchar2(255 char),
        top_left_corner varchar2(255 char),
        matrix_set number(19,0),
        primary key (id)
    );


    create table tile_matrix_set (
        id number(19,0) not null,
        max_crs varchar2(255 char),
        max_maxx double precision,
        max_maxy double precision,
        max_minx double precision,
        max_miny double precision,
        crs varchar2(255 char),
        identifier varchar2(255 char),
        tile_service number(19,0),
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

        
    create sequence tile_matrix_id_seq;

    create sequence tile_matrix_set_id_seq;

