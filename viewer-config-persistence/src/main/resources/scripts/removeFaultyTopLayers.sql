delete from LAYER_BOUNDING_BOXES 		where layer in (select id from layer where parent in (select id from layer where parent in (select id from layer where parent is null and  id not in (select top_layer from geo_service))));
delete from LAYER_CHILDREN 				where layer in (select id from layer where parent in (select id from layer where parent in (select id from layer where parent is null and  id not in (select top_layer from geo_service))));
delete from LAYER_CHILDREN 				where child in (select id from layer where parent in (select id from layer where parent in (select id from layer where parent is null and  id not in (select top_layer from geo_service))));
delete from LAYER_CRS_LIST 				where layer in (select id from layer where parent in (select id from layer where parent in (select id from layer where parent is null and  id not in (select top_layer from geo_service))));
delete from LAYER_DETAILS				where layer in (select id from layer where parent in (select id from layer where parent in (select id from layer where parent is null and  id not in (select top_layer from geo_service))));
delete from LAYER_KEYWORDS 				where layer in (select id from layer where parent in (select id from layer where parent in (select id from layer where parent is null and  id not in (select top_layer from geo_service))));
delete from LAYER_PREVENT_GEOM_EDITORS  where layer in (select id from layer where parent in (select id from layer where parent in (select id from layer where parent is null and  id not in (select top_layer from geo_service))));
delete from LAYER_READERS				where layer in (select id from layer where parent in (select id from layer where parent in (select id from layer where parent is null and  id not in (select top_layer from geo_service))));
delete from LAYER_WRITERS 				where layer in (select id from layer where parent in (select id from layer where parent in (select id from layer where parent is null and  id not in (select top_layer from geo_service))));
delete from layer 						where id in    (select id from layer where parent in (select id from layer where parent in (select id from layer where parent is null and  id not in (select top_layer from geo_service))));





delete from LAYER_BOUNDING_BOXES 		where layer in (select id from layer where parent in (select id from layer where parent is null and  id not in (select top_layer from geo_service)));
delete from LAYER_CHILDREN 				where layer in (select id from layer where parent in (select id from layer where parent is null and  id not in (select top_layer from geo_service)));
delete from LAYER_CHILDREN 				where child in (select id from layer where parent in (select id from layer where parent is null and  id not in (select top_layer from geo_service)));
delete from LAYER_CRS_LIST 				where layer in (select id from layer where parent in (select id from layer where parent is null and  id not in (select top_layer from geo_service)));
delete from LAYER_DETAILS				where layer in (select id from layer where parent in (select id from layer where parent is null and  id not in (select top_layer from geo_service)));
delete from LAYER_KEYWORDS 				where layer in (select id from layer where parent in (select id from layer where parent is null and  id not in (select top_layer from geo_service)));
delete from LAYER_PREVENT_GEOM_EDITORS  where layer in (select id from layer where parent in (select id from layer where parent is null and  id not in (select top_layer from geo_service)));
delete from LAYER_READERS				where layer in (select id from layer where parent in (select id from layer where parent is null and  id not in (select top_layer from geo_service)));
delete from LAYER_WRITERS 				where layer in (select id from layer where parent in (select id from layer where parent is null and  id not in (select top_layer from geo_service)));
delete from layer 						where id in    (select id from layer where parent in (select id from layer where parent is null and  id not in (select top_layer from geo_service)));




delete from LAYER_BOUNDING_BOXES 		where layer in (select id from layer where parent is null and  id not in (select top_layer from geo_service));
delete from LAYER_CHILDREN 				where layer in (select id from layer where parent is null and  id not in (select top_layer from geo_service));
delete from LAYER_CHILDREN 				where child in (select id from layer where parent is null and  id not in (select top_layer from geo_service));
delete from LAYER_CRS_LIST 				where layer in (select id from layer where parent is null and  id not in (select top_layer from geo_service));
delete from LAYER_DETAILS				where layer in (select id from layer where parent is null and  id not in (select top_layer from geo_service));
delete from LAYER_KEYWORDS 				where layer in (select id from layer where parent is null and  id not in (select top_layer from geo_service));
delete from LAYER_PREVENT_GEOM_EDITORS  where layer in (select id from layer where parent is null and  id not in (select top_layer from geo_service));
delete from LAYER_READERS				where layer in (select id from layer where parent is null and  id not in (select top_layer from geo_service));
delete from LAYER_WRITERS 				where layer in (select id from layer where parent is null and  id not in (select top_layer from geo_service));
delete from layer 						where id in    (select id from layer where parent is null and  id not in (select top_layer from geo_service));
