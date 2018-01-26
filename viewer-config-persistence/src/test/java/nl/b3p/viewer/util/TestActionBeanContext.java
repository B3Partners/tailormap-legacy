package nl.b3p.viewer.util;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


import java.util.HashSet;
import java.util.Set;
import javax.servlet.http.HttpServletRequest;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.mock.MockHttpServletRequest;
import net.sourceforge.stripes.mock.MockHttpSession;
import net.sourceforge.stripes.mock.MockServletContext;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.config.security.User;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class TestActionBeanContext extends ActionBeanContext{
    
    private User user = null;
    
    public TestActionBeanContext(){
        
    }

    public TestActionBeanContext(User user){
        this.user = user;
    }
      /**
     * Retrieves the HttpServletRequest object that is associated with the current request.
     * @return HttpServletRequest the current request
     */
    @Override
    public HttpServletRequest getRequest() {
        MockHttpSession session = new MockHttpSession(new MockServletContext("test"));
        MockHttpServletRequest request=  new MockHttpServletRequest("", "");
        request.setUserPrincipal(user);
        request.setSession(session);
        if (user != null) {
            Set<String> roles = new HashSet<>();
            for (Group group : user.getGroups()) {
                roles.add(group.getName());
            }
            request.setRoles(roles);
        }
        return request;
    }
    
}
