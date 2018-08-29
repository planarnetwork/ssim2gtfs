import {Transform, TransformCallback} from "stream";
import {FlightSchedule} from "./SSIMStream";

/**
 * Extract the agencies from the FlightSchedule objects
 */
export class AgencyStream extends Transform {
  private agenciesSeen: AgencyIndex = {};
  private headerSent: boolean = false;

  /**
   * Transform and emit the agency if it hasn't been seen before
   */
  public _transform(schedule: FlightSchedule, encoding: string, callback: TransformCallback): void {
    const stops = this.getHeader() + this.getAgency(schedule.operator);

    callback(undefined, stops);
  }

  private getAgency(agencyId: string): string {
    if (this.agenciesSeen[agencyId]) {
      return "";
    }

    this.agenciesSeen[agencyId] = agencyId;

    return `${agencyId},${agencyId},http://agency.com,Europe/London,,en\n`;
  }

  private getHeader(): string {
    if (this.headerSent) {
      return "";
    }

    this.headerSent = true;

    return "agency_id,agency_name,agency_url,agency_timezone,agency_phone,agency_lang\n";
  }
}

interface AgencyIndex {
  [stopId: string]: string;
}