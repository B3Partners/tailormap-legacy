package nl.tailormap.viewer_ng;

import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.persistence.EntityManagerFactory;
import javax.sql.DataSource;
import java.util.Properties;

@Configuration
@EnableJpaRepositories(basePackages = {"nl.tailormap.viewer_ng.repository"})
@EnableTransactionManagement
@Profile("test")
public class HSQLDBTestProfileJPAConfiguration {
    private static final Log LOG = LogFactory.getLog(HSQLDBTestProfileJPAConfiguration.class);

    @Autowired
    private Environment env;

    @Bean
    @Profile("test")
    public LocalContainerEntityManagerFactoryBean entityManagerFactory() {
        final LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setPackagesToScan("nl.tailormap.viewer.config");
        em.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        em.setJpaProperties(additionalProperties());
        em.setPersistenceUnitName("viewer-config-hsqldb");
        em.setDataSource(dataSource());

        return em;
    }

    @Bean
    @Profile("test")
    public DataSource dataSource() {
        final DriverManagerDataSource dataSource = new DriverManagerDataSource();

        String dbUrl = "jdbc:hsqldb:file:./target/unittest-hsqldb-TESTNAMETOKEN/db;shutdown=true";
        if (null != env.getProperty("spring.datasource.url")) {
            dbUrl = env.getProperty("spring.datasource.url");
        }
        dbUrl = dbUrl.replace("TESTNAMETOKEN", RandomStringUtils.randomAlphabetic(8));
        dataSource.setUrl(dbUrl);
        LOG.debug("Using test datasource url: " + dataSource.getUrl());
        dataSource.setDriverClassName("org.hsqldb.jdbcDriver");
        dataSource.setUsername("sa");
        dataSource.setPassword("");

        return dataSource;
    }

    @Bean
    @Profile("test")
    JpaTransactionManager transactionManager(final EntityManagerFactory entityManagerFactory) {
        final JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(entityManagerFactory);
        return transactionManager;
    }


    final Properties additionalProperties() {
        final Properties hibernateProperties = new Properties();

        hibernateProperties.setProperty("hibernate.hbm2ddl.auto", env.getProperty("hibernate.hbm2ddl.auto"));
        hibernateProperties.setProperty("hibernate.show_sql", env.getProperty("hibernate.show_sql"));

        return hibernateProperties;
    }
}
