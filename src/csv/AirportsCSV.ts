import {Parser} from "csv-parse";
import {ReadStream} from "fs";

/**
 * Access to the airports CSV data
 */
export class AirportsCSV {

  constructor(
    private readonly csv: Parser,
    private readonly file: ReadStream
  ) {}

  /**
   * Pipe the file stream into the parse and index the data
   */
  public getAirportIndex(): Promise<AirportIndex> {
    return new Promise((resolve, reject) => {
      const index: AirportIndex = {};

      this.file.pipe(this.csv);

      this.csv.on("data", ([id, name, lat, lng, url]: StopRow) => index[id] = { name, lat, lng, url });
      this.csv.on("end", () => resolve(index));
      this.csv.on("error", reject);
    });
  }
}

type StopRow = [string, string, string, string, string?];

export interface AirportIndex {
  [id: string]: {
    name: string,
    lat: string,
    lng: string,
    url?: string
  }
}
