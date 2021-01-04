
    create table form_readers (
        form number(19,0) not null,
        role_name varchar2(255 char)
    );

    
    alter table form_readers 
        add constraint FK56BE6F95223BF016 
        foreign key (form) 
        references form;
