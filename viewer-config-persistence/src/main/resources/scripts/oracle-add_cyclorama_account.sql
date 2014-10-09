
    create table cyclorama_account (
        id number(19,0) not null,
        password varchar2(255 char),
        private_base64key varchar2(255 char),
        username varchar2(255 char),
        primary key (id)
    );

