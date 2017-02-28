/*
 * Copyright (C) 2011-2013 B3Partners B.V.
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
package nl.b3p.web;

import java.util.ArrayList;
import java.util.List;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.*;
import org.apache.commons.lang3.mutable.MutableInt;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


/**
 *
 * @author Matthijs Laan
 */
public class WaitPageStatus {
    private static final Log log = LogFactory.getLog(WaitPageStatus.class);
    
    private AtomicInteger progress = new AtomicInteger(0);
    protected AtomicReference<String> currentAction = new AtomicReference<String>("Loading...");

    protected Queue<String> logs = new ConcurrentLinkedQueue<String>();
    private int logDequeueCount = 0;

    private AtomicBoolean finished = new AtomicBoolean();

    public String getCurrentAction() {
        return currentAction.toString();
    }

    public void setCurrentAction(String currentAction) {
        if(log.isDebugEnabled()) {
            log.debug("action: " + currentAction);
        }
        this.currentAction.set(currentAction);
    }

    public boolean isFinished() {
        return finished.get();
    }

    public void setFinished(boolean finished) {
        this.finished.set(finished);
    }

    public int getLogDequeueCount() {
        return logDequeueCount;
    }

    public int getProgress() {
        return progress.get();
    }

    public void setProgress(int progress) {
        this.progress.set(progress);
    }

    public void addLog(String message) {
        if(log.isDebugEnabled()) {
            log.debug("log: " + message);
        }
        logs.add(message);
    }

    public void addLog(String messageFormat, Object... args) {
        // XXX locale
        addLog(String.format(messageFormat, args));
    }

    public List<String> dequeueLog() {
        List<String> currentLogs = new ArrayList<String>();
        String s;
        while((s = logs.poll()) != null) {
            currentLogs.add(s);
        }
        logDequeueCount += currentLogs.size();
        return currentLogs;
    }
    
    public WaitPageStatus subtask(final String subtaskPrefix, final float percent) {
        
        final MutableInt progressUntilSubtask = new MutableInt(getProgress());
        
        return new WaitPageStatus() {
            @Override
            public void setProgress(int progress) {
                super.setProgress(progressUntilSubtask.intValue() + (int)Math.round((progress / 100.0) * percent));
            }
            
            @Override
            public void addLog(String message) {
                super.addLog(subtaskPrefix + message);
            }
            
            @Override
            public void addLog(String messageFormat, Object... args) {
                super.addLog(subtaskPrefix + String.format(messageFormat, args));
            }
            
            @Override
            public void setCurrentAction(String currentAction) {
                super.setCurrentAction(subtaskPrefix + currentAction);
            }
        };
    }

    public String getJSON() throws JSONException {
        JSONObject j = new JSONObject();
        j.put("progress", getProgress());
        j.put("currentAction", getCurrentAction());
        j.put("finished", isFinished());

        List<String> currentLogs = dequeueLog();

        if(!currentLogs.isEmpty()) {
            JSONArray ja = new JSONArray(currentLogs);
            j.put("logs", ja);
            j.put("logStart", logDequeueCount);
        }
        return j.toString();
    }
}
