update configured_component set class_name = 'viewer.mapcomponents.' || class_name
where class_name in ('FlamingoMap','OpenLayersMap');
