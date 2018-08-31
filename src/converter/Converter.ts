import {ReadStream, WriteStream} from "fs";
import {LineStream} from "byline";
import {SSIMStream} from "../ssim/SSIMStream";
import {StopsStream} from "../gtfs/StopsStream";
import {Archiver} from "archiver";
import {AgencyStream} from "../gtfs/AgencyStream";
import {RoutesStream} from "../gtfs/RoutesStream";
import {Transform} from "stream";
import {CalendarStream} from "../gtfs/CalendarStream";
import {TripsStream} from "../gtfs/TripsStream";
import {StopTimesStream} from "../gtfs/StopTimesStream";

export class Converter {

  constructor(
    private readonly archive: Archiver,
    private readonly lines: LineStream,
    private readonly ssim: SSIMStream,
    private readonly agency: AgencyStream,
    private readonly stops: StopsStream,
    private readonly routes: RoutesStream,
    private readonly calendar: CalendarStream,
    private readonly trips: TripsStream,
    private readonly stopTimes: StopTimesStream
  ) {}

  /**
   * Connect the pipes:
   *
   * input -> line reader -> ssim transformer -> gtfs files[] -> archive -> output
   */
  public async process(input: ReadStream, output: WriteStream): Promise<void> {
    input.pipe(this.lines);

    this.lines.pipe(this.ssim);

    const [agency, stops, routes, calendar, trips, stopTimes] = await Promise.all([
      streamToString(this.ssim.pipe(this.agency)),
      streamToString(this.ssim.pipe(this.stops)),
      streamToString(this.ssim.pipe(this.routes)),
      streamToString(this.ssim.pipe(this.calendar)),
      streamToString(this.ssim.pipe(this.trips)),
      streamToString(this.ssim.pipe(this.stopTimes))
    ]);

    this.archive.append(agency, { name: "agency.txt" });
    this.archive.append(stops, { name: "stops.txt" });
    this.archive.append(routes, { name: "routes.txt" });
    this.archive.append(calendar, { name: "calendar.txt" });
    this.archive.append(trips, { name: "trips.txt" });
    this.archive.append(stopTimes, { name: "stop_times.txt" });

    this.archive.pipe(output);
    this.archive.finalize();
  }

}

function streamToString(stream: Transform): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let string = "";

    stream.on("data", data => string += data);
    stream.on("end", () => resolve(string));
    stream.on("error", reject);
  });
}