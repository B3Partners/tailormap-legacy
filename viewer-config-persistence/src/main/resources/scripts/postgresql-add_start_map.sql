
    create table start_layer (
        id  bigserial not null,
        checked bool not null,
        selected_index int4,
        application int8,
        application_layer int8,
        primary key (id)
    );

    create table start_level (
        id  bigserial not null,
        selected_index int4,
        application int8,
        level_ int8,
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
        add constraint FKA4C87167F47CA2EC 
        foreign key (level_) 
        references level_;