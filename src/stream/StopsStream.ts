import {Transform, TransformCallback} from "stream";

/**
 * Extract the stops from the SCR entries
 */
export function createStopsStream(): Transform {
  const stopsSeen: StopsIndex = {};

  const transform = (chunk: any, encoding: string, callback: TransformCallback): void => {
    if (stopsSeen[chunk]) {
      callback();
    }
    else {
      stopsSeen[chunk] = chunk;

      callback(undefined, chunk);
    }
  };

  return new Transform({ transform });
}

interface StopsIndex {
  [stopId: string]: string;
}