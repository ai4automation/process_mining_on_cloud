#!/bin/sh

###
## ProM specific
###
PROGRAM=ProM
DIR=.
echo ${DIR}
CP=${DIR}/ProM68_dist/ProM-Framework-6.8.60.jar:${DIR}/ProM68_dist/ProM-Contexts-6.8.34.jar:${DIR}/ProM68_dist/ProM-Models-6.7.20.jar:${DIR}/ProM68_dist/ProM-Plugins-6.7.45.jar:${DIR}/.*
LIBDIR=${DIR}/ProM68_lib
MAIN=org.processmining.contexts.cli.CLI

####
## Environment options
###
JAVA=java

###
## Main program
###

add() {
	CP=${CP}:$1
}


for lib in $LIBDIR/*.jar
do
	add $lib
done

$JAVA -Djava.system.class.loader=org.processmining.framework.util.ProMClassLoader -classpath ${CP} -Djava.library.path=${LIBDIR} -Xmx8G ${MAIN} $*
