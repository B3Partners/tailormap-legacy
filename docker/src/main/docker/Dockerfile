FROM tomcat:9-jdk11

ARG FLA_VERSION=5.7.8
ENV PG_PORT=5432
ENV PG_HOST=127.0.0.1
ENV DB_NAME=flamingo
ENV DB_USER=flamingo
ENV DB_PASS=flamingo
ENV MAIL_FROM=noreply@b3partners.nl
ENV MAIL_HOST=mail.b3partners.nl
ENV FLA_DATA_DIR=/opt/flamingo_data
ENV AJP_ADDRESS=::1
ENV AJP_SECRET=noisyPurpl317
ENV CATALINA_OPTS="-DPG_PORT=$PG_PORT -DPG_HOST=$PG_HOST -DDB_NAME=$DB_NAME -DDB_USER=$DB_USER -DDB_PASS=$DB_PASS -DMAIL_FROM=$MAIL_FROM -DMAIL_HOST=$MAIL_HOST -DFLA_DATA_DIR=$FLA_DATA_DIR -DAJP_SECRET=$AJP_SECRET -DAJP_ADDRESS=$AJP_ADDRESS"
ARG TZ="Europe/Amsterdam"
ARG DEBIAN_FRONTEND="noninteractive"

# copy webapps + jdni libs to tomcat directories
COPY bin_unzipped/wars/*.war /usr/local/tomcat/webapps/
COPY bin_unzipped/solr/*.war $FLA_DATA_DIR/
COPY bin_unzipped/lib/*.jar /usr/local/tomcat/lib/
COPY bin_unzipped/java11-extra/*.jar /usr/local/tomcat/lib/

RUN mkdir -p $FLA_DATA_DIR/.solr \
    # solr config
    && TMPDIR=`mktemp -d` \
    && unzip -o /usr/local/tomcat/webapps/viewer-admin.war 'WEB-INF/classes/solr/*' -d $TMPDIR \
    && mv $TMPDIR/WEB-INF/classes/solr/* $FLA_DATA_DIR/.solr/ \
    && chmod -R 777 $FLA_DATA_DIR/ \
    # cleanup
    && rm /usr/local/tomcat/lib/tomcat-i18n-*.jar \
    && rm -rf /usr/local/tomcat/webapps.dist/ \
    && rm -rf $TMPDIR

RUN set -eux;ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY tomcat_conf/ /usr/local/tomcat/conf/

EXPOSE 8009

HEALTHCHECK CMD curl -f http://localhost:8080/viewer-admin/action/admin/upgradecheck/ping || exit 1

LABEL maintainer=B3Partners \
      nl.b3p.vendor=B3Partners \
      nl.b3p.image=Flamingo \
      nl.b3p.version=$FLA_VERSION

VOLUME ["$FLA_DATA_DIR", "/usr/local/tomcat/logs"]
