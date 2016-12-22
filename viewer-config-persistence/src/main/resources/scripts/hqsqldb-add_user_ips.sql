
    create table user_ips (
        user varchar(255) not null,
        ipaddress varchar(45)
    );

    alter table user_ips 
        add constraint FKF022D5B8A985F735 
        foreign key (user) 
        references user_;
