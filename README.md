This project provides a read-only HTML calendar view using [fullcalendar][1].
It is used on the website toolbox-bodensee.de to display the upcoming events.

There's no server required (beyond the one that hosts your calendar data).

Ics calendars can be added via the hash in the url, separated by a semicolon.
Colors can be added after the calendar url separated by a pipe.

```
http://localhost:8000/#http://localhost:8000/home-office.ics|blue;http://localhost:8000/vacation.ics
```

Filtering can be added as a regular expression at the end and separated by a colon.

Any copyright is dedicated to the Public Domain.  
http://creativecommons.org/publicdomain/zero/1.0/

[1]: http://fullcalendar.io/
