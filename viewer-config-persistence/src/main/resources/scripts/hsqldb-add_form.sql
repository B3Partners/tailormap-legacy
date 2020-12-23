

    create table form_readers (
        form bigint not null,
        role_name varchar(255)
    );
    alter table form_readers 
        add constraint FK56BE6F95223BF016 
        foreign key (form) 
        references form;