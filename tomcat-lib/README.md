# Tomcat libs

This provides a zipfile with jar files (in `/lib`) that should be placed in the `<tomcat>/lib` directory. 
It includes database drivers and a maildriver. Note that you should never have different 
versions of a database or mail driver in this directory, you will end up in "classloader hell".

When running on Java 11 additional libraries may be required, these are provided in the in `/java11-extra` 
directory and can be placed in the `<tomcat>/lib` directory as well. These are only required in specific 
cases and not the common deployment scenario.

**Note** since the Oracle JDBC driver cannot be distributed is is excluded from this package.
