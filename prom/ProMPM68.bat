@GOTO start

:add
 @set X=%X%;%1
 @GOTO :eof

:start
@set X=.\ProM68_dist\ProM-Framework-6.8.60.jar
@set X=%X%;.\ProM68_dist\ProM-Contexts-6.8.34.jar
@set X=%X%;.\ProM68_dist\ProM-Models-6.7.20.jar
@set X=%X%;.\ProM68_dist\ProM-Plugins-6.7.45.jar

@for /R .\ProM68_lib %%I IN ("*.jar") DO @call :add .\ProM68_lib\%%~nI.jar

@java -da -classpath "%X%" -Djava.library.path=.//ProM68_lib -Xmx1G org.processmining.contexts.uitopia.packagemanager.PMFrame

set X=
