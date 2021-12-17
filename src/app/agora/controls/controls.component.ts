import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
})
export class ControlsComponent {

  @Input() isJoined = false;

  @Input() audio = false;
  @Input() camera = false;

  @Input() isScreenPresenting = false;
  @Input() isPresenting = false;
  @Input() disableVideo = false;

  /**
   * Used to hide unsaved  Modal.
   */
  @Output() emitLeaveChannel = new EventEmitter<boolean>();
  @Output() emitVideoChannel = new EventEmitter<boolean>();
  @Output() emitScreenShare = new EventEmitter<boolean>();
  @Output() emitStopScreenShare = new EventEmitter<boolean>();
  @Output() emitMuteVolume = new EventEmitter<boolean>();

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
}
