
    create table form (
        id number(19,0) not null,
        feature_type_name varchar2(255 char),
        json clob,
        name varchar2(255 char),
        sft number(19,0),
        primary key (id)
    );

    alter table form 
        add constraint FK300CC46F7FEB1E 
        foreign key (sft) 
        references feature_type;
        
    create sequence form_id_seq;
