
    create table cyclorama_account (
        id  bigserial not null,
        filename varchar(255),
        password varchar(255),
        private_base64key text,
        username varchar(255),
        primary key (id)
    );
