
    create table user_ips (
        user_ varchar(255) not null,
        ipaddress varchar(45)
    );

    alter table user_ips 
        add constraint FKF022D5B8A985F735 
        foreign key (user_) 
        references user_;
