# Flamingo docker image

## Image
Builds on `tomcat:9-jdk11` and contains database drivers and "viewer", "viewer-admin" and "solr" webapps.

### urls

- http://<docker-host-ip>:8080/viewer
- http://<docker-host-ip>:8080/viewer-admin
- http://<docker-host-ip>:8080/solr
- ajp://localhost:8009/

## build

After the artifacts and dependencies have been extracted in `docker/src/main/docker/bin_unzipped`
you can build and push the image using:
```
docker build --file ./docker/src/main/docker/Dockerfile ./docker/src/main/docker/ --tag b3partners/flamingo:latest
docker tag b3partners/flamingo:latest docker.b3p.nl/b3partners/flamingo:latest
docker push docker.b3p.nl/b3partners/flamingo:latest
```
(NB. for `push` authentication is required using `docker login`)

Or using Maven: 

```
mvn install -Dmaven.test.skip=true -B -V -e -fae -q
mvn clean deploy -pl :docker -P docker
```

## run

The follwoing environment variables vcan be used to customize the container:

- `FLA_VERSION` (5.7.3)               Flamingo release
- `PG_PORT` (5432)                    PostgreSQL TCP port
- `PG_HOST` (127.0.0.1)               PostgreSQL IP address
- `DB_NAME` (flamingo)                PostgreSQL database
- `DB_USER` (flamingo)                PostgreSQL database user
- `DB_PASS` (flamingo)                PostgreSQL database password
- `MAIL_FROM` (noreply@b3partners.nl) email sender
- `MAIL_HOST` (mail.b3partners.nl)    SMTP server
- `FLA_DATA_DIR` (/opt/flamingo_data) Data directory
- `AJP_ADDRESS` (::1)                 AJP connector bind IP address
- `AJP_SECRET` (noisyPurpl317)        AJP connector secret
   Check the Apache httpd docs, minimum required version of mod_proxy_ajp is 2.4.42 (https://httpd.apache.org/docs/2.4/mod/mod_proxy_ajp.html). 
- `CATALINA_OPTS` Will be filled using the above

The image makes some directories available as a volume:
- `$FLA_DATA_DIR` (/opt/flamingo_data/) with Flamingo data
- `/usr/local/tomcat/logs/` with tomcat logs


Start a container using the following command line:
`docker run -it --rm --name flamingo -h flamingo --net=host -v /tmp/flamingo_data:/opt/flamingo_data -v /tmp/logs:/usr/local/tomcat/logs b3partners/flamingo:latest`

