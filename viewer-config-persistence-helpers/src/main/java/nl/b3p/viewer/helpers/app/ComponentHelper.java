package nl.b3p.viewer.helpers.app;

import nl.b3p.viewer.components.ComponentRegistry;
import nl.b3p.viewer.components.ViewerComponent;

public class ComponentHelper {

    /**
     * Retrieve the metadata from the component registry for the class of this
     * component.
     *
     * @return the configured ViewerComponent for this component
     */
    public static ViewerComponent getViewerComponent(String className) {
        return ComponentRegistry.getInstance().getViewerComponent(className);
    }
}
