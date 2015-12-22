alter table configured_component add  (mother_component  number(19,0));


    alter table configured_component 
        add constraint FKFDE1DC3CFD682FC4 
        foreign key (mother_component) 
        references configured_component;