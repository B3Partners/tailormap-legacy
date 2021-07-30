package nl.tailormap.viewer_ng;

import nl.tailormap.viewer.config.app.Application;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(
        classes = {HSQLDBTestProfileJPAConfiguration.class, Application.class}
)
class ViewerNgApplicationTests {

    @Test
    void contextLoads() {
    }

}
