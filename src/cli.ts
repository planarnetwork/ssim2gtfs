import * as fs from "fs";
import {WriteStream, ReadStream} from "fs";
import * as archiver from "archiver";

const [input, output] = process.argv.slice(2);
const inStream = input ? fs.createReadStream(input) : process.stdin;
const outStream = output ? fs.createWriteStream(output) : process.stdout;

main(inStream as ReadStream, outStream as WriteStream);

function main(input: ReadStream, output: WriteStream) {
  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.pipe(output);
  archive.append(input, { name: "stops.txt" });
  archive.append(input, { name: "trips.txt" });
  archive.finalize();
}

