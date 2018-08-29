import {Transform, TransformCallback} from "stream";
import {FlightSchedule} from "./SSIMStream";

/**
 * Extract the stops from the FlightSchedule objects
 */
export class StopsStream extends Transform {
  private stopsSeen: StopsIndex = {};
  private headerSent: boolean = false;

  /**
   * Transform and emit the stop if it hasn't been seen before
   */
  public _transform(schedule: FlightSchedule, encoding: string, callback: TransformCallback): void {
    const stops = this.getHeader() + this.getStop(schedule.origin) + this.getStop(schedule.destination);

    callback(undefined, stops);
  }

  private getStop(stopId: string): string {
    if (this.stopsSeen[stopId]) {
      return "";
    }

    this.stopsSeen[stopId] = stopId;

    return `${stopId},,${stopId},0.00,0.00,,,1,,,,\n`;
  }

  private getHeader(): string {
    if (this.headerSent) {
      return "";
    }

    this.headerSent = true;

    return "stop_id,stop_name,stop_desc,stop_lat,stop_lon,stop_url,location_type,parent_station\n";
  }
}

interface StopsIndex {
  [stopId: string]: string;
}