alter table bookmark add column application int8;


    alter table bookmark 
        add constraint FK7787A5362A91FB84 
        foreign key (application) 
        references application;
        
alter table bookmark add column based_on_application int8;


    alter table bookmark 
        add constraint FK7787A536A06CEF30 
        foreign key (based_on_application) 
        references application;
ALTER TABLE bookmark
  DROP CONSTRAINT bookmark_pkey;
ALTER TABLE bookmark
  ADD CONSTRAINT bookmark_pkey PRIMARY KEY (code, application);
