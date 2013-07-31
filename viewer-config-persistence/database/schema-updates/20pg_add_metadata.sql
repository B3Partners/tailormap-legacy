create table metadata (
    id  bigserial not null,
    config_key varchar(255),
    config_value varchar(255),
    primary key (id)
);

insert into metadata(config_key,config_value)
values('database_version','0');
