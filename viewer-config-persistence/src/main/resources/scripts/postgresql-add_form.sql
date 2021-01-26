

    create table form (
        id  bigserial not null,
        feature_type_name varchar(255),
        json text,
        name varchar(255),
        sft int8,
        primary key (id)
    );

    alter table form 
        add constraint FK300CC46F7FEB1E 
        foreign key (sft) 
        references feature_type;
