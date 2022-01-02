/**
 * Angular imports.
 */
import { Component, EventEmitter, Input, OnInit, Output, OnDestroy, HostListener } from '@angular/core';

/**
 * Agora rtc sdk imports.
 */
import { UID } from 'agora-rtc-sdk-ng';

/**
 * Model imports.
 */
import { RemoteStream } from '../models/remoteStream';

/**
 * Rxjs imports.
 */
import { fromEvent, Subscription } from 'rxjs';

/**
 * Show all the streaming of the local, screen share and remote users
 */
@Component({
  selector: 'app-streams',
  templateUrl: './streams.component.html',
  styleUrls: ['./streams.component.scss']
})
export class StreamsComponent implements OnInit, OnDestroy {

  /**
   * Received presenting, localUserId, remote stream,
   * localUserCamera, localUserAudio, localVolumeLevel
   */
  @Input() isPresenting = false;
  @Input() localUserUid: undefined | UID;
  @Input() remoteStreams: { [name: number]: RemoteStream } = {};
  @Input() localUserAudio = false;
  @Input() localVolumeLevel = 0;
  @Input() localUserName!: string;
  @Input() pinUser!: { status: boolean, key: number };

  /**
   * Fullscreen mode flag.
   */
  private fullscreenMode = false;

  /**
   * Subscription of fullscreen.
   */
  private fullscreenSub!: Subscription;

  /**
   * Initiate double tab event.
   */
  ngOnInit(): void {
    this.doubleTabEvent();
  }

  /**
   * Double tab event.
   */
  @HostListener('window:dblclick', ['$event'])
  fullscreenchange(): void {
    if (!this.fullscreenMode) {
      console.log('this.fullscreen');
      this.fullscreen();
    } else {
      this.closeFullscreen();
    }
  }

  /**
   * Double tab event.
   */
  doubleTabEvent(): void {
    const msFullscreenchange$ = fromEvent(document, 'msfullscreenchange');
    this.fullscreenSub = msFullscreenchange$.pipe()
      .subscribe(() => this.fullscreenMode = !this.fullscreenMode);
    const webkitfullscreenchange$ = fromEvent(document, 'webkitfullscreenchange');
    this.fullscreenSub = webkitfullscreenchange$.pipe()
      .subscribe(() => this.fullscreenMode = !this.fullscreenMode);
    const mozFullscreenchange$ = fromEvent(document, 'mozfullscreenchange');
    this.fullscreenSub = mozFullscreenchange$.pipe()
      .subscribe(() => this.fullscreenMode = !this.fullscreenMode);
    const fullscreenchange$ = fromEvent(document, 'fullscreenchange');
    this.fullscreenSub = fullscreenchange$.pipe()
      .subscribe(() => this.fullscreenMode = !this.fullscreenMode);
  }

  /**
   * Fullscreen the steam screen.
   */
  fullscreen(): void {
    const elem: HTMLElement | any = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
      elem.msRequestFullscreen();
    }
  }

  /**
   * Close fullscreen the steam screen.
   */
  closeFullscreen() {
    const elem: Document | any = document;
    if (elem.exitFullscreen) {
      elem.exitFullscreen();
    } else if (elem.webkitExitFullscreen) { /* Safari */
      elem.webkitExitFullscreen();
    } else if (elem.msExitFullscreen) { /* IE11 */
      elem.msExitFullscreen();
    }
  }

  /**
   * Track the indexed stream.
   */
  trackMe(index: any, stream: any): void {
    return stream ? stream.key : undefined;
  }

  /**
   * Unsubscribe the subscription.
   */
  ngOnDestroy(): void {
    if (this.fullscreenSub) {
      this.fullscreenSub.unsubscribe();
    }
  }

}
