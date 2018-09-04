import * as chai from "chai";
import parse = require("csv-parse");
import {Readable} from "stream";
import {AirportsCSV} from "../../src/csv/AirportsCSV";

describe("AirportsCSV", () => {

  it("parses the airports CSV into an object", async () => {
    const file = new Readable({
      read() {
        this.push("LHR,London Heathrow Airport,51.4706,-0.461941,http://www.heathrowairport.com/\n");
        this.push(null);
      }
    });
    const airports = new AirportsCSV(parse(), file as any);
    const index = await airports.getAirportIndex();

    chai.expect(index["LHR"]).to.deep.equal({
      name: "London Heathrow Airport",
      lat: "51.4706",
      lng: "-0.461941",
      url: "http://www.heathrowairport.com/"
    });
  });

});

