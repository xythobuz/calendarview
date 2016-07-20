/*global $,google_auth,google_event_source,ical_event_source,localforage,moment,setInterval,setTimeout */
// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

var CLIENT_ID = '828124712330-lak7vgv6kak9cij45o1sjcppk9us0ahv.apps.googleusercontent.com';

var calendars = [];
$(document).ready(function() {
  $('#calendar').fullCalendar({
    header: {
      left: '',
      center: 'title',
      right: ''
    },
    defaultView: 'schedule',
    timezone: 'local'
  });
  localforage.getItem('calendars')
    .then((data) => {
      if (data != null) {
        console.log('Found %d saved calendars', data.length);
        calendars = data;
        var google_calendars = [];
        for (let calendar of data) {
          if (calendar.type == 'ical') {
            add_ical_source(calendar.url);
          } else if (calendar.type == 'google') {
            google_calendars.push(calendar.id);
          }
        }
        if (google_calendars) {
          google_auth(CLIENT_ID).then(() => google_calendars.forEach(id => add_google_source(id)));
        }
      }
    });

  // Refresh calendar sources every 5 minutes.
  setInterval(() => $('#calendar').fullCalendar('refetchEvents'), 5 * 60 * 1000);
  // Ensure that the current day is showing.
  check_current_day();
});

function check_current_day() {
  // Set the calendar to show the current day.
  $('#calendar').fullCalendar('today');
  // Check again when the day rolls over to tomorrow.
  var tomorrow = moment().add(1, 'day').startOf('day');
  var now = moment();
  setTimeout(check_current_day, tomorrow.diff(now));
}

function add_calendar(type, which) {
  if (type == 'ical') {
    add_ical_source(which);
    calendars.push({type: type, url: which});
    localforage.setItem('calendars', calendars);
  } else if (type == 'google') {
    google_auth(CLIENT_ID).then(() => {
      add_google_source(which);
      calendars.push({type: type, id: which});
      localforage.setItem('calendars', calendars);
    });
  } else {
    console.error('Only ical and Google calendars are supported currently');
  }
}

function add_ical_source(url) {
  $('#calendar').fullCalendar('addEventSource', ical_event_source(url));
}

function add_google_source(url) {
  $('#calendar').fullCalendar('addEventSource', google_event_source(url));
}

// Create a subclass of AgendaView.
var FC = $.fullCalendar;
var ScheduleView = FC.AgendaView.extend({
  // Always display just `intervalDuration` days from `date`.
  computeRange: function(date) {
    var start = date.clone();
    var end = start.clone().add(this.intervalDuration);
    console.log('computeRange: %s - %s', start.toString(), end.toString());
    return {
      // Always work in days.
      intervalUnit: 'days',
      intervalStart: start,
      intervalEnd: end,
      start: start,
      end: end
    };
  },
  //XXX: this is a hack to work around the fact that fullcalendar won't
  // re-render the view when the date changes if the new date is within
  // the existing interval.
  massageCurrentDate: function(date, direction) {
    if (date.isWithin(this.intervalStart, this.intervalEnd)) {
      this.intervalStart = date.clone().add(1, 'day');
      this.intervalEnd = this.intervalStart.clone().add(this.intervalDuration);
    }
    return date;
  }
});

FC.views.schedule = {
  'class': ScheduleView,
  'duration': {'days': 6},
  // Cribbed from the agenda defaults.
  defaults: {
    allDaySlot: true,
    allDayText: 'all-day',
    slotDuration: '00:30:00',
    minTime: '00:00:00',
    maxTime: '24:00:00',
    slotEventOverlap: true
  }
};
