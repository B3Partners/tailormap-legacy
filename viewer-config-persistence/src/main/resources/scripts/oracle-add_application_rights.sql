create table application_readers (
    application number(19,0) not null,
    role_name varchar2(255 char)
);


alter table application_readers 
    add constraint FKF1271C212A91FB84 
    foreign key (application) 
    references application;