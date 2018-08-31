import {FlightSchedule} from "../ssim/SSIMStream";
import {GTFSFileStream} from "./GTFSFileStream";

/**
 * Extract the agencies from the FlightSchedule objects
 */
export class AgencyStream extends GTFSFileStream {
  private agenciesSeen: AgencyIndex = {};
  protected header = "agency_id,agency_name,agency_url,agency_timezone,agency_phone,agency_lang";

  protected getData(schedule: FlightSchedule): string {
    const agencyId = schedule.operator;

    if (this.agenciesSeen[agencyId]) {
      return "";
    }

    this.agenciesSeen[agencyId] = agencyId;

    return `${agencyId},${agencyId},http://agency.com,Europe/London,,en\n`;
  }

}

interface AgencyIndex {
  [stopId: string]: string;
}