package nl.b3p.viewer.stripes;

import net.sourceforge.stripes.action.*;

@UrlBinding("/action/digitree/")
@StrictBinding
public class DigitreeTreeActionBean implements ActionBean {

    private ActionBeanContext context;

    @Override
    public void setContext(ActionBeanContext context) {
        this.context = context;

    }

    @Override
    public ActionBeanContext getContext() {
        return this.context;
    }

    @DefaultHandler
    public Resolution view() {
        String session  = context.getRequest().getSession().getId();;

        return new StreamingResolution("");
    }
}
