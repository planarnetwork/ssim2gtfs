import {Parser} from "csv-parse";
import {ReadStream} from "fs";

/**
 * Access to the airlines CSV data
 */
export class AirlinesCSV {

  constructor(
    private readonly csv: Parser,
    private readonly file: ReadStream
  ) {}

  /**
   * Pipe the file stream into the parse and index the data
   */
  public getAirlinesIndex(): Promise<AirlinesIndex> {
    return new Promise((resolve, reject) => {
      const index: AirlinesIndex = {};

      this.file.pipe(this.csv);

      this.csv.on("data", ([id, name, country]: AirlineRow) => index[id] = { name, country });
      this.csv.on("end", () => resolve(index));
      this.csv.on("error", reject);
    });
  }
}

type AirlineRow = [string, string, string];

export interface AirlinesIndex {
  [id: string]: {
    name: string,
    country: string
  }
}
