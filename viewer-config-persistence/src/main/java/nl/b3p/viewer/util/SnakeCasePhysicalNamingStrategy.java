package nl.b3p.viewer.util;

import org.hibernate.boot.model.naming.Identifier;
import org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl;
import org.hibernate.engine.jdbc.env.spi.JdbcEnvironment;

public class SnakeCasePhysicalNamingStrategy extends PhysicalNamingStrategyStandardImpl {

    @Override
    public Identifier toPhysicalCatalogName(Identifier name, JdbcEnvironment context) {
        return super.toPhysicalCatalogName(toSnakeCase(name), context);
    }

    @Override
    public Identifier toPhysicalColumnName(Identifier name, JdbcEnvironment context) {
        return super.toPhysicalColumnName(toSnakeCase(name), context);
    }

    @Override
    public Identifier toPhysicalSchemaName(Identifier name, JdbcEnvironment context) {
        return super.toPhysicalSchemaName(toSnakeCase(name), context);
    }

    @Override
    public Identifier toPhysicalSequenceName(Identifier name, JdbcEnvironment context) {
        return super.toPhysicalSequenceName(toSnakeCase(name), context);
    }

    @Override
    public Identifier toPhysicalTableName(Identifier name, JdbcEnvironment context) {
        return super.toPhysicalTableName(toSnakeCase(name), context);
    }

    private Identifier toSnakeCase(Identifier id) {
        if (id == null)
            return id;

        String name = id.getText();
        String snakeName = name.replaceAll("([a-z]+)([A-Z]+)", "$1\\_$2").toLowerCase();
        if (!snakeName.equals(name))
            return new Identifier(snakeName, id.isQuoted());
        else
            return id;
    }
}