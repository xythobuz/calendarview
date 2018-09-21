// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

// Return an EventSource that fetches events from the ICAL file at `url`.
function ical_event_source(url, color, filter) {
  return {
    id: url,
    events: (start, end, timezone, callback) => {
      fetch(url).then((response) => {
        return response.text()
      }).then((data) => {
        var comp = new ICAL.Component(ICAL.parse(data));
        var events = comp.getAllSubcomponents('vevent').map(ve => new ICAL.Event(ve));
        var filter_events = events.filter(entry => !filter || new RegExp(filter).test(entry.summary));
        var our_events = Array()
        filter_events.forEach(function(element) {
          var end = ICAL.Time.now();
          end.adjust(360, 0, 0, 0);
          var it = element.iterator();
          var entry;
          while (entry = it.next()) {
              var t = entry.clone();
              t.addDuration(element.duration);
              if (t.compare(end) == 1) break;
              var event = {
                id: element.uid,
                title: element.summary,
                allDay: element.startDate.isDate,
                start: entry.toJSDate(),
                end: t.toJSDate(),
                color: color,
                location: element.location,
                description: element.description
              };
              our_events.push(event);
          }
        });
        callback(our_events);
      });
    }
  };
}

$(document).ready(function() {
  $('#calendar').fullCalendar({
    height: window.innerHeight,
    defaultView: 'month',
    timezone: 'local',
    weekends: true
  });

  window.onresize = () => $('#calendar').fullCalendar('option', 'height', window.innerHeight);
  var hash = document.location.hash.substring(1).split(',')
  var filter = hash[1]
  var calendars = hash[0].split(";").map(calendar => calendar.split('|'))

  for(var i = 0; i < calendars.length; i++) {
    $('#calendar').fullCalendar('addEventSource', ical_event_source(calendars[i][0], calendars[i][1], filter));
  }

  // Refresh calendar sources every 5 minutes.
  setInterval(() => $('#calendar').fullCalendar('refetchEvents'), 5 * 60 * 1000);
  // Ensure that the current time is showing every half hour.
  setInterval(() => $('#calendar').fullCalendar('gotoDate', moment()), 30 * 60 * 1000);

});
