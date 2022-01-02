/**
 * Angular imports.
 */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

/**
 * Agora rtc sdk imports.
 */
import { UID } from 'agora-rtc-sdk-ng';

/**
 * Model imports.
 */
import { RemoteStream } from '../models/remoteStream';

/**
 * Show the active People list.
 */
@Component({
  selector: 'app-people-list',
  templateUrl: './people-list.component.html',
  styleUrls: ['./people-list.component.scss']
})
export class PeopleListComponent {

  /**
   * Receive the people list and local user details.
   */
  @Input() peopleList: { [name: number]: RemoteStream } = {};
  @Input() localUser!: { uid: UID | undefined; level: number; isAudio: boolean; userName: string };

  /**
   * Emit close list flag and peer to peer message.
   */
  @Output() emitCloseList = new EventEmitter<boolean>();
  @Output() emitSendMessageToPeer = new EventEmitter<{ message: string; peerId: string; }>();
  @Output() emitPinKey = new EventEmitter<string>();

  /**
   * Emit close list flag.
   */
  closeList(): void {
    this.emitCloseList.emit(false);
  }

  /**
   * Emit mute-audio remote user.
   */
  muteRemoteUser(peerId: string): void {
    this.emitSendMessageToPeer.emit({ message: 'mute-audio', peerId: peerId });
  }

  /**
   * Emit leave channel remote user.
   */
  removeRemoteUser(peerId: string): void {
    console.log('removeRemoteUser', peerId);
    this.emitSendMessageToPeer.emit({ message: 'leave-channel', peerId: peerId });
  }

  /**
   * Track the indexed stream.
   */
  trackMe(index: any, stream: any): void {
    return index;
  }

  /**
   * Emit pin user key.
   */
  pinUser(pin: string): void {
    this.emitPinKey.emit(pin);
  }
}
