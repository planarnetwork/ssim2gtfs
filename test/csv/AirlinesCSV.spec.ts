import * as chai from "chai";
import parse = require("csv-parse");
import {Readable} from "stream";
import {AirlinesCSV} from "../../src/csv/AirlinesCSV";

describe("AirlinesCSV", () => {

  it("parses the airlines CSV into an object", async () => {
    const file = new Readable({
      read() {
        this.push("BA,British Airways,United Kingdom\n");
        this.push(null);
      }
    });
    const airlines = new AirlinesCSV(parse(), file as any);
    const index = await airlines.getAirlinesIndex();

    chai.expect(index["BA"]).to.deep.equal({
      name: "British Airways",
      country: "United Kingdom"
    });
  });

});

