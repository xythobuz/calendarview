// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

// Return an EventSource that fetches events from the ICAL file at `url`.
function ical_event_source(url, color) {
  return {
    id: url,
    events: (start, end, timezone, callback) => {
      fetch(url, {mode:"no-cors"}).then((response) => {
        return response.text()
      }).then((data) => {
        var comp = new ICAL.Component(ICAL.parse(data));
        var events = comp.getAllSubcomponents('vevent').map(ve => new ICAL.Event(ve));
        callback(
          events
          //TODO: handle recurring events
            .filter(entry => !entry.isRecurring() && (moment(entry.startDate.toJSDate()).isBetween(start, end, null, '[]') || moment(entry.endDate.toJSDate()).isBetween(start, end, null, '[]')))
            .map(entry => {
              return {
                id: entry.uid,
                title: entry.summary,
                allDay: entry.startDate.isDate,
                start: entry.startDate.toJSDate(),
                end: entry.endDate.toJSDate(),
                color: color,
                location: entry.location,
                description: entry.description
              };
            }));
      });
    }
  };
}

$(document).ready(function() {
  $('#calendar').fullCalendar({
    height: window.innerHeight,
    defaultView: 'month',
    timezone: 'local',
    weekends: false
  });

  window.onresize = () => $('#calendar').fullCalendar('option', 'height', window.innerHeight);
  var calendars = document.location.hash.substring(1)
  calendars = calendars.split(";").map(calendar => calendar.split(','))

  for(var i = 0; i < calendars.length; i++) {
    $('#calendar').fullCalendar('addEventSource', ical_event_source(calendars[i][0], calendars[i][1]));
  }

  // Refresh calendar sources every 5 minutes.
  setInterval(() => $('#calendar').fullCalendar('refetchEvents'), 5 * 60 * 1000);
  // Ensure that the current time is showing every half hour.
  setInterval(() => $('#calendar').fullCalendar('gotoDate', moment()), 30 * 60 * 1000);

});
