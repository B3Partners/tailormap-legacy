DELETE FROM start_layer WHERE id IN 
(SELECT id              FROM 
(SELECT id,
                             ROW_NUMBER() OVER (partition BY application, application_layer ORDER BY id) AS rnum
                     FROM start_layer)  t
              WHERE t.rnum > 1);

DELETE FROM start_level WHERE id IN 
(SELECT id              FROM 
(SELECT id,
                             ROW_NUMBER() OVER (partition BY application, level_ ORDER BY id) AS rnum
                     FROM start_level)  t
              WHERE t.rnum > 1);