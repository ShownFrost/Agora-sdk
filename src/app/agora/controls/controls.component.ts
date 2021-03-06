/**
 * Angular imports.
 */
import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';

/**
 * Rxjs imports.
 */
import { Subscription, timer } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Models import.
 */
import { localStream } from 'src/app/agora/models/localStream';

/**
 * All the controls of the streaming like
 * mute, camera, screenShare, Time, List etc.
 */
@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
})
export class ControlsComponent implements OnInit, OnDestroy {

  /**
   * Received the audio, camera, ScreenPresenting flag and
   * disableVideo flag which wait for the camera to open people list.
   */
  @Input() isScreenPresenting = false;
  @Input() disableVideo = false;
  @Input() peopleList = true;
  @Input() chatList = true;
  @Input() localStream!: localStream;
  /**
   * Emit the leave channel, audio, camera, ScreenPresenting flag, people list.
   */
  @Output() emitLeaveChannel = new EventEmitter<boolean>();
  @Output() emitVideoChannel = new EventEmitter<boolean>();
  @Output() emitScreenShare = new EventEmitter<boolean>();
  @Output() emitStopScreenShare = new EventEmitter<boolean>();
  @Output() emitMuteVolume = new EventEmitter<boolean>();
  @Output() emitPeopleList = new EventEmitter<boolean>();
  @Output() emitChatList = new EventEmitter<boolean>();

  /**
   * Show the realtime clock.
   */
  public clock = new Date();

  /**
   * Subscription of time.
   */
  private timeSub!: Subscription;

  /**
   * Timer for the real time clock.
   */
  ngOnInit(): void {
    this.timeSub = timer(0, 1000)
      .pipe(
        map(() => new Date())
      )
      .subscribe(time => {
        this.clock = time;
      });
  }

  /**
   * Emit the leave channel, audio, camera, ScreenPresenting flag, people list.
   */
  leaveChannel(): void {
    this.emitLeaveChannel.emit(true);
  }
  videoChannel(): void {
    this.emitVideoChannel.emit(true);
  }
  screenShare(): void {
    this.emitScreenShare.emit(true);
  }
  stopScreenShare(): void {
    this.emitStopScreenShare.emit(true);
  }
  muteVolume(): void {
    this.emitMuteVolume.emit(true);
  }

  /**
   * Toggle the user list and emit the flag.
   */
  userList(): void {
    this.peopleList = !this.peopleList;
    this.chatList = false;
    this.emitChatList.emit(false);
    this.emitPeopleList.emit(this.peopleList);
  }

  /**
   * Toggle the user list and emit the flag.
   */
  groupChatList(): void {
    this.chatList = !this.chatList;
    this.peopleList = false;
    this.emitPeopleList.emit(false);
    this.emitChatList.emit(this.chatList);
  }

  /**
   * Unsubscribe the subscription.
   */
  ngOnDestroy(): void {
    if (this.timeSub) {
      this.timeSub.unsubscribe();
    }
  }
}
