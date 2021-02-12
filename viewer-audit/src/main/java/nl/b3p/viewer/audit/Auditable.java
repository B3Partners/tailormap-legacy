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

/**
 * Provides a machanism to obtain audit information from implementing classes.
 *
 * @author Mark Prins
 */
public interface Auditable {

    /**
     * Accessor to get the auditing information that has been provided by the
     * implementeing class.
     *
     * @return the audit information
     * @see AuditMessageObject
     */
    AuditMessageObject getAuditMessageObject();
}
