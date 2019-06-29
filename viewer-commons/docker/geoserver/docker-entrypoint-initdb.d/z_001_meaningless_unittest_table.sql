CREATE TABLE public.meaningless_unittest_table (
    id serial constraint meaningless_unittest_table_pk primary key,
    codeword character varying NOT NULL,
    amount integer DEFAULT 0 NOT NULL
);

SELECT AddGeometryColumn('public', 'meaningless_unittest_table', 'geom', 28992, 'POINT', 2);

ALTER TABLE public.meaningless_unittest_table OWNER TO flamingo;

INSERT INTO public.meaningless_unittest_table (id, codeword, amount, geom) VALUES (1, 'alpha', 1, st_pointfromtext('POINT(100 100)', 28992));
INSERT INTO public.meaningless_unittest_table (id, codeword, amount, geom) VALUES (2, 'bravo', 2, st_pointfromtext('POINT(200 200)', 28992));
INSERT INTO public.meaningless_unittest_table (id, codeword, amount, geom) VALUES (3, 'charlie', 3, st_pointfromtext('POINT(300 300)', 28992));
INSERT INTO public.meaningless_unittest_table (id, codeword, amount, geom) VALUES (4, 'delta', 4, st_pointfromtext('POINT(400 400)', 28992));
INSERT INTO public.meaningless_unittest_table (id, codeword, amount, geom) VALUES (5, 'echo', 5, st_pointfromtext('POINT(500 500)', 28992));
INSERT INTO public.meaningless_unittest_table (id, codeword, amount, geom) VALUES (6, 'foxtrot', 6, st_pointfromtext('POINT(600 600)', 28992));
INSERT INTO public.meaningless_unittest_table (id, codeword, amount, geom) VALUES (7, 'golf', 7, st_pointfromtext('POINT(700 700)', 28992));
INSERT INTO public.meaningless_unittest_table (id, codeword, amount, geom) VALUES (8, 'hotel', 8, st_pointfromtext('POINT(800 800)', 28992));
INSERT INTO public.meaningless_unittest_table (id, codeword, amount, geom) VALUES (9, 'india', 9, st_pointfromtext('POINT(900 900)', 28992));
INSERT INTO public.meaningless_unittest_table (id, codeword, amount, geom) VALUES (10, 'juliet', 10, st_pointfromtext('POINT(1000 1000)', 28992));
INSERT INTO public.meaningless_unittest_table (id, codeword, amount, geom) VALUES (11, 'kilo', 11, st_pointfromtext('POINT(1100 1100)', 28992));
INSERT INTO public.meaningless_unittest_table (id, codeword, amount, geom) VALUES (12, 'lima', 12, st_pointfromtext('POINT(1200 1200)', 28992));
INSERT INTO public.meaningless_unittest_table (id, codeword, amount, geom) VALUES (13, 'mike', 13, st_pointfromtext('POINT(1300 1300)', 28992));
INSERT INTO public.meaningless_unittest_table (id, codeword, amount, geom) VALUES (14, 'november', 14, st_pointfromtext('POINT(1400 1400)', 28992));
INSERT INTO public.meaningless_unittest_table (id, codeword, amount, geom) VALUES (15, 'oscar', 15, st_pointfromtext('POINT(1500 1500)', 28992));
INSERT INTO public.meaningless_unittest_table (id, codeword, amount, geom) VALUES (16, 'papa', 16, st_pointfromtext('POINT(1600 1600)', 28992));
INSERT INTO public.meaningless_unittest_table (id, codeword, amount, geom) VALUES (17, 'quebec', 17, st_pointfromtext('POINT(1700 1700)', 28992));
INSERT INTO public.meaningless_unittest_table (id, codeword, amount, geom) VALUES (18, 'romeo', 18, st_pointfromtext('POINT(1800 1800)', 28992));
INSERT INTO public.meaningless_unittest_table (id, codeword, amount, geom) VALUES (19, 'sierra', 19, st_pointfromtext('POINT(1900 1900)', 28992));
INSERT INTO public.meaningless_unittest_table (id, codeword, amount, geom) VALUES (20, 'tango', 20, st_pointfromtext('POINT(2000 2000)', 28992));
INSERT INTO public.meaningless_unittest_table (id, codeword, amount, geom) VALUES (21, 'uniform', 21, st_pointfromtext('POINT(2100 2100)', 28992));
INSERT INTO public.meaningless_unittest_table (id, codeword, amount, geom) VALUES (22, 'victor', 22, st_pointfromtext('POINT(2200 2200)', 28992));
INSERT INTO public.meaningless_unittest_table (id, codeword, amount, geom) VALUES (23, 'whiskey', 23, st_pointfromtext('POINT(2300 2300)', 28992));
INSERT INTO public.meaningless_unittest_table (id, codeword, amount, geom) VALUES (24, 'x-ray', 24, st_pointfromtext('POINT(2400 2400)', 28992));
INSERT INTO public.meaningless_unittest_table (id, codeword, amount, geom) VALUES (25, 'yankee', 25, st_pointfromtext('POINT(2500 2500)', 28992));
INSERT INTO public.meaningless_unittest_table (id, codeword, amount, geom) VALUES (26, 'zulu', 26, st_pointfromtext('POINT(2600 2600)', 28992));
