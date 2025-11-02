/*
 * This file is part of Cockpit.
 *
 * Copyright (C) 2017 Red Hat, Inc.
 *
 * Cockpit is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * Cockpit is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Cockpit; If not, see <http://www.gnu.org/licenses/>.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { Label } from '@patternfly/react-core';
import cockpit from 'cockpit';

function LogTable() {
    const [rows, setRows] = useState([]);
    const [error, setError] = useState(null);

    const fetchData = useCallback(() => {
        cockpit.spawn(['/usr/share/cockpit/scripts/getdata.sh'])
            .then((output) => {
                try {
                    const data = JSON.parse(output);
                    setRows(data);
                    setError(null);
                } catch (err) {
                    setError('Failed to parse JSON data');
                    console.error('Failed to parse JSON:', err);
                }
            })
            .catch((err) => {
                setError('Failed to run the script');
                console.error('Failed to run script:', err);
            });
    }, []);

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 5000);
        return () => clearInterval(intervalId);
    }, [fetchData]);

    // Helper: returns a color-coded label based on level
    const renderLevel = (level) => {
        const normalized = level?.toLowerCase() || '';
        let color = 'grey';
        let label = level;

        switch (normalized) {
            case 'error':
                color = 'red';
                break;
            case 'warning':
            case 'warn':
                color = 'orange';
                break;
            case 'info':
                color = 'blue';
                break;
            case 'debug':
                color = 'purple';
                break;
            default:
                color = 'grey';
        }

        return (
            <Label
                color={color}
                style={{
                    textTransform: 'capitalize',
                    fontWeight: 'bold',
                    minWidth: '70px',
                    textAlign: 'center',
                }}
            >
                {label}
            </Label>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '20px' }}>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            <div
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
            >
                <Table aria-label="Log Table" style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <Thead>
                        <Tr>
                            <Th
                                style={{
                                    position: 'sticky',
                                    top: 0,
                                    background: '#000',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    zIndex: 2,
                                }}
                            >
                                Level
                            </Th>
                            <Th
                                style={{
                                    position: 'sticky',
                                    top: 0,
                                    background: '#000',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    zIndex: 2,
                                }}
                            >
                                Time
                            </Th>
                            <Th
                                style={{
                                    position: 'sticky',
                                    top: 0,
                                    background: '#000',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    zIndex: 2,
                                }}
                            >
                                Message
                            </Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {rows.length === 0 ? (
                            <Tr>
                                <Td colSpan={3} textAlign="center">
                                    No logs available
                                </Td>
                            </Tr>
                        ) : (
                            rows.map((row, i) => (
                                <Tr key={i}>
                                    <Td dataLabel="Level">{renderLevel(row.Level)}</Td>
                                    <Td dataLabel="Time">{row.Time}</Td>
                                    <Td dataLabel="Message">{row.Message}</Td>
                                </Tr>
                            ))
                        )}
                    </Tbody>
                </Table>
            </div>
        </div>
    );
}

export const Application = () => {
    return <LogTable />;
};
