import {FlightSchedule} from "./SSIMStream";
import {GTFSFileStream} from "./GTFSFileStream";

/**
 * Extract the stops from the FlightSchedule objects
 */
export class StopsStream extends GTFSFileStream {
  private stopsSeen: StopsIndex = {};
  protected header = "stop_id,stop_name,stop_desc,stop_lat,stop_lon,stop_url,location_type,parent_station";

  protected getData(schedule: FlightSchedule): string {
    return this.getStop(schedule.origin) + this.getStop(schedule.destination);
  }

  private getStop(stopId: string): string {
    if (this.stopsSeen[stopId]) {
      return "";
    }

    this.stopsSeen[stopId] = stopId;

    return `${stopId},,${stopId},0.00,0.00,,,1,,,,\n`;
  }

}

interface StopsIndex {
  [stopId: string]: string;
}