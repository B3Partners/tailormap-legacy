create table metadata (
    id number(19,0) not null,
    config_key varchar2(255 char),
    config_value varchar2(255 char),
    primary key (id)
);
create sequence metadata_id_seq;

insert into metadata(id,config_key,config_value)
values(metadata_id_seq.nextval,'database_version','0');
