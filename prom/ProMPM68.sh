#!/bin/sh

###
## ProM specific
###
PROGRAM=ProM
CP=./ProM68_dist/ProM-Framework-6.8.60.jar:./ProM68_dist/ProM-Contexts-6.8.34.jar:./ProM68_dist/ProM-Models-6.7.20.jar:./ProM68_dist/ProM-Plugins-6.7.45.jar
LIBDIR=./ProM68_lib
MAIN=org.processmining.contexts.uitopia.packagemanager.PMFrame

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

$JAVA -classpath ${CP} -Djava.library.path=${LIBDIR} ${MAIN}
