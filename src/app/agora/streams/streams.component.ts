import { UID } from 'agora-rtc-sdk-ng';
import { Component, Input, OnInit } from '@angular/core';
import { RemoteStream } from '../models/remoteStream';

@Component({
  selector: 'app-streams',
  templateUrl: './streams.component.html',
  styleUrls: ['./streams.component.scss']
})
export class StreamsComponent {

  @Input() isPresenting = false;

  @Input() localUserUid: undefined | UID;

  @Input() remoteStreams: { [name: number]: RemoteStream } = {};
  @Input() localUserCamera = false;
  @Input() localUserAudio = false;

  @Input() localVolumeLevel = 0;

  /**
   * Track the indexed stream.
   */
  trackMe(index: any, stream: any): void {
    return stream ? stream.key : undefined;
  }

}
