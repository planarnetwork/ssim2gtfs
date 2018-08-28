import {Transform, TransformCallback} from "stream";
import {FlightSchedule} from "./SSIMStream";

/**
 * Extract the stops from the SCR entries
 */
export class StopsStream extends Transform {
  private stopsSeen: StopsIndex = {};

  /**
   * Transform and emit the stop if it hasn't been seen before
   */
  public _transform(schedule: FlightSchedule, encoding: string, callback: TransformCallback): void {
    const stops = this.getStop(schedule.origin) + this.getStop(schedule.destination);

    callback(undefined, stops);
  }

  private getStop(stopId: string): string {
    if (this.stopsSeen[stopId]) {
      return "";
    }

    this.stopsSeen[stopId] = stopId;

    return stopId + "\n";
  }
}

interface StopsIndex {
  [stopId: string]: string;
}