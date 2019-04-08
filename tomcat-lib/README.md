# Tomcat libs

This provides a zipfile with jar files that should be placed in the `<tomcat>/lib` directory. 
It includes database drivers and a maildriver. Note that you should never have different 
versions of a database or mail driver in this directory, you will end up in "classloader hell".

**Note** since the Oracle JDBC driver cannot be distributed is is excluded from this package.
