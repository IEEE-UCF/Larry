import axios from 'axios';
import ical from 'node-ical';

const rawCalendarURL = 'https://calendar.google.com/calendar/ical/ieee.ucf%40gmail.com/public/basic.ics';

async function fetchCalendarEvents() {
	const response = await axios.get(rawCalendarURL);
	const ics = ical.parseICS(response.data);
	const vevents = Object.values(ics).filter(e => e.type === 'VEVENT' && e.start > new Date());
	return vevents;
}

fetchCalendarEvents().then(events => {
	console.log(events);
});

