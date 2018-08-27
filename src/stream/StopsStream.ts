import {Transform, TransformCallback} from "stream";

/**
 * Extract the stops from the SCR entries
 */
export class StopsStream extends Transform {
  private stopsSeen: StopsIndex = {};

  /**
   * Transform and emit the stop if it hasn't been seen before
   */
  public _transform(chunk: any, encoding: string, callback: TransformCallback): void {
    if (this.stopsSeen[chunk]) {
      callback();
    }
    else {
      this.stopsSeen[chunk] = chunk;

      callback(undefined, chunk);
    }
  };
}

interface StopsIndex {
  [stopId: string]: string;
}