import archiver = require("archiver");
import {LineStream} from "byline";
import {SSIMStream} from "./ssim/SSIMStream";
import {StopsStream} from "./gtfs/StopsStream";
import {Converter} from "./converter/Converter";
import {AgencyStream} from "./gtfs/AgencyStream";
import {RoutesStream} from "./gtfs/RoutesStream";
import {CalendarStream} from "./gtfs/CalendarStream";
import {TripsStream} from "./gtfs/TripsStream";
import {StopTimesStream} from "./gtfs/StopTimesStream";
import * as fs from "fs";
import * as parse from "csv-parse";
import {AirportIndex, AirportsCSV} from "./csv/AirportsCSV";
import {AirlinesCSV, AirlinesIndex} from "./csv/AirlinesCSV";

/**
 * Bare bones dependency container
 */
export class Container {

  public async getConverter(): Promise<Converter> {
    const [airports, airlines] = await Promise.all([
      this.getAirportIndex(),
      this.getAirlineIndex()
    ]);

    const archive = archiver("zip", { zlib: { level: 9 } });
    const lines = new LineStream({ encoding: "utf8" });
    const ssim = new SSIMStream({ objectMode: true });
    const agency = new AgencyStream({ objectMode: true }, airlines);
    const stops = new StopsStream({ objectMode: true }, airports);
    const routes = new RoutesStream({ objectMode: true });
    const calendar = new CalendarStream({ objectMode: true });
    const trips =  new TripsStream({ objectMode: true }, routes, calendar);
    const stopTimes =  new StopTimesStream({ objectMode: true }, trips);

    return new Converter(archive, lines, ssim, agency, stops, routes, calendar, trips, stopTimes);
  }

  private getAirportIndex(): Promise<AirportIndex> {
    const csv = new AirportsCSV(
      parse(),
      fs.createReadStream(__dirname + "/../resource/airports.csv"),
    );

    return csv.getAirportIndex();
  }

  private getAirlineIndex(): Promise<AirlinesIndex> {
    const csv = new AirlinesCSV(
      parse(),
      fs.createReadStream(__dirname + "/../resource/airlines.csv"),
    );

    return csv.getAirlinesIndex();
  }
}
