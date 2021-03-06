/**
 * Angular imports.
 */
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Model import.
 */
import { RemoteStream } from './remoteStream';

/**
 * Pipe to return the remote the screen share user only.
 */
@Pipe({
  name: 'withScreenShare',
  pure: false
})
export class WithScreenSharePipe implements PipeTransform {

  transform(remoteStreams: { [name: number]: RemoteStream }): { [name: number]: RemoteStream } {
    let streams: { [name: number]: RemoteStream } = {};
    const max = [0];
    for (const key in remoteStreams) {
      if (remoteStreams[key].isPresenting) {
        streams[key] = remoteStreams[key];
        max.push(remoteStreams[key].number);
      }
    }
    for (const key in streams) {
      if (streams[key]?.number === Math.max(...max)) {
        streams = {};
        streams[key] = remoteStreams[key];
      }
    }
    return streams;
  }
}
