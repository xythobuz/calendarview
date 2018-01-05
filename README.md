This project provides a read-only HTML calendar view using [fullcalendar][1].
It is intended for use on a wall-mounted display, such as a tablet.

There's no server required (beyond the one that hosts your calendar data),
so you can [try it out here](https://rollbrettler.github.io/calendarview).

Ics calendars can be added via the hash in the url. Separated by a semicolon. Colors can be added after the calendar url separated by a pipe.
```
http://localhost:8000/#http://localhost:8000/home-office.ics|blue;http://localhost:8000/vacation.ics
```

Filtering can be added as a regular expression at the end and separated by a colon.

Some useful features:
* Refreshes calendar events periodically
* The page will reload if new code changes have been pushed to the repository.

Any copyright is dedicated to the Public Domain.  
http://creativecommons.org/publicdomain/zero/1.0/

[1]: http://fullcalendar.io/
