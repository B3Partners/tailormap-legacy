--
-- Update the name of wfs featuretype to follow the GT-WFS-NG scheme where
-- the colon is no longer a valid separator between namespace and typename.
-- See: https://github.com/flamingo-geocms/flamingo/issues/517
--
UPDATE feature_type ft
   SET type_name = replace(type_name,':','_')
  FROM feature_source fs
 WHERE ft.feature_source = fs.id
   AND fs.protocol = 'wfs';