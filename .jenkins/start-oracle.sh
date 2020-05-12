#!/usr/bin/env bash
docker version

# Oracle XE 18.0.0.0
# this docker image has the following users/credentials (user/password = system/oracle)
docker pull larmic/oracle-xe:18.4.0

# start the dockerized oracle-xe instance
# this container can be stopped using:
#
#    docker stop oracle-flamingo
#
docker run --rm -p 15211:1521 --cpus=2 --name oracle-flamingo -h oracle-flamingo -d larmic/oracle-xe:18.4.0
# print logs
# docker logs oracle-flamingo


printf "\n\nStarting Oracle XE container, this could take a few minutes..."
printf "\nWaiting for Oracle XE database to start up.... "
_WAIT=0;
while :
do
    printf " $_WAIT"
    #if $(docker logs oracle-flamingo | grep -q 'DATABASE IS READY TO USE!'); then
    if $(docker logs oracle-flamingo | grep -q 'status READY'); then
        printf "\nOracle XE Database started\n\n"
        break
    fi
    sleep 10
    _WAIT=$(($_WAIT+10))
done

# docker ps -a
# print logs
docker logs oracle-flamingo

printf "\nSetup Flamingo user\n"
sqlplus -l system/oracle@//192.168.1.26:15211/XE < .jenkins/create_oracle_user.sql