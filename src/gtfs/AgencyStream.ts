import {FlightSchedule} from "../ssim/SSIMStream";
import {GTFSFileStream} from "./GTFSFileStream";
import {TransformOptions} from "stream";
import {AirportIndex} from "../csv/AirportsCSV";
import {AirlinesIndex} from "../csv/AirlinesCSV";

/**
 * Extract the agencies from the FlightSchedule objects
 */
export class AgencyStream extends GTFSFileStream {
  private agenciesSeen: AgencyIndex = {};
  protected header = "agency_id,agency_name,agency_url,agency_timezone,agency_phone,agency_lang";

  constructor(opts: TransformOptions, private readonly airlines: AirlinesIndex) {
    super(opts);
  }

  protected getData(schedule: FlightSchedule): string {
    const agencyId = schedule.operator;

    if (this.agenciesSeen[agencyId]) {
      return "";
    }

    this.agenciesSeen[agencyId] = agencyId;
    const name = this.airlines[agencyId] ? this.airlines[agencyId].name : agencyId;

    return `${agencyId},${name},http://agency.com,Europe/London,,en\n`;
  }

}

interface AgencyIndex {
  [stopId: string]: string;
}