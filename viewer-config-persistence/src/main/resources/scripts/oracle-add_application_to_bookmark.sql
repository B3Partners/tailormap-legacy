alter table bookmark add application number(19,0);
alter table bookmark add id number(19,0);

    alter table bookmark 
        add constraint FK7787A5362A91FB84 
        foreign key (application) 
        references application;

ALTER TABLE bookmark DROP primary key;

create sequence bookmark_id_seq;

update bookmark set id = bookmark_id_seq.nextval;

ALTER TABLE bookmark ADD CONSTRAINT bookmark_pkey PRIMARY KEY (id);

