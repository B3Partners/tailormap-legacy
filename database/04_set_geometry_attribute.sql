-- needed for jdbc and wfs feature types loaded before r2256

update feature_type ft 
set geometry_attribute =
	(select ad.name from attribute_descriptor ad 
	join feature_type_attributes fta on (fta.attribute_descriptor = ad.id)
        where fta.feature_type = ft.id
        and ad.type in ('geometry','point','multipoint','linestring','multilinestring','polygon','multipolygon')
        and rownum <=1
	) 
where ft.geometry_attribute is null

