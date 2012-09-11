select constraint_name from user_constraints where
table_name = 'FEATURE_SOURCE' AND constraint_type='U';

-- Vul resultaat bovenstaande query hieronder in:
--alter table feature_source drop constraint <constraint_name>;

