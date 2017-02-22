/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.b3p.viewer.util;

import javax.servlet.http.HttpServletRequest;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.mock.MockHttpServletRequest;
import net.sourceforge.stripes.mock.MockHttpSession;
import net.sourceforge.stripes.mock.MockServletContext;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class TestActionBeanContext extends ActionBeanContext{
    
      /**
     * Retrieves the HttpServletRequest object that is associated with the current request.
     * @return HttpServletRequest the current request
     */
    @Override
    public HttpServletRequest getRequest() {
        MockHttpSession session = new MockHttpSession(new MockServletContext("test"));
        MockHttpServletRequest request=  new MockHttpServletRequest("", "");
        request.setSession(session);
        return request;
    }
    
}
