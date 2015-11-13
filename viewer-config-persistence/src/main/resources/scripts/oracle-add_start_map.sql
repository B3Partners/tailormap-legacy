
    create table start_layer (
        id number(19,0) not null,
        checked number(1,0) not null,
        selected_index number(10,0),
        application number(19,0),
        application_layer number(19,0),
        primary key (id)
    );

    create table start_level (
        id number(19,0) not null,
        selected_index number(10,0),
        application number(19,0),
        level_ number(19,0),
        primary key (id)
    );


    alter table start_layer 
        add constraint FKA4C6AB342A91FB84 
        foreign key (application) 
        references application;

    alter table start_layer 
        add constraint FKA4C6AB3446FB11F 
        foreign key (application_layer) 
        references application_layer;

    alter table start_level 
        add constraint FKA4C871672A91FB84 
        foreign key (application) 
        references application;

    alter table start_level 
        add constraint FKA4C87167AC6CDCC3 
        foreign key (level_) 
        references level_;

    create sequence startlayer_id_seq;
    create sequence startlevel_id_seq;

