import {Transform, TransformCallback} from "stream";

/**
 * Transform the input text stream into a stream of SCR entries
 */
export function createSSIMStream(): Transform {

  return new Transform({
    transform: (chunk: any, encoding: string, callback: TransformCallback): void => {
      callback(undefined, chunk);
    }
  });
}

