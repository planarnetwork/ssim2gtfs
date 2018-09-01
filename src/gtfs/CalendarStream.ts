import {FlightSchedule} from "../ssim/SSIMStream";
import {GTFSFileStream} from "./GTFSFileStream";

/**
 * Extract the agencies from the FlightSchedule objects
 */
export class CalendarStream extends GTFSFileStream {
  private datesSeen: CalendarIndex = {};
  private currentId: number = 1;

  protected header = "service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date";

  protected getData(schedule: FlightSchedule): string {
    const calendarId = this.getCalendarId(schedule);

    if (this.datesSeen[calendarId]) {
      return "";
    }

    const serviceId = this.getServiceId(schedule);
    const days = schedule.days.join(",");

    return `${serviceId},${days},${schedule.startDate},${schedule.endDate}\n`;
  }

  public getServiceId(schedule: FlightSchedule): number {
    const calendarId = this.getCalendarId(schedule);

    if (!this.datesSeen[calendarId]) {
      this.datesSeen[calendarId] = this.currentId++;
    }

    return this.datesSeen[calendarId]
  }

  public getCalendarId(schedule: FlightSchedule): string {
    return schedule.startDate + schedule.endDate + schedule.days;
  }

}

interface CalendarIndex {
  [dates: string]: number;
}