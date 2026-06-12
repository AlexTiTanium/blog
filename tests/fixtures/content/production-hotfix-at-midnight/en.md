---
title: "Production Hotfix at Midnight"
date: "2024-08-10"
description: "The anatomy of a midnight production incident: from the first alert to the postmortem nobody reads, and everything that goes wrong in between."
tags:
  - devlife
language: en
author: "Alex Kucherenko"
draft: false
---

The phone buzzes at 11:47 PM. You know what it is before you look. PagerDuty has a distinctive vibration pattern -- three short pulses that your nervous system has learned to associate with adrenaline, dread, and the immediate need to find your laptop. You're already out of bed by the second pulse. Your partner mumbles something about "that thing again" and goes back to sleep. You envy their ability to not care about HTTP 500 errors.

The dashboard tells the story: response times spiked from 200ms to 12 seconds at 11:42 PM. Error rate jumped from 0.1% to 34%. The database connection pool is exhausted. Three microservices are in a cascading failure loop, each one timing out while waiting for the other. It's a distributed systems problem, which means it's everyone's problem and nobody's problem simultaneously.

## The War Room

You join the incident Slack channel. Two other engineers are already there, one of whom has been debugging for five minutes and has already identified three incorrect hypotheses. This is normal. Incident response is 80% wrong guesses and 20% the right guess that seems obvious in retrospect. The trick is to guess fast and fail cheap.

Someone suggests rolling back the latest deploy. It went out at 4 PM -- seven hours ago. If the deploy caused this, why did it take seven hours to manifest? You check the deploy diff. Fourteen files changed, mostly frontend. One backend change: a database query optimization that removes an unused index scan. Could that be it? At midnight, everything is suspicious and nothing makes sense. You roll back anyway because rollbacks are cheap and certainty is expensive.

The rollback doesn't fix it. The error rate drops from 34% to 28%, which means the deploy made it worse but wasn't the root cause. Now you have two problems: the original issue and the emotional weight of having ruled out the easy fix.

## The Fix

At 12:31 AM, someone notices that the database's disk usage hit 95% at 11:40 PM. A scheduled job that aggregates analytics data ran at 11:30 and produced a temporary table that consumed 40GB of disk space. The table was supposed to be cleaned up after processing, but the cleanup step failed silently because the disk was already at 90% and the temp table creation pushed it over the threshold. A classic feedback loop: the cleanup failed because of low disk space, and the disk space was low because the cleanup failed.

The fix is embarrassingly simple: delete the temp table, add disk space monitoring, make the cleanup step fail loudly. Three commands, two config changes, one alert rule. Total fix time: four minutes. Total incident time: forty-nine minutes. Total time spent in next week's postmortem meeting discussing how to prevent this from happening again: ninety minutes. The postmortem produces an action item to add better monitoring. The action item is assigned, prioritized as "medium," and joins the backlog where it will marinate until the next midnight incident reminds everyone why it was important.

You close your laptop at 12:52 AM, set your alarm for 7, and go back to bed knowing that somewhere in the backlog, a medium-priority ticket is quietly counting down to the next midnight phone call.
