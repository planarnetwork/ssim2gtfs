import {Transform, TransformCallback} from "stream";
import {FlightSchedule} from "../ssim/SSIMStream";

export abstract class GTFSFileStream extends Transform {
  private headerSent: boolean = false;

  protected abstract readonly header: string;

  /**
   * Transform the schedule into a CSV string
   */
  public _transform(schedule: FlightSchedule, encoding: string, callback: TransformCallback): void {
    const data = this.getHeader() + this.getData(schedule);

    callback(undefined, data);
  }

  /**
   * Return the header if it hasn't been sent
   */
  protected getHeader(): string {
    if (this.headerSent) {
      return "";
    }

    this.headerSent = true;

    return this.header + "\n";
  }

  protected abstract getData(schedule: FlightSchedule): string;

}