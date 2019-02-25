-- Genereer een random wachtwoord een maak een SHA-1 digest met:
-- pwgen -1Bc 10 | tr -d '\n' | tee /tmp/pw | sha1sum; cat /tmp/pw; rm /tmp/pw; echo
-- Om een voorgedefinieerd wachtwoord te hashen:
-- echo -n mijn_wachtwoord | sha1sum
insert into user_(username, password) values ('admin', '14c06474bec5e7def0304925d09f2b977af3146a');
insert into group_(name,description) values ('Admin','Groep met toegang tot beheerapplicatie viewer');
insert into group_(name,description) values ('RegistryAdmin','Beheer van het gegevensregister');
insert into group_(name,description) values ('UserAdmin','Beheer van gebruikers en groepen');
insert into group_(name,description) values ('ApplicationAdmin','Beheer van applicaties');
insert into group_(name,description) values ('ServiceAdmin','Beheerders van services: e-mail notificatie bij monitoring');
insert into group_(name,description) values ('ExtendedUser','Interne medewerkers (via LDAP geauthenticeerd)');

insert into user_groups(username,group_) values('admin','Admin');
