import {TransformOptions} from "stream";
import {FlightSchedule} from "./SSIMStream";
import {GTFSFileStream} from "./GTFSFileStream";
import {RoutesStream} from "./RoutesStream";
import {CalendarStream} from "./CalendarStream";

/**
 * Extract the trips from the FlightSchedule objects
 */
export class TripsStream extends GTFSFileStream {
  protected header = "route_id,service_id,trip_id,trip_headsign,trip_short_name,direction_id,block_id,shape_id,wheelchair_accessible,bikes_allowed";

  constructor(opts: TransformOptions,
              private readonly routes: RoutesStream,
              private readonly calendar: CalendarStream) {
    super(opts);
  }

  protected getData(schedule: FlightSchedule): string {
    const routeId = this.routes.getRouteId(schedule);
    const serviceId = this.calendar.getServiceId(schedule);

    return `${routeId},${serviceId},,,,,,,,,,,,\n`;
  }

}

interface StopsIndex {
  [stopId: string]: string;
}