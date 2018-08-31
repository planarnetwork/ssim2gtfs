import {TransformOptions} from "stream";
import {FlightSchedule} from "../ssim/SSIMStream";
import {GTFSFileStream} from "./GTFSFileStream";
import {TripsStream} from "./TripsStream";

/**
 * Extract the stop times from the FlightSchedule objects
 */
export class StopTimesStream extends GTFSFileStream {
  protected header = "trip_id,arrival_time,departure_time,stop_id,stop_sequence,stop_headsign,pickup_type,drop_off_type,shape_dist_traveled,timepoint";

  constructor(opts: TransformOptions, private readonly trips: TripsStream) {
    super(opts);
  }

  protected getData(schedule: FlightSchedule): string {
    const tripId = this.trips.getTripId(schedule);

    return `${tripId},${schedule.departureTime},${schedule.departureTime},${schedule.origin},1,,0,1,,,,,,,\n`
      +  `${tripId},${schedule.arrivalTime},${schedule.arrivalTime},${schedule.destination},1,,1,0,,,,,,,\n`;
  }

}

interface StopsIndex {
  [stopId: string]: string;
}