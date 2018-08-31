import * as fs from "fs";
import {WriteStream, ReadStream} from "fs";
import {LineStream} from "byline";
import archiver = require("archiver");
import {SSIMStream} from "./ssim/SSIMStream";
import {StopsStream} from "./gtfs/StopsStream";
import {Converter} from "./converter/Converter";
import {AgencyStream} from "./gtfs/AgencyStream";
import {RoutesStream} from "./gtfs/RoutesStream";
import {CalendarStream} from "./gtfs/CalendarStream";
import {TripsStream} from "./gtfs/TripsStream";
import {StopTimesStream} from "./gtfs/StopTimesStream";

const archive = archiver("zip", { zlib: { level: 9 } });
const lines = new LineStream({ encoding: "utf8" });
const ssim = new SSIMStream({ objectMode: true });
const agency = new AgencyStream({ objectMode: true });
const stops = new StopsStream({ objectMode: true });
const routes = new RoutesStream({ objectMode: true });
const calendar = new CalendarStream({ objectMode: true });
const trips =  new TripsStream({ objectMode: true }, routes, calendar);
const stopTimes =  new StopTimesStream({ objectMode: true }, trips);
const converter = new Converter(archive, lines, ssim, agency, stops, routes, calendar, trips, stopTimes);

const [input, output] = process.argv.slice(2);
const inStream = input ? fs.createReadStream(input, "utf8") : process.stdin;
const outStream = output ? fs.createWriteStream(output) : process.stdout;

converter
  .process(inStream as ReadStream, outStream as WriteStream)
  .then(() => console.log("Complete."));

