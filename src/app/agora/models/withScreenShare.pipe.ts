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
    const streams: { [name: number]: RemoteStream } = {};
    for (const key in remoteStreams) {
      if (remoteStreams[key].isPresenting) {
        streams[key] = remoteStreams[key];
      }
    }
    return streams;
  }
}
