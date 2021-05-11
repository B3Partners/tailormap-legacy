package nl.viewer.helpers.app;

import nl.viewer.components.ComponentRegistry;
import nl.viewer.components.ViewerComponent;

public class ComponentHelper {

    /**
     * Retrieve the metadata from the component registry for the class of this
     * component.
     * @param className String the classname to retrieve the viewercomponent for
     * @return the configured ViewerComponent for this component
     */
    public static ViewerComponent getViewerComponent(String className) {
        return ComponentRegistry.getInstance().getViewerComponent(className);
    }
}
