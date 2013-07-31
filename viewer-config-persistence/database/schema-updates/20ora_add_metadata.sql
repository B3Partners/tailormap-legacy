create table metadata (
    id number(19,0) not null,
    config_key varchar2(255 char),
    config_value varchar2(255 char),
    primary key (id)
);

insert into metadata(config_key,config_value)
values('database_version','0');
