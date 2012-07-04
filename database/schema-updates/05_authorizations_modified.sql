alter table geo_service add
        authorizations_modified timestamp default current_timestamp not null;

alter table application add
        authorizations_modified timestamp default current_timestamp not null;

