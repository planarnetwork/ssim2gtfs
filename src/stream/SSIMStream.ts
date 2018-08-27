import {Transform, TransformCallback} from "stream";

/**
 * Transform the input text stream into a stream of SCR entries
 */
export class SSIMStream extends Transform {

  /**
   * Pass on the line
   */
  public _transform(chunk: any, encoding: string, callback: TransformCallback): void {
    callback(undefined, chunk);
  }

}

