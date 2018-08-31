import {TransformOptions} from "stream";
import {FlightSchedule} from "../ssim/SSIMStream";
import {GTFSFileStream} from "./GTFSFileStream";
import {RoutesStream} from "./RoutesStream";
import {CalendarStream} from "./CalendarStream";

/**
 * Extract the trips from the FlightSchedule objects
 */
export class TripsStream extends GTFSFileStream {
  private tripsSeen: TripsIndex = {};
  private currentId: number = 1;

  protected header = "route_id,service_id,trip_id,trip_headsign,trip_short_name,direction_id,block_id,shape_id,wheelchair_accessible,bikes_allowed";

  constructor(opts: TransformOptions,
              private readonly routes: RoutesStream,
              private readonly calendar: CalendarStream) {
    super(opts);
  }

  protected getData(schedule: FlightSchedule): string {
    const routeId = this.routes.getRouteId(schedule);
    const serviceId = this.calendar.getServiceId(schedule);
    const tripId = this.getTripId(schedule);
    const shortName = schedule.flightNumber + schedule.variation + schedule.leg;

    return `${routeId},${serviceId},${tripId},${schedule.flightNumber},${shortName},,,,1,2\n`;
  }

  public getTripId(schedule: FlightSchedule): number {
    const id = schedule.flightNumber + schedule.variation + schedule.leg;

    if (!this.tripsSeen[id]) {
      this.tripsSeen[id] = this.currentId++;
    }

    return this.tripsSeen[id];
  }

}

interface TripsIndex {
  [tripId: string]: number;
}