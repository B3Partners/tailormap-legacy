/*
 * Copyright (C) 2012-2013 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package nl.b3p.taglibs.js;

import java.io.IOException;
import javax.servlet.jsp.JspException;
import javax.servlet.jsp.JspTagException;
import javax.servlet.jsp.tagext.BodyTagSupport;
import org.json.JSONObject;

/**
 * Tag that quotes the specified value for use in a JavaScript &lt;script&gt; 
 * block in a HTML page. Currenty only supports strings. Use the value attribute
 * or the body to specify the string to quote. Based on 
 * org.apache.taglibs.standard.tag.rt.core.OutTag.
 * 
 * @author Matthijs Laan
 */
public class QuoteTag extends BodyTagSupport {
    
    private String output;    
    private Object value;
    
    @Override
    public void release() {
        output = null;
        value = null;
        super.release();
    }
    
    public void setValue(Object value) {
        this.value = value;
    }
    
    @Override
    public int doStartTag() throws JspException {

        this.bodyContent = null;  // clean-up body (just in case container is pooling tag handlers)

        // output value if not null
        if (value != null) {
            output = value.toString();
            return SKIP_BODY;
        }

        // output body as default
        output = ""; // need to reset as doAfterBody will not be called with an empty tag

        return EVAL_BODY_BUFFERED;
    }
    
    @Override
    public int doAfterBody() throws JspException {
        output = bodyContent.getString();
        return SKIP_BODY;
    }    
    
    @Override
    public int doEndTag() throws JspException {
        try {
            if(output == null) {
                // JSONObject.quote(null) will return ""
                pageContext.getOut().print("null");
            } else {
                pageContext.getOut().print(JSONObject.quote(output));
            }
        } catch(IOException e) {
            throw new JspTagException(e);
        }
        return EVAL_PAGE;
    }    
}
