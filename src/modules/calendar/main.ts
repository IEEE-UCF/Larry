import axios from 'axios';
import ical from 'node-ical';

export class Calendar {
	calendars: string[];

	constructor(calendars: string[]) {
		this.calendars = calendars;
	}

	async fetchCalendarEvents() {
		const allEvents: any[] = [];

		for (const calendarURL of this.calendars) {
			const response = await axios.get(calendarURL);
			const ics = ical.parseICS(response.data);

			const now = new Date();
			const futureLimit = new Date();
			futureLimit.setMonth(futureLimit.getMonth() + 3); // Next 3 months

			const events: any[] = [];

			for (const event of Object.values(ics)) {
				if (event.type === 'VEVENT') {
					if (event.rrule) {
						// Expand recurring events
						const dates = event.rrule.between(now, futureLimit, true);
						for (const date of dates) {
							// Exclude EXDATEs
							if (event.exdate?.[date.toISOString()]) continue;
							events.push({
								...event,
								start: date,
								end: new Date(date.getTime() + (event.end.getTime() - event.start.getTime())),
							});
						}
					} else if (event.start > now) {
						events.push(event);
					}
				}
			}

			allEvents.push(...events);
		}

		// Sort all events by start date
		return allEvents.sort((a: any, b: any) => {
			if (a.start && b.start) {
				return (a.start as Date).getTime() - (b.start as Date).getTime();
			}
			return 0;
		});
	}
}