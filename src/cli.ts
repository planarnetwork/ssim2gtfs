import * as fs from "fs";
import {WriteStream, ReadStream} from "fs";
import * as archiver from "archiver";
import {LineStream} from "byline";
import {SSIMStream} from "./stream/SSIMStream";
import {StopsStream} from "./stream/StopsStream";
import {Converter} from "./converter/Converter";

const converter = new Converter(
  archiver("zip", { zlib: { level: 9 } }),
  new LineStream({ encoding: "utf8" }),
  new SSIMStream({ objectMode: true }),
  new StopsStream({ objectMode: true }),
);

const [input, output] = process.argv.slice(2);
const inStream = input ? fs.createReadStream(input, "utf8") : process.stdin;
const outStream = output ? fs.createWriteStream(output) : process.stdout;

converter.process(inStream as ReadStream, outStream as WriteStream);

