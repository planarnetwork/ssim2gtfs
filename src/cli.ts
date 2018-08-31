import * as fs from "fs";
import {WriteStream, ReadStream} from "fs";
import {LineStream} from "byline";
import {SSIMStream} from "./stream/SSIMStream";
import {StopsStream} from "./stream/StopsStream";
import {Converter} from "./converter/Converter";
import {AgencyStream} from "./stream/AgencyStream";
import {RoutesStream} from "./stream/RoutesStream";
import archiver = require("archiver");
import {CalendarStream} from "./stream/CalendarStream";
import {TripsStream} from "./stream/TripsStream";

const archive = archiver("zip", { zlib: { level: 9 } });
const lines = new LineStream({ encoding: "utf8" });
const ssim = new SSIMStream({ objectMode: true });
const agency = new AgencyStream({ objectMode: true });
const stops = new StopsStream({ objectMode: true });
const routes = new RoutesStream({ objectMode: true });
const calendar = new CalendarStream({ objectMode: true });
const trips =  new TripsStream({ objectMode: true }, routes, calendar);
const converter = new Converter(archive, lines, ssim, agency, stops, routes, calendar, trips);

const [input, output] = process.argv.slice(2);
const inStream = input ? fs.createReadStream(input, "utf8") : process.stdin;
const outStream = output ? fs.createWriteStream(output) : process.stdout;

converter
  .process(inStream as ReadStream, outStream as WriteStream)
  .then(() => console.log("Complete."));

