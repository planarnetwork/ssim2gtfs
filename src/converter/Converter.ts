import {ReadStream, WriteStream} from "fs";
import {LineStream} from "byline";
import {SSIMStream} from "../stream/SSIMStream";
import {StopsStream} from "../stream/StopsStream";
import {Archiver} from "archiver";

export class Converter {

  constructor(
    private readonly archive: Archiver,
    private readonly lines: LineStream,
    private readonly ssim: SSIMStream,
    private readonly stops: StopsStream
  ) {}

  /**
   * Connect the pipes:
   *
   * input -> line reader -> ssim transformer -> gtfs files[] -> archive -> output
   */
  public process(input: ReadStream, output: WriteStream): void {
    input.pipe(this.lines);

    this.lines.pipe(this.ssim);
    this.ssim.pipe(this.stops);
    // this.ssim.pipe(this.trips);

    this.archive.append(this.stops, { name: "stops.txt" });
    // this.archive.append(this.trips, { name: "trips.txt" });

    this.archive.pipe(output);
    this.archive.finalize();
  }

}