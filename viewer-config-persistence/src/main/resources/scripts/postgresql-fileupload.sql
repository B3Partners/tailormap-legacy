

    create table file_upload (
        id  bigserial not null,
        created_at timestamp,
        created_by varchar(255),
        fid varchar(255),
        file varchar(255),
        sft int8,
        primary key (id)
    );


    alter table file_upload 
        add constraint FK7D6832246F7FEB1E 
        foreign key (sft) 
        references feature_type;
