import {Transform, TransformCallback} from "stream";
import {LocalDate, LocalDateTime, LocalTime, ZonedDateTime, ZoneOffset, ZoneId} from "js-joda";

/**
 * Transform the input text stream into a stream of FlightSchedules
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
    const startDateTime = parseDateTime(line.substr(14, 7), line.substr(39, 4), line.substr(47, 5));
    const startDate = startDateTime.withZoneSameInstant(ZoneId.UTC).toLocalDate().toString();
    const departureTime = startDateTime.withZoneSameInstant(ZoneId.UTC).toLocalTime().toString();

    return {
      "operator": line.substr(2, 2),
      "flightNumber": line.substr(6, 4),
      "variation": line.substr(10, 2),
      "leg": line.substr(12, 1),
      "startDate": startDate,
      "endDate": line.substr(21, 7),
      "days": line.substr(28, 7),
      "origin": line.substr(36, 3),
      "departureTime": departureTime,
      "destination": line.substr(54, 3),
      "arrivalTime": line.substr(57, 4) + line.substr(65, 5),
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

function parseDateTime(date: string, time: string, timezone: string): ZonedDateTime {
  const day = date.substr(0, 2);
  const month = months[date.substr(2, 3)];
  const year = "20" + date.substr(5, 2);
  const formattedTime = time.substr(0, 2) + ":" + time.substr(2, 2) + ":00";
  const formattedZone = timezone.substr(0, 3) + ":" + timezone.substr(3, 2);
  const dateTime = year + "-" + month + "-" + day + "T" + formattedTime + formattedZone;

  return ZonedDateTime.parse(dateTime);
}

const months: MonthIndex = {
  "JAN": "01",
  "FEB": "02",
  "MAR": "03",
  "APR": "04",
  "MAY": "05",
  "JUN": "06",
  "JUL": "07",
  "AUG": "08",
  "SEP": "09",
  "OCT": "10",
  "NOV": "11",
  "DEC": "12"
};

interface MonthIndex {
  [month: string]: string;
}