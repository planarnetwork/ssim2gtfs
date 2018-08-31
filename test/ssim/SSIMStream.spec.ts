import * as chai from "chai";
import {FlightSchedule, SSIMStream} from "../../src/ssim/SSIMStream";
import {Transform} from "stream";

describe("SSIMStream", () => {

  it("transforms a type 3 record to a FlightSchedule", async () => {
    const ssim = new SSIMStream({ objectMode: true });

    ssim.write("3 CA  1011501J26OCT0800XXX001234567 PEK08000800+08003 HKG11251125+08001 738CDIJYBMHKLQGSXVUZWTE     XX                 II                                        M                              00000073", "utf8");

    return awaitStream(ssim, (schedule: FlightSchedule) => {
      chai.expect(schedule.origin).to.equal("PEK");
      chai.expect(schedule.destination).to.equal("HKG");
      chai.expect(schedule.flightNumber).to.equal("1011");
      chai.expect(schedule.variation).to.equal("50");
      chai.expect(schedule.leg).to.equal("1");
      chai.expect(schedule.startDate).to.equal("2008-10-26");
      chai.expect(schedule.endDate).to.equal("00XXX00");
      chai.expect(schedule.days).to.equal("1234567");
      chai.expect(schedule.departureTime).to.equal("00:00");
    });
  });

  it("converts the departure date and time to utc", async () => {
    const ssim = new SSIMStream({ objectMode: true });

    ssim.write("3 CA  1011501J26OCT0800XXX001234567 PEK06000800+08003 HKG11251125+08001 738CDIJYBMHKLQGSXVUZWTE     XX                 II                                        M                              00000073", "utf8");

    return awaitStream(ssim, (schedule: FlightSchedule) => {
      chai.expect(schedule.departureTime).to.equal("00:00");
    });
  });

  xit("utc date conversion shifts days of the week forward one", () => {

  });

  xit("utc date conversion wraps days around (backwards)", () => {

  });

  xit("utc date conversion shifts days of the week back one", () => {

  });

  xit("utc date conversion wraps days around (forwards)", () => {

  });

  xit("utc date moves the start and end date forward", () => {

  });

  xit("utc date moves the start and end date backward", () => {

  });
});

function awaitStream<T>(stream: Transform, fn: StreamTest<T>) {
  return new Promise(resolve => {
    stream.on("data", (data: any) => {
      fn(data);
      resolve();
    });
  });
}

type StreamTest<T> = (data: T) => any;