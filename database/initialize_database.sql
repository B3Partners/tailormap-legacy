insert into application(id,name) values(1,'default');
SELECT app_id_seq.NEXTVAL FROM dual;

insert into category (id,name) values(0,'root');

-- Genereer een random wachtwoord een maak een SHA-1 digest met:
-- pwgen -1Bc 10 | tr -d '\n' | tee /tmp/pw | sha1sum; cat /tmp/pw; rm /tmp/pw; echo
-- Om een voorgedefinieerd wachtwoord te hashen:
-- echo -n mijn_wachtwoord | sha1sum
insert into user_(username, password) values ('admin', '<digest>');
insert into group_(name,description) values ('Admin','Groep met toegang tot beheerapplicatie viewer');
insert into group_(name,description) values ('RegistryAdmin','Beheer van het gegevensregister');
insert into group_(name,description) values ('UserAdmin','Beheer van gebruikers en groepen');
insert into group_(name,description) values ('ApplicationAdmin','Beheer van applicaties');
insert into group_(name,description) values ('ExtendedUser','Interne medewerkers (via LDAP geauthenticeerd)');

insert into user_groups(username,group_) values('admin','Admin');
insert into user_groups(username,group_) values('admin','RegistryAdmin');
insert into user_groups(username,group_) values('admin','UserAdmin');
insert into user_groups(username,group_) values('admin','ApplicationAdmin');
