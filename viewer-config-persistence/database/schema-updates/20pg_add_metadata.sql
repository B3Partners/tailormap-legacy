create table metadata (
    id  bigserial not null,
    config_key varchar(255),
    config_value varchar(255),
    primary key (id)
);
