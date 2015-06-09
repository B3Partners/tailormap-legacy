alter table bookmark add column application int8;


    alter table bookmark 
        add constraint FK7787A5362A91FB84 
        foreign key (application) 
        references application;