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
  @Input() localUser!: { uid: UID | undefined; level: number; isAudio: boolean; };

  /**
   * Emit close list flag.
   */
  @Output() emitCloseList = new EventEmitter<boolean>();

  /**
   * Emit close list flag.
   */
  closeList(): void {
    this.emitCloseList.emit(false);
  }

}
