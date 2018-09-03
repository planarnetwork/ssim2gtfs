import {Transform, TransformCallback} from "stream";
import {DayOfWeek, Duration, LocalDate, ZonedDateTime, ZoneId} from "js-joda";

/**
 * Transform the input text stream into a stream of FlightSchedules
 */
export class SSIMStream extends Transform {

  private static readonly MONTHS: MonthIndex = {
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

  private firstDateOfSeason: string = "00XXX00";
  private lastDateOfSeason: string = "00XXX00";

  /**
   * If the line is a record type 3, convert it to a FlightSchedule
   */
  public _transform(chunk: string, encoding: string, callback: TransformCallback): void {
    if (chunk.charAt(0) === RecordType.FeedInfo) {
      this.setSeason(chunk.substr(10, 1), chunk.substr(11, 2));

      callback();
    }
    else if (chunk.charAt(0) === RecordType.FlightSchedule) {
      callback(undefined, this.getSchedule(chunk));
    }
    else {
      callback();
    }
  }

  /**
   * Set the first and last date of the season.
   *
   * For the Summer season the first date will be the last Sunday in March and the last date will be the last Sunday in
   * October of the year given.
   *
   * For the Winter season the first date will be the last Sunday in October and the last date will be the last Sunday
   * in March of the next year.
   */
  private setSeason(season: string, year: string): void {
    const summerStartDate = this.findSunday(LocalDate.parse("20" + year + "-03-31"));
    const winterStartDate = this.findSunday(LocalDate.parse("20" + year + "-10-31"));
    const summerStart = summerStartDate.toString().substr(8, 2)+ "MAR";
    const winterStart = winterStartDate.toString().substr(8, 2)+ "OCT";

    if (season === Season.Summer) {
      this.firstDateOfSeason = summerStart + year;
      this.lastDateOfSeason = winterStart + year;
    }
    else {
      this.firstDateOfSeason = winterStart + year;
      this.lastDateOfSeason = summerStart + summerStartDate.plusYears(1).toString().substr(2, 2);
    }
  }

  /**
   * Recursively work backwards until we find a Sunday
   */
  private findSunday(localDate: LocalDate): LocalDate {
    return localDate.dayOfWeek() === DayOfWeek.SUNDAY ? localDate : localDate.minusDays(1);
  }

  /**
   * Extract the schedule from the line
   */
  private getSchedule(line: string): FlightSchedule {
    const startDateTime = this.getStartDateTime(line);
    const startDate = startDateTime.withZoneSameInstant(ZoneId.UTC).toLocalDate();
    const endDate = this.getEndDateTime(line).withZoneSameInstant(ZoneId.UTC).toLocalDate();
    const departureTime = startDateTime.withZoneSameInstant(ZoneId.UTC).toLocalTime();
    const arrivalTime = this.getArrivalTime(line, startDateTime);
    const days = this.getDays(line.substr(28, 7), startDateTime);

    return {
      "operator": line.substr(2, 2),
      "flightNumber": line.substr(6, 4),
      "variation": line.substr(10, 2),
      "leg": line.substr(12, 1),
      "startDate": startDate.toString(),
      "endDate": endDate.toString(),
      "days": days,
      "origin": line.substr(36, 3),
      "departureTime": departureTime.toString(),
      "destination": line.substr(54, 3),
      "arrivalTime": arrivalTime,
    };
  }

  private getStartDateTime(line: string): ZonedDateTime {
    const startDate = line.substr(14, 7);
    const actualStartDate = startDate === "00XXX00" ? this.firstDateOfSeason : startDate;

    return this.parseDateTime(actualStartDate, line.substr(39, 4), line.substr(47, 5));
  }

  private getEndDateTime(line: string): ZonedDateTime {
    const endDate = line.substr(21, 7);
    const actualEndDate = endDate === "00XXX00" ? this.lastDateOfSeason : endDate;

    return this.parseDateTime(actualEndDate, line.substr(39, 4), line.substr(47, 5));
  }

  private getArrivalTime(line: string, departureTime: ZonedDateTime): string {
    const arrivalDateTime = this.getArrivalDateTime(line).withZoneSameInstant(ZoneId.UTC);
    const departureDate = departureTime.withZoneSameInstant(ZoneId.UTC).toLocalDate();
    const adjustedArrivalTime = arrivalDateTime.isAfter(departureTime) ? arrivalDateTime : arrivalDateTime.plusDays(1);
    const arrivalTime = Duration.between(departureDate.atStartOfDayWithZone(ZoneId.UTC), adjustedArrivalTime);
    const arrivalHour = arrivalTime.toHours().toString().padStart(2, "0");
    const arrivalMinute = (arrivalTime.toMinutes() % 60).toString().padStart(2, "0");

    return arrivalHour + ":" + arrivalMinute;
  }

  private getArrivalDateTime(line: string): ZonedDateTime {
    const arrivalDate = line.substr(14, 7);
    const actualArrivalDate = arrivalDate === "00XXX00" ? this.firstDateOfSeason : arrivalDate;

    return this.parseDateTime(actualArrivalDate, line.substr(57, 4), line.substr(65, 5));
  }

  /**
   * Create a timezoned date
   */
  private parseDateTime(date: string, time: string, timezone: string): ZonedDateTime {
    const day = date.substr(0, 2);
    const month = SSIMStream.MONTHS[date.substr(2, 3)];
    const year = "20" + date.substr(5, 2);
    const formattedTime = time.substr(0, 2) + ":" + time.substr(2, 2) + ":00";
    const formattedZone = timezone.substr(0, 3) + ":" + timezone.substr(3, 2);
    const dateTime = year + "-" + month + "-" + day + "T" + formattedTime + formattedZone;

    return ZonedDateTime.parse(dateTime);
  }

  /**
   * Extract the days of the week to an array of integers [0,1,1,0,0,1,1] (0 = Monday).
   *
   * If the conversion from local time to UTC has affected the date perform a binary rotate to adjust the days.
   */
  private getDays(days: string, startDate: ZonedDateTime): number[] {
    const arr = days.split("").map(day => day === " " ? 0 : 1);
    const timezoneDate = startDate.withZoneSameInstant(ZoneId.UTC).toLocalDate();
    const localDate = startDate.withZoneSameLocal(ZoneId.UTC).toLocalDate();

    // if the UTC date is has moved to the next day, adjust the dates
    if (timezoneDate.isAfter(localDate)) {
      return [arr[6], ...arr.slice(0, 6)];
    }
    else if (timezoneDate.isBefore(localDate)) {
      return [...arr.slice(1, 7), arr[0]];
    }
    else {
      return arr;
    }
  }

}

enum RecordType {
  Header = "1",
  FeedInfo = "2",
  FlightSchedule = "3"
}

enum Season {
  Summer = "S",
  Winter = "W"
}

export interface FlightSchedule {
  "operator": string;
  "flightNumber": string;
  "variation": string;
  "leg": string;
  "startDate": string;
  "endDate": string;
  "days": number[];
  "origin": string;
  "departureTime": string;
  "destination": string;
  "arrivalTime": string;
}

interface MonthIndex {
  [month: string]: string;
}
