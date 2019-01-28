-- idedentity kolommen zijn niet muteerbaar in mssql
set identity_insert category on;

insert into category (id,name) values(0,'Categoriën');

set identity_insert category off;
