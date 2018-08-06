    create table file_upload (
        id number(19,0) not null,
        created_at timestamp,
        created_by varchar2(255 char),
        fid varchar2(255 char),
        filename varchar2(255 char),
        location varchar2(255 char),
        mimetype varchar2(255 char),
        type_ varchar2(255 char),
        sft number(19,0),
        primary key (id)
    );


    alter table file_upload 
        add constraint FK7D6832246F7FEB1E 
        foreign key (sft) 
        references feature_type;


    create sequence file_upload_id_seq;
