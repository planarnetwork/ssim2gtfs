import {Transform, TransformCallback} from "stream";
import {FlightSchedule} from "./SSIMStream";

/**
 * Extract the routes from the FlightSchedule objects
 */
export class RoutesStream extends Transform {
  private routesSeen: RouteIndex = {};
  private headerSent: boolean = false;

  /**
   * Transform and emit the route if it hasn't been seen before
   */
  public _transform(schedule: FlightSchedule, encoding: string, callback: TransformCallback): void {
    const routes = this.getHeader() + this.getRoute(schedule);

    callback(undefined, routes);
  }

  private getRoute(schedule: FlightSchedule): string {
    const routeId = [schedule.operator, schedule.origin, schedule.destination].join("_");

    if (this.routesSeen[routeId]) {
      return "";
    }

    this.routesSeen[routeId] = routeId;

    return `${routeId},${schedule.operator},${routeId},${routeId},1100,,,,\n`;
  }

  private getHeader(): string {
    if (this.headerSent) {
      return "";
    }

    this.headerSent = true;

    return "route_id,agency_id,route_short_name,route_long_name,route_type,route_text_color,route_url,route_desc\n";
  }
}

interface RouteIndex {
  [routeId: string]: string;
}