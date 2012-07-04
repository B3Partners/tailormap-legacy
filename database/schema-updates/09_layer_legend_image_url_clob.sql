alter table layer add temp varchar2;
update layer set temp = legend_image_url;
alter table layer drop column legend_image_url;
alter table layer add legend_image_url clob;
update layer set legend_image_url = temp;
alter table layer drop column temp;
