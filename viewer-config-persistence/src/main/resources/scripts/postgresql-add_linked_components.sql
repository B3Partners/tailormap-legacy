alter table configured_component add column 
        mother_component int8;
    alter table configured_component 
        add constraint FKFDE1DC3CFD682FC4 
        foreign key (mother_component) 
        references configured_component;