
    create table cyclorama_account (
        id number(19,0) not null,
        filename varchar2(255 char),
        password varchar2(255 char),
        private_base64key clob,
        username varchar2(255 char),
        primary key (id)
    );

    create sequence cycloramaaccount_id_seq;
