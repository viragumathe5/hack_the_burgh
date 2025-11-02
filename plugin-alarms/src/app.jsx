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
import { Label, Spinner, Alert, Bullseye, Title } from '@patternfly/react-core';
import cockpit from 'cockpit';

function AlarmBoard() {
  const [alarms, setAlarms] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = useCallback(() => {
    cockpit
      .spawn(['/usr/local/share/cockpit/scripts/getalarms.sh'])
      .then((output) => {
        try {
          const data = JSON.parse(output);
          setAlarms(data);
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
    const intervalId = setInterval(fetchData, 2000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const AlarmPanel = ({ alarms }) => {
    const alarmEntries = Object.entries(alarms);

    if (alarmEntries.length === 0) {
      return (
        <Bullseye>
          <div style={{ fontSize: '1.25rem' }}>No alarms available.</div>
        </Bullseye>
      );
    }

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          padding: '1rem',
        }}
      >
        {alarmEntries.map(([name, value]) => (
          <div
            key={name}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100px',
            }}
          >
            <Label
              color={value === 1 ? 'red' : 'green'}
              variant='filled'
              style={{
                fontSize: '1.5rem',
                padding: '1rem 2rem',
                width: '100%',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              {name}
            </Label>
          </div>
        ))}
      </div>
    );
  };

  if (error) {
    return (
      <Bullseye>
        <Alert variant="danger" title={error} />
      </Bullseye>
    );
  }

  if (!alarms) {
    return (
      <Bullseye>
        <Spinner size="xl" />
      </Bullseye>
    );
  }

  return <AlarmPanel alarms={alarms} />;
}

export const Application = () => {
  return (
    <div style={{ padding: '1rem', height: '100vh', boxSizing: 'border-box' }}>
      <Title headingLevel="h1" size="3xl" style={{ textAlign: 'center', marginBottom: '1rem' }}>
        Alarm Board
      </Title>
      <AlarmBoard />
    </div>
  );
};
