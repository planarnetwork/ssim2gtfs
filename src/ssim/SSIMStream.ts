import {Transform, TransformCallback} from "stream";

/**
 * Transform the input text gtfs into a gtfs of FlightSchedules
 */
export class SSIMStream extends Transform {

  /**
   * If the line is a record type 3, convert it to a FlightSchedule
   */
  public _transform(chunk: string, encoding: string, callback: TransformCallback): void {
    if (chunk.charAt(0) === RecordType.FlightSchedule) {
      callback(undefined, this.getSchedule(chunk));
    }
    else {
      callback();
    }
  }

  private getSchedule(line: string): FlightSchedule {
    return {
      "operator": line.substr(2, 2),
      "flightNumber": line.substr(5, 4),
      "variation": line.substr(9, 2),
      "leg": line.substring(11, 2),
      "startDate": line.substr(14, 7),
      "endDate": line.substr(21, 7),
      "days": line.substr(28, 7),
      "origin": line.substr(36, 3),
      "departureTime": line.substr(39, 4) + line.substr(39, 5),
      "destination": line.substr(54, 3),
      "arrivalTime": line.substr(57, 5) + line.substr(65, 5),
    };
  }

}

enum RecordType {
  Header = "1",
  FeedInfo = "2",
  FlightSchedule = "3"
}

export interface FlightSchedule {
  "operator": string;
  "flightNumber": string;
  "variation": string;
  "leg": string;
  "startDate": string;
  "endDate": string;
  "days": string;
  "origin": string;
  "departureTime": string;
  "destination": string;
  "arrivalTime": string;
}