--
-- Update the name of wfs featuretype to follow the GT-WFS-NG scheme where
-- the colon is no longer a valid separator between namespace and typename.
-- See: https://github.com/flamingo-geocms/flamingo/issues/517
--
UPDATE FEATURE_TYPE ft
SET ft.TYPE_NAME = REPLACE(ft.TYPE_NAME,':','_')
WHERE EXISTS
  (SELECT 1
  FROM FEATURE_SOURCE fs
  WHERE ft.FEATURE_SOURCE = fs.ID
  AND fs.PROTOCOL         = 'wfs'
  );