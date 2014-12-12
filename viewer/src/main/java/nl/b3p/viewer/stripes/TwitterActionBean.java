/*
 * Copyright (C) 2012-2013 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package nl.b3p.viewer.stripes;

import java.io.StringReader;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.validation.Validate;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import twitter4j.Query;
import twitter4j.QueryResult;
import twitter4j.Status;
import twitter4j.Twitter;
import twitter4j.TwitterFactory;

/**
 *
 * @author Meine Toonen meinetoonen@b3partners.nl
 */
public class TwitterActionBean implements ActionBean {
    private static final Log log = LogFactory.getLog(SldActionBean.class);

    private ActionBeanContext context;

    @Validate
    private String term;

    @Validate
    private String rpp;

    @Validate
    private String latestId;

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    public ActionBeanContext getContext() {
        return context;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public String getRpp() {
        return rpp;
    }

    public void setRpp(String rpp) {
        this.rpp = rpp;
    }

    public String getTerm() {
        return term;
    }

    public void setTerm(String term) {
        this.term = term;
    }

    public String getLatestId() {
        return latestId;
    }

    public void setLatestId(String latestId) {
        this.latestId = latestId;
    }

    //</editor-fold>

    public Resolution create() throws JSONException {
        JSONObject json = new JSONObject();

        json.put("success", Boolean.FALSE);
        String error = null;

        try {
           // The factory instance is re-useable and thread safe.
            Twitter twitter = new TwitterFactory().getInstance();
            Query query = new Query(term);
            if(latestId != null){
                Long longVal = Long.valueOf(latestId);
                query.setSinceId(longVal);
            }

            QueryResult result = twitter.search(query);
            JSONArray tweets = new JSONArray();
            for (Status tweet : result.getTweets()) {

                //System.out.println(tweet.getFromUser() + ":" + tweet.getText());
                JSONObject t = new JSONObject();
                t.put("id_str",String.valueOf( tweet.getId()));
                t.put("text",tweet.getText());
                t.put("user_from",tweet.getUser().getScreenName());
                t.put("img_url",tweet.getUser().getProfileImageURL());

                JSONObject geo = new JSONObject();
                if(tweet.getGeoLocation() != null){
                    geo.put("lat",tweet.getGeoLocation().getLatitude());
                    geo.put("lon",tweet.getGeoLocation().getLongitude());
                }
                t.put("geo",geo);
                tweets.put(t);
            }
            json.put("tweets",tweets);
            if(tweets.length() > 0){
                json.put("maxId",String.valueOf(result.getMaxId()));
            }else{
                json.put("maxId",String.valueOf(latestId));
            }
            json.put("success", Boolean.TRUE);
        } catch(Exception e) {

            error = e.toString();
            if(e.getCause() != null) {
                error += "; cause: " + e.getCause().toString();
            }
        }

        if(error != null) {
            json.put("error", error);
        }

        return new StreamingResolution("application/json", new StringReader(json.toString()));
    }

}
