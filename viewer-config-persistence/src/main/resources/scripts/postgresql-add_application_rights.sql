create table application_readers (
    application int8 not null,
    role_name varchar(255)
);

alter table application_readers 
    add constraint FKF1271C212A91FB84 
    foreign key (application) 
    references application;