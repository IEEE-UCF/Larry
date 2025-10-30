import axios from 'axios';
import ical from 'node-ical';

export class Calendar {
	calendars: any[];

	constructor(calendars: string[]) {
		this.calendars = calendars;
	}

	async fetchCalendarEvents() {
		const events: any[] = [];
		for (const calendarURL of this.calendars) {
			const response = await axios.get(calendarURL);
			const ics = ical.parseICS(response.data);
			const vevents = Object.values(ics).filter((e: any) => e.type === 'VEVENT').sort((a: any, b: any) => {
				if (a.start && b.start) {
					return (a.start as Date).getTime() - (b.start as Date).getTime();
				}
				return 0;
			});
			events.push(...vevents);
		}
		return events;
	}
}