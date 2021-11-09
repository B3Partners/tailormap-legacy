#!/usr/bin/env bash
docker version

# Oracle XE 18.0.0.0
# this docker image has the following users/credentials (user/password = system/oracle)
#docker pull larmic/oracle-xe:18.4.0
# docker pull pvargacl/oracle-xe-18.4.0:latest
# docker pull imnotjames/oracle-xe:18c
docker pull gvenzl/oracle-xe:18-slim

# start the dockerized oracle-xe instance
# this container can be stopped using:
#
#    docker stop oracle-flamingo
#
# docker run --rm -p 15211:1521 --cpus=2 --name oracle-flamingo -h oracle-flamingo -d larmic/oracle-xe:18.4.0
#docker run --rm -p 15211:1521 --cpus=2 --name oracle-flamingo -h oracle-flamingo -d pvargacl/oracle-xe-18.4.0:latest
#docker run --rm -p 15211:1521 --cpus=2 --name oracle-flamingo -h oracle-flamingo -d imnotjames/oracle-xe:18c
docker run --rm -p 15211:1521 --cpus=2 --name oracle-flamingo -h oracle-flamingo -e ORACLE_PASSWORD=oracle -d gvenzl/oracle-xe:18-slim


printf "\n\nStarting Oracle XE container, this could take a few minutes..."
printf "\nWaiting for Oracle XE database to start up.... "
_WAIT=0;
while :
do
    printf " $_WAIT"
    if $(docker logs oracle-flamingo | grep -q 'DATABASE IS READY TO USE!'); then
    # if $(docker logs oracle-flamingo | grep -q 'status READY'); then
        printf "\nOracle XE Database started\n\n"
        break
    fi
    if ((_WAIT > 150)); then
      printf "\nWaited >150 seconds for Oracle XE Database to start\n\n"
      break
    fi
    sleep 10
    _WAIT=$((_WAIT+10))
done

# docker ps -a
# print logs
docker logs oracle-flamingo

printf "\nSetup Flamingo user\n"
sqlplus -l system/oracle@127.0.0.1:15211/xe < .jenkins/create_oracle_user.sql
