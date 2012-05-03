
    create table resource_ (
        name varchar2(255 char) not null,
        content_type varchar2(255 char),
        data_ blob not null,
        modified timestamp not null,
        size_ number(19,0) not null,
        primary key (name)
    );
