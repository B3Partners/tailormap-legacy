-- Rename wrongly named username column to application

drop table application_details;

    create table application_details (
        application number(19,0) not null,
        details varchar2(255 char),
        details_key varchar2(255 char),
        primary key (application, details_key)
    );

    alter table application_details 
        add constraint FKD9A4E532A91FB84 
        foreign key (application) 
        references application;
