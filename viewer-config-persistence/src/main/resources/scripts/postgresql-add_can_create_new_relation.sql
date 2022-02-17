ALTER TABLE feature_type_relation
    ADD COLUMN can_create_new_relation BOOLEAN NOT NULL DEFAULT FALSE;