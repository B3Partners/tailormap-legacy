
    create table user_ips (
        user_ varchar2(255 char) not null,
        ipaddress varchar2(45 char)
    );


    alter table user_ips 
        add constraint FKF022D5B8A985F735 
        foreign key (user_) 
        references user_;