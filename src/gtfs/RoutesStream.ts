import {FlightSchedule} from "../ssim/SSIMStream";
import {GTFSFileStream} from "./GTFSFileStream";

/**
 * Extract the routes from the FlightSchedule objects
 */
export class RoutesStream extends GTFSFileStream {
  private routesSeen: RouteIndex = {};
  protected header = "route_id,agency_id,route_short_name,route_long_name,route_type,route_text_color,route_url,route_desc";

  protected getData(schedule: FlightSchedule): string {
    const routeId = this.getRouteId(schedule);

    if (this.routesSeen[routeId]) {
      return "";
    }

    this.routesSeen[routeId] = routeId;

    return `${routeId},${schedule.operator},${routeId},${routeId},1100,,,,\n`;
  }

  public getRouteId(schedule: FlightSchedule): string {
    return [schedule.operator, schedule.origin, schedule.destination].join("_");
  }

}

interface RouteIndex {
  [routeId: string]: string;
}