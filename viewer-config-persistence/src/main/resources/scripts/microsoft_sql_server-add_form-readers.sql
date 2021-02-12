create table form_readers (form numeric(19,0) not null, role_name varchar(255) null);
alter table form_readers add constraint FK56BE6F95223BF016 foreign key (form) references form;