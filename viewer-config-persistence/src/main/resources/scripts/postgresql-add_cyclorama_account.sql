
    create table cyclorama_account (
        id int8 not null,
        password varchar(255),
        private_base64key varchar(255),
        username varchar(255),
        primary key (id)
    );
