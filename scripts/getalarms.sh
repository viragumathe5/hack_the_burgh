#!/usr/bin/env bash

LOGFILE="/var/log/sysmonitor.log"

LAST_ENTRY_ZOMBIE=$(grep "zombie process count" "$LOGFILE" | tail -n 1)
ZOMBIE_ALARM=0

if [[ -z "$LAST_ENTRY_ZOMBIE" ]]; then
        ZOMBIE_ALARM=0
fi


if echo "$LAST_ENTRY_ZOMBIE" | grep -q "count alarm:"; then
        ZOMBIE_ALARM=1
else
        ZOMBIE_ALARM=0
fi



LAST_ENTRY_MEMORY=$(grep "memory usage" "$LOGFILE" | tail -n 1)
MEMORY_ALARM=0

if [[ -z "$LAST_ENTRY_MEMORY" ]]; then
        MEMORY_ALARM=0
fi


if echo "$LAST_ENTRY_MEMORY" | grep -q "memory usage alarm:"; then
        MEMORY_ALARM=1
else
        MEMORY_ALARM=0
fi

echo "{\"zombie\": $ZOMBIE_ALARM, \"memory\": $MEMORY_ALARM}"
