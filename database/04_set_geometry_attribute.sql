-- needed for jdbc feature types loaded before r2098

update /*+ bypass_ujvc */ 
(
select ft.geometry_attribute as geometry_attribute, ad.name as found_geometry_attribute
from feature_type ft
join feature_source fs on (fs.id = ft.feature_source)
join feature_type_attributes fta on (fta.feature_type = ft.id)
join attribute_descriptor ad on (ad.id = fta.attribute_descriptor)
where ft.geometry_attribute is null
and fs.protocol = 'jdbc'
and ad.type in ('geometry','point','multipoint','linestring','multilinestring','polygon','multipolygon')
)
set geometry_attribute = found_geometry_attribute
