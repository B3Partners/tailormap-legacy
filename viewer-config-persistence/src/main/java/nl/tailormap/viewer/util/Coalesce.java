/*
 * Copyright (C) 2012-2021 B3Partners B.V.
 */
package nl.tailormap.viewer.util;

/**
 *
 * @author Matthijs Laan
 */
public final class Coalesce {

    public static <T> T coalesce(T ...values) {
        for(T i: values) {
            if(i != null) {
                return i;
            }
        }
        return null;
    }
    
    public static <T> T coalesce(T a, T b) {
        return a == null ? b : a;
    }
    
    public static <T> T coalesce(T a, T b, T c) {
        return a != null ? a : (b != null ? b : c);
    }    
}
