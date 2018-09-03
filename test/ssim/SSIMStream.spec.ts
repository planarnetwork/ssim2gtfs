import * as chai from "chai";
import {FlightSchedule, SSIMStream} from "../../src/ssim/SSIMStream";
import {Transform} from "stream";

describe("SSIMStream", () => {

  it("transforms a type 3 record to a FlightSchedule", async () => {
    const ssim = new SSIMStream({ objectMode: true });

    ssim.write("3 CA  1011501J26OCT0826OCT091234567 PEK08000800+08003 HKG11251125+08001 738CDIJYBMHKLQGSXVUZWTE     XX                 II                                        M                              00000073", "utf8");

    return awaitStream(ssim, (schedule: FlightSchedule) => {
      chai.expect(schedule.origin).to.equal("PEK");
      chai.expect(schedule.destination).to.equal("HKG");
      chai.expect(schedule.flightNumber).to.equal("1011");
      chai.expect(schedule.variation).to.equal("50");
      chai.expect(schedule.leg).to.equal("1");
      chai.expect(schedule.startDate).to.equal("2008-10-26");
      chai.expect(schedule.endDate).to.equal("2009-10-26");
      chai.expect(schedule.days).to.deep.equal([1, 1, 1, 1, 1, 1, 1]);
      chai.expect(schedule.departureTime).to.equal("00:00");
      chai.expect(schedule.arrivalTime).to.equal("03:25");
    });
  });

  it("converts the start date, end date and departure time to utc", async () => {
    const ssim = new SSIMStream({ objectMode: true });

    ssim.write("3 CA  1011501J26OCT0826OCT091234567 PEK06000800+08003 HKG11251125+08001 738CDIJYBMHKLQGSXVUZWTE     XX                 II                                        M                              00000073", "utf8");

    return awaitStream(ssim, (schedule: FlightSchedule) => {
      chai.expect(schedule.departureTime).to.equal("22:00");
      chai.expect(schedule.startDate).to.equal("2008-10-25");
    });
  });

  it("utc date conversion shifts days of the week forward one", () => {
    const ssim = new SSIMStream({ objectMode: true });

    ssim.write("3 CA  1011501J31AUG1826OCT09    567 ___22002200-08003 HKG11251125+08001 738CDIJYBMHKLQGSXVUZWTE     XX                 II                                        M                              00000073", "utf8");

    return awaitStream(ssim, (schedule: FlightSchedule) => {
      chai.expect(schedule.departureTime).to.equal("06:00");
      chai.expect(schedule.startDate).to.equal("2018-09-01");
      chai.expect(schedule.days).to.deep.equal([1, 0, 0, 0, 0, 1, 1]);
    });
  });

  it("utc date conversion shifts days of the week back one", () => {
    const ssim = new SSIMStream({ objectMode: true });

    ssim.write("3 CA  1011501J31AUG1826OCT09123     ___06000600+08003 HKG11251125+08001 738CDIJYBMHKLQGSXVUZWTE     XX                 II                                        M                              00000073", "utf8");

    return awaitStream(ssim, (schedule: FlightSchedule) => {
      chai.expect(schedule.departureTime).to.equal("22:00");
      chai.expect(schedule.startDate).to.equal("2018-08-30");
      chai.expect(schedule.days).to.deep.equal([1, 1, 0, 0, 0, 0, 1]);
    });
  });

  it("sets end of season dates", () => {
    const ssim = new SSIMStream({ objectMode: true });

    ssim.write("2LCA R0008S08 07MAY0800XXX0007MAY08OAG SSIM PRODUCT             18MAY08C                                                                                                                    EN1937000002");
    ssim.write("3 CA  1011501J26AUG0800XXX001234567 PEK08000800+08003 HKG11251125+08001 738CDIJYBMHKLQGSXVUZWTE     XX                 II                                        M                              00000073", "utf8");

    return awaitStream(ssim, (schedule: FlightSchedule) => {
      chai.expect(schedule.startDate).to.equal("2008-08-26");
      chai.expect(schedule.endDate).to.equal("2008-10-30");
    });
  });

  it("ensures the end of season is always after the start", () => {
    const ssim = new SSIMStream({ objectMode: true });

    ssim.write("2LCA R0008W08 07MAY0800XXX0007MAY08OAG SSIM PRODUCT             18MAY08C                                                                                                                    EN1937000002");
    ssim.write("3 CA  1011501J00XXX0000XXX001234567 PEK08000800+08003 HKG11251125+08001 738CDIJYBMHKLQGSXVUZWTE     XX                 II                                        M                              00000073", "utf8");

    return awaitStream(ssim, (schedule: FlightSchedule) => {
      chai.expect(schedule.startDate).to.equal("2008-10-30");
      chai.expect(schedule.endDate).to.equal("2009-03-30");
    });
  });

  it("converts arrival time to  >24 hour clock", () => {
    const ssim = new SSIMStream({ objectMode: true });

    ssim.write("3 CA  1011501J26OCT0826OCT081234567 ___22002200+00003 ___04000400+00001 738CDIJYBMHKLQGSXVUZWTE     XX                 II                                        M                              00000073", "utf8");

    return awaitStream(ssim, (schedule: FlightSchedule) => {
      chai.expect(schedule.departureTime).to.equal("22:00");
      chai.expect(schedule.arrivalTime).to.equal("28:00");
    });
  });

  xit("dates apply to scheduled departure time, not passenger departure time", () => {
    const ssim = new SSIMStream({ objectMode: true });

    ssim.write("3 CA  1011501J26OCT0826OCT081234567 ___22001100-08003 ___04000400+00001 738CDIJYBMHKLQGSXVUZWTE     XX                 II                                        M                              00000073", "utf8");

    return awaitStream(ssim, (schedule: FlightSchedule) => {
      chai.expect(schedule.departureTime).to.equal("22:00");
      chai.expect(schedule.arrivalTime).to.equal("28:00");
    });
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