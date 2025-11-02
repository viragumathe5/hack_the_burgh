#!/usr/bin/env bash

cat /var/log/sysmonitor.log | awk -F'|' '
BEGIN { print "["; first = 1 }
{
    time=$1; level=$2; message=$3
    gsub(/"/, "\\\"", message)
    if (!first) print ","
    first = 0
    printf "  {\"Level\": \"%s\", \"Time\": \"%s\", \"Message\": \"%s\"}", level, time, message
}
END { print "\n]" }'
