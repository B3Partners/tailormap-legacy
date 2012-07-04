    create table bookmark (
        code varchar2(255 char) not null,
        created_at timestamp,
        created_by varchar2(255 char),
        params clob not null,
        primary key (code)
    );
