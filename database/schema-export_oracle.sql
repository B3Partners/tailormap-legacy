
    create table application (
        id number(19,0) not null,
        authenticated_required number(1,0) not null,
        authorizations_modified timestamp not null,
        layout clob,
        max_crs varchar2(255 char),
        max_maxx double precision,
        max_maxy double precision,
        max_minx double precision,
        max_miny double precision,
        name varchar2(255 char) not null,
        start_crs varchar2(255 char),
        start_maxx double precision,
        start_maxy double precision,
        start_minx double precision,
        start_miny double precision,
        version varchar2(30 char),
        owner varchar2(255 char),
        root number(19,0),
        primary key (id),
        unique (name, version)
    );

    create table application_details (
        application number(19,0) not null,
        value clob,
        details_key varchar2(255 char),
        primary key (application, details_key)
    );

    create table application_layer (
        id number(19,0) not null,
        checked number(1,0) not null,
        layer_name varchar2(255 char) not null,
        selected_index number(10,0),
        service number(19,0),
        primary key (id)
    );

    create table application_layer_attributes (
        application_layer number(19,0) not null,
        attribute_ number(19,0) not null,
        list_index number(10,0) not null,
        primary key (application_layer, list_index)
    );

    create table application_layer_details (
        application_layer number(19,0) not null,
        details varchar2(255 char),
        details_key varchar2(255 char),
        primary key (application_layer, details_key)
    );

    create table application_layer_readers (
        application_layer number(19,0) not null,
        role_name varchar2(255 char)
    );

    create table application_layer_writers (
        application_layer number(19,0) not null,
        role_name varchar2(255 char)
    );

    create table attribute_descriptor (
        id number(19,0) not null,
        name_alias varchar2(255 char),
        name varchar2(255 char) not null,
        type varchar2(255 char),
        primary key (id)
    );

    create table bookmark (
        code varchar2(255 char) not null,
        created_at timestamp,
        created_by varchar2(255 char),
        params clob not null,
        primary key (code)
    );

    create table category (
        id number(19,0) not null,
        name varchar2(255 char) not null,
        parent number(19,0),
        primary key (id),
        unique (parent, name)
    );

    create table category_children (
        category number(19,0) not null,
        child number(19,0) not null,
        list_index number(10,0) not null,
        primary key (category, list_index)
    );

    create table category_readers (
        category number(19,0) not null,
        role_name varchar2(255 char)
    );

    create table category_services (
        category number(19,0) not null,
        service number(19,0) not null,
        list_index number(10,0) not null,
        primary key (category, list_index)
    );

    create table category_writers (
        category number(19,0) not null,
        role_name varchar2(255 char)
    );

    create table configured_attribute (
        id number(19,0) not null,
        attribute_name varchar2(255 char),
        default_value varchar2(255 char),
        edit_alias varchar2(255 char),
        edit_height varchar2(255 char),
        edit_values clob,
        editable number(1,0) not null,
        filterable number(1,0) not null,
        selectable number(1,0) not null,
        visible number(1,0) not null,
        primary key (id)
    );

    create table configured_component (
        id number(19,0) not null,
        class_name varchar2(255 char) not null,
        config clob,
        name varchar2(255 char) not null,
        application number(19,0) not null,
        primary key (id),
        unique (name, application)
    );

    create table configured_component_details (
        configured_component number(19,0) not null,
        details varchar2(255 char),
        details_key varchar2(255 char),
        primary key (configured_component, details_key)
    );

    create table configured_component_readers (
        configured_component number(19,0) not null,
        role_name varchar2(255 char)
    );

    create table document (
        id number(19,0) not null,
        category varchar2(255 char),
        name varchar2(255 char) not null,
        url varchar2(255 char) not null,
        primary key (id)
    );

    create table feature_source (
        protocol varchar2(31 char) not null,
        id number(19,0) not null,
        name varchar2(255 char) not null unique,
        password varchar2(255 char),
        url varchar2(255 char) not null,
        username varchar2(255 char),
        db_schema varchar2(255 char),
        service_name varchar2(255 char),
        linked_service number(19,0),
        primary key (id)
    );

    create table feature_source_feature_types (
        feature_source number(19,0) not null,
        feature_type number(19,0) not null,
        list_index number(10,0) not null,
        primary key (feature_source, list_index)
    );

    create table feature_type (
        id number(19,0) not null,
        description varchar2(255 char),
        geometry_attribute varchar2(255 char),
        type_name varchar2(255 char),
        writeable number(1,0) not null,
        feature_source number(19,0),
        primary key (id)
    );

    create table feature_type_attributes (
        feature_type number(19,0) not null,
        attribute_descriptor number(19,0) not null,
        list_index number(10,0) not null,
        primary key (feature_type, list_index)
    );

    create table geo_service (
        protocol varchar2(31 char) not null,
        id number(19,0) not null,
        authorizations_modified timestamp not null,
        monitoring_enabled number(1,0) not null,
        monitoring_statusok number(1,0) not null,
        name varchar2(255 char) not null,
        password varchar2(255 char),
        url varchar2(255 char) not null,
        username varchar2(255 char),
        tiling_protocol varchar2(255 char),
        override_url number(1,0),
        service_name varchar2(255 char),
        category number(19,0),
        top_layer number(19,0),
        primary key (id)
    );

    create table geo_service_keywords (
        geo_service number(19,0) not null,
        keyword varchar2(255 char)
    );

    create table group_ (
        name varchar2(255 char) not null,
        description clob,
        primary key (name)
    );

    create table layar_service (
        id number(19,0) not null,
        name varchar2(255 char) not null unique,
        primary key (id)
    );

    create table layer (
        id number(19,0) not null,
        filterable number(1,0) not null,
        legend_image_url varchar2(255 char),
        max_scale double precision,
        min_scale double precision,
        name varchar2(255 char),
        queryable number(1,0) not null,
        title varchar2(255 char),
        title_alias varchar2(255 char),
        virtual number(1,0) not null,
        feature_type number(19,0),
        parent number(19,0),
        service number(19,0),
        tileset varchar2(255 char),
        primary key (id)
    );

    create table layer_bounding_boxes (
        layer number(19,0) not null,
        name varchar2(255 char),
        maxx double precision,
        maxy double precision,
        minx double precision,
        miny double precision,
        crs varchar2(255 char),
        primary key (layer, crs)
    );

    create table layer_children (
        layer number(19,0) not null,
        child number(19,0) not null,
        list_index number(10,0) not null,
        primary key (layer, list_index)
    );

    create table layer_crs_list (
        layer number(19,0) not null,
        crs varchar2(255 char)
    );

    create table layer_details (
        layer number(19,0) not null,
        details varchar2(255 char),
        details_key varchar2(255 char),
        primary key (layer, details_key)
    );

    create table layer_keywords (
        layer number(19,0) not null,
        keyword varchar2(255 char)
    );

    create table layer_readers (
        layer number(19,0) not null,
        role_name varchar2(255 char)
    );

    create table layer_writers (
        layer number(19,0) not null,
        role_name varchar2(255 char)
    );

    create table level_ (
        id number(19,0) not null,
        background number(1,0) not null,
        info clob,
        name varchar2(255 char) not null,
        selected_index number(10,0),
        parent number(19,0),
        primary key (id)
    );

    create table level_children (
        level_ number(19,0) not null,
        child number(19,0) not null,
        list_index number(10,0) not null,
        primary key (level_, list_index)
    );

    create table level_documents (
        level_ number(19,0) not null,
        document number(19,0) not null,
        list_index number(10,0) not null,
        primary key (level_, list_index)
    );

    create table level_layers (
        level_ number(19,0) not null,
        layer number(19,0) not null,
        list_index number(10,0) not null,
        primary key (level_, list_index)
    );

    create table level_readers (
        level_ number(19,0) not null,
        role_name varchar2(255 char)
    );

    create table resource_ (
        name varchar2(255 char) not null,
        content_type varchar2(255 char),
        data_ blob not null,
        modified timestamp not null,
        size_ number(19,0) not null,
        primary key (name)
    );

    create table tile_set (
        name varchar2(255 char) not null,
        height number(10,0) not null,
        width number(10,0) not null,
        primary key (name)
    );

    create table tile_set_resolutions (
        tile_set varchar2(255 char) not null,
        resolution double precision,
        list_index number(10,0) not null,
        primary key (tile_set, list_index)
    );

    create table user_ (
        username varchar2(255 char) not null,
        password varchar2(255 char),
        primary key (username)
    );

    create table user_details (
        username varchar2(255 char) not null,
        details varchar2(255 char),
        details_key varchar2(255 char),
        primary key (username, details_key)
    );

    create table user_groups (
        username varchar2(255 char) not null,
        group_ varchar2(255 char) not null,
        primary key (username, group_)
    );

    alter table application 
        add constraint FK5CA40550EE90884A 
        foreign key (root) 
        references level_;

    alter table application 
        add constraint FK5CA40550AFA2FE1D 
        foreign key (owner) 
        references user_;

    alter table application_details 
        add constraint FKD9A4E532A91FB84 
        foreign key (application) 
        references application;

    alter table application_layer 
        add constraint FKFB01A255F7BD5A 
        foreign key (service) 
        references geo_service;

    alter table application_layer_attributes 
        add constraint FKD41041446FB11F 
        foreign key (application_layer) 
        references application_layer;

    alter table application_layer_attributes 
        add constraint FKD4104148017EC25 
        foreign key (attribute_) 
        references configured_attribute;

    alter table application_layer_details 
        add constraint FKD720D8A546FB11F 
        foreign key (application_layer) 
        references application_layer;

    alter table application_layer_readers 
        add constraint FKBAADA67346FB11F 
        foreign key (application_layer) 
        references application_layer;

    alter table application_layer_writers 
        add constraint FKD9D3D0C346FB11F 
        foreign key (application_layer) 
        references application_layer;

    alter table category 
        add constraint FK302BCFE433C669 
        foreign key (parent) 
        references category;

    alter table category_children 
        add constraint FKF77E9020452CB2DB 
        foreign key (child) 
        references category;

    alter table category_children 
        add constraint FKF77E9020428B7ABD 
        foreign key (category) 
        references category;

    alter table category_readers 
        add constraint FKB6245CF428B7ABD 
        foreign key (category) 
        references category;

    alter table category_services 
        add constraint FKE6C9427F55F7BD5A 
        foreign key (service) 
        references geo_service;

    alter table category_services 
        add constraint FKE6C9427F428B7ABD 
        foreign key (category) 
        references category;

    alter table category_writers 
        add constraint FK2A88701F428B7ABD 
        foreign key (category) 
        references category;

    alter table configured_component 
        add constraint FKFDE1DC3C2A91FB84 
        foreign key (application) 
        references application;

    alter table configured_component_details 
        add constraint FK5B8793F1193917F 
        foreign key (configured_component) 
        references configured_component;

    alter table configured_component_readers 
        add constraint FKE945470D1193917F 
        foreign key (configured_component) 
        references configured_component;

    alter table feature_source 
        add constraint FK8DE1C984D576E134 
        foreign key (linked_service) 
        references geo_service;

    alter table feature_source_feature_types 
        add constraint FK57524A7524045814 
        foreign key (feature_source) 
        references feature_source;

    alter table feature_source_feature_types 
        add constraint FK57524A75B7916580 
        foreign key (feature_type) 
        references feature_type;

    alter table feature_type 
        add constraint FK481336E324045814 
        foreign key (feature_source) 
        references feature_source;

    alter table feature_type_attributes 
        add constraint FKA280AC33C22478BC 
        foreign key (attribute_descriptor) 
        references attribute_descriptor;

    alter table feature_type_attributes 
        add constraint FKA280AC33B7916580 
        foreign key (feature_type) 
        references feature_type;

    alter table geo_service 
        add constraint FK957D1BC72B2D5A17 
        foreign key (top_layer) 
        references layer;

    alter table geo_service 
        add constraint FK957D1BC7428B7ABD 
        foreign key (category) 
        references category;

    alter table geo_service_keywords 
        add constraint FKFBC05227531126C 
        foreign key (geo_service) 
        references geo_service;

    alter table layer 
        add constraint FK61FD55155F7BD5A 
        foreign key (service) 
        references geo_service;

    alter table layer 
        add constraint FK61FD551AF8870E7 
        foreign key (tileset) 
        references tile_set;

    alter table layer 
        add constraint FK61FD551E93D7CDA 
        foreign key (parent) 
        references layer;

    alter table layer 
        add constraint FK61FD551B7916580 
        foreign key (feature_type) 
        references feature_type;

    alter table layer_bounding_boxes 
        add constraint FK5D360E0C2AB24981 
        foreign key (layer) 
        references layer;

    alter table layer_children 
        add constraint FK3B6C252D2A36694C 
        foreign key (child) 
        references layer;

    alter table layer_children 
        add constraint FK3B6C252D2AB24981 
        foreign key (layer) 
        references layer;

    alter table layer_crs_list 
        add constraint FK5CC73D472AB24981 
        foreign key (layer) 
        references layer;

    alter table layer_details 
        add constraint FK3A8A8D542AB24981 
        foreign key (layer) 
        references layer;

    alter table layer_keywords 
        add constraint FKF7B066D82AB24981 
        foreign key (layer) 
        references layer;

    alter table layer_readers 
        add constraint FK1E175B222AB24981 
        foreign key (layer) 
        references layer;

    alter table layer_writers 
        add constraint FK3D3D85722AB24981 
        foreign key (layer) 
        references layer;

    alter table level_ 
        add constraint FKBE11D55BB3061012 
        foreign key (parent) 
        references level_;

    alter table level_children 
        add constraint FK24AAA85AAC6CDCC3 
        foreign key (level_) 
        references level_;

    alter table level_children 
        add constraint FK24AAA85AF3FEFC84 
        foreign key (child) 
        references level_;

    alter table level_documents 
        add constraint FKAE8653BDAC6CDCC3 
        foreign key (level_) 
        references level_;

    alter table level_documents 
        add constraint FKAE8653BDA33FA2F7 
        foreign key (document) 
        references document;

    alter table level_layers 
        add constraint FK484FFA5DAC6CDCC3 
        foreign key (level_) 
        references level_;

    alter table level_layers 
        add constraint FK484FFA5D99484CE 
        foreign key (layer) 
        references application_layer;

    alter table level_readers 
        add constraint FK4953E55AC6CDCC3 
        foreign key (level_) 
        references level_;

    alter table tile_set_resolutions 
        add constraint FKA1D2C15980656544 
        foreign key (tile_set) 
        references tile_set;

    alter table user_details 
        add constraint FKB7C889CE99789440 
        foreign key (username) 
        references user_;

    alter table user_groups 
        add constraint FKE27720C899789440 
        foreign key (username) 
        references user_;

    alter table user_groups 
        add constraint FKE27720C8360AA480 
        foreign key (group_) 
        references group_;

    create sequence app_id_seq;

    create sequence app_layer_id_seq;

    create sequence attribute_desc_id_seq;

    create sequence category_id_seq;

    create sequence conf_attr_id_seq;

    create sequence conf_comp_id_seq;

    create sequence document_id_seq;

    create sequence feature_source_id_seq;

    create sequence feature_type_id_seq;

    create sequence geo_service_id_seq;

    create sequence layar_service_id_seq;

    create sequence layer_id_seq;

    create sequence level_id_seq;
