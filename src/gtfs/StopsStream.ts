import {FlightSchedule} from "../ssim/SSIMStream";
import {GTFSFileStream} from "./GTFSFileStream";
import {TransformOptions} from "stream";
import {AirportIndex} from "../csv/AirportsCSV";

/**
 * Extract the stops from the FlightSchedule objects
 */
export class StopsStream extends GTFSFileStream {
  private stopsSeen: StopsIndex = {};

  protected header = "stop_id,stop_code,stop_name,stop_desc,stop_lat,stop_lon,stop_url,location_type,parent_station";

  constructor(opts: TransformOptions, private readonly airports: AirportIndex) {
    super(opts);
  }

  protected getData(schedule: FlightSchedule): string {
    return this.getStop(schedule.origin) + this.getStop(schedule.destination);
  }

  private getStop(stopId: string): string {
    if (this.stopsSeen[stopId]) {
      return "";
    }

    this.stopsSeen[stopId] = stopId;

    const {name, lat, lng, url} = this.airports[stopId] || { name: "", lat: "", lng: "", url: ""};

    return `${stopId},${stopId},${name},${stopId},${lat},${lng},${url},,1,,,,\n`;
  }

}

interface StopsIndex {
  [stopId: string]: string;
}