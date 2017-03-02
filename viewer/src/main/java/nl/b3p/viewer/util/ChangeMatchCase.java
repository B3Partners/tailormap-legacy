/*
 * Copyright (C) 2013 B3Partners B.V.
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
package nl.b3p.viewer.util;

import org.geotools.factory.CommonFactoryFinder;
import org.geotools.filter.visitor.DuplicatingFilterVisitor;
import org.opengis.filter.FilterFactory2;
import org.opengis.filter.PropertyIsEqualTo;
import org.opengis.filter.PropertyIsGreaterThan;
import org.opengis.filter.PropertyIsGreaterThanOrEqualTo;
import org.opengis.filter.PropertyIsLessThanOrEqualTo;
import org.opengis.filter.PropertyIsNotEqualTo;
/**
 *
 * @author Roy Braam
 */
public class ChangeMatchCase extends DuplicatingFilterVisitor{
    
    private FilterFactory2 factory;
    private boolean matchCase = true;
    
    public ChangeMatchCase(){
        super();
        this.factory = CommonFactoryFinder.getFilterFactory2();
    }
    
    public ChangeMatchCase(boolean newMatchCase){
        this();
        this.matchCase=newMatchCase;
        
    }
    
    @Override
    public Object visit (PropertyIsEqualTo filter ,Object data){
        return factory.equal(filter.getExpression1(), filter.getExpression2(), matchCase);
    }
    
    @Override
    public Object visit (PropertyIsGreaterThan filter ,Object data){
        return factory.greater(filter.getExpression1(),filter.getExpression2(), matchCase);
    }
    
    @Override
    public Object visit (PropertyIsGreaterThanOrEqualTo filter ,Object data){
        return factory.greaterOrEqual(filter.getExpression1(), filter.getExpression2(), matchCase);
    }
    
    @Override
    public Object visit (PropertyIsLessThanOrEqualTo filter ,Object data){
        return factory.lessOrEqual(filter.getExpression1(), filter.getExpression2(), matchCase);
    }
    @Override
    public Object visit (PropertyIsNotEqualTo filter ,Object data){
        return factory.notEqual(filter.getExpression1(), filter.getExpression2(), matchCase);
    }
}
