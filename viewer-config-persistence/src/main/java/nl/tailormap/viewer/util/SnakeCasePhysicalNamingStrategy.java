/*
 * Copyright (C) 2021 B3Partners B.V.
 */
package nl.tailormap.viewer.util;

import org.hibernate.boot.model.naming.Identifier;
import org.hibernate.boot.model.naming.PhysicalNamingStrategy;
import org.hibernate.engine.jdbc.env.spi.JdbcEnvironment;

public class SnakeCasePhysicalNamingStrategy implements PhysicalNamingStrategy {


    @Override
    public Identifier toPhysicalCatalogName(final Identifier identifier, final JdbcEnvironment jdbcEnv) {
        return convertToSnakeCase(identifier);
    }

    @Override
    public Identifier toPhysicalColumnName(final Identifier identifier, final JdbcEnvironment jdbcEnv) {
        return convertToSnakeCase(identifier);
    }

    @Override
    public Identifier toPhysicalSchemaName(final Identifier identifier, final JdbcEnvironment jdbcEnv) {
        return convertToSnakeCase(identifier);
    }

    @Override
    public Identifier toPhysicalSequenceName(final Identifier identifier, final JdbcEnvironment jdbcEnv) {
        return convertToSnakeCase(identifier);
    }

    @Override
    public Identifier toPhysicalTableName(final Identifier identifier, final JdbcEnvironment jdbcEnv) {
        return convertToSnakeCase(identifier);
    }

    private Identifier convertToSnakeCase(Identifier id) {
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