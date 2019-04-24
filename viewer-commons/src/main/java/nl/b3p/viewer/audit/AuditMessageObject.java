/*
 * Copyright (C) 2019 B3Partners B.V.
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
package nl.b3p.viewer.audit;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * An object to hold audit information.
 *
 * @author Mark Prins
 */
public class AuditMessageObject {

    private String username;
    private String event;
    private final List<Object> messages = Stream.of(new Object[]{}).collect(Collectors.toList());

    public String getEvent() {
        return event;
    }

    /**
     * Set the event (class#method) for this AuditMessageObject.
     *
     * @param event describes event
     */
    public void setEvent(String event) {
        this.event = event;
    }

    /**
     * get the username for this audit trail.
     *
     * @return the username for this audit trail
     */
    public String getUsername() {
        return username;
    }

    /**
     * Set the username for this audit trail.
     *
     * @param username the username for this audit trail
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * add autdit information to this object
     *
     * @param message audit information
     */
    public void addMessage(Object message) {
        messages.add(message);
    }

    /**
     * This will provide any objects holding audit information, the list cannot
     * be modified.
     *
     * @return list of objects describing auditing information.
     */
    public List<Object> getMessages() {
        return Collections.unmodifiableList(messages);
    }

    /**
     * This will provide a string representation of the objects holding audit
     * information, the list cannot be modified.
     *
     * @return the messages describing auditing information separated with a
     * komma
     */
    public String getMessagesAsString() {
        return messages.stream().map(Object::toString).collect(Collectors.joining(", "));
    }

    @Override
    public String toString() {
        return "AuditMessageObject{ event=" + event + ", user=" + username + ", messages=" + this.getMessagesAsString() + '}';
    }
}
