/**
 * Angular imports.
 */
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

/**
 * agora rtc sdk imports.
 */
import { IAgoraRTCRemoteUser, UID } from "agora-rtc-sdk-ng"

/**
 * Rxjs imports.
 */
import { Subscription } from 'rxjs';

/**
 * Agora model imports.
 */
import { AgStream } from '../../agora/models/agStream';
import { RemoteStream } from '../../agora/models/remoteStream';

/**
 * Main component where Rtc client is create and ready to join.
 */
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

  /**
   * Receive the appId, channel and token of agora.
   */
  @Input() appId = '';
  @Input() channel = '';
  @Input() token = '';

  /**
   * Emit the redirect to credentials.
   */
  @Output() emitRedirectToCredentials = new EventEmitter<boolean>();

  /**
   * Subscription for remote info update, left, join, error, volume indicator.
   */
  private userInfoUpdatedSub!: Subscription;
  private userLeftSub!: Subscription;
  private userJoinedSub!: Subscription;
  private errorsSub!: Subscription;
  private volumeIndicatorSub!: Subscription;

  /**
   * setter and getter for presenting flag.
   */
  private _isPresenting = false;
  set isPresenting(val) {
    this._isPresenting = val;
  }
  get isPresenting(): boolean {
    return this._isPresenting;
  }

  /**
   * Public flag for client and close people list
   * ScreenShare client,, remote stream, toaster msg, leave flag.
   */
  public client!: AgStream;
  public closePeopleList = false;
  public screenShareClient!: AgStream;
  public remoteStreams: { [name: number]: RemoteStream } = {};
  public toasterMsg = '';
  public leave = false;

  /**
   * Create the agora client and initiate the listeners event.
   */
  ngOnInit(): void {
    this.client = new AgStream(this.appId, this.channel, this.token, false);
    this.internalEventListener();
  }

  /**
   * Listeners event like remote info update, left, join, error, volume indicator.
   */
  private internalEventListener(): void {
    this.userJoinedSub = this.client.userJoined.subscribe((user: IAgoraRTCRemoteUser) => {
      console.log('userJoinedSub', user);
      const uid = Number(user.uid);
      this.toasterMsg = uid.toString() + ' is joined the call';;
      if (uid === 1) {
        this.toasterMsg = uid.toString() + ' start Presenting the screen';
        this.remoteStreams[uid] = new RemoteStream(uid, true, user.hasAudio, user.hasVideo, 0);
        this.isPresenting = true;
      } else {
        this.remoteStreams[uid] = new RemoteStream(uid, false, true, true, 0);
      }
    })
    this.userLeftSub = this.client.userLeft.subscribe((res: { user: IAgoraRTCRemoteUser; reason: string; }) => {
      console.log('userLeft', res);
      const id = Number(res.user.uid);
      this.toasterMsg = id.toString() + ' is left the call';
      if (this.remoteStreams.hasOwnProperty(id)) {
        if (id === 1) {
          this.isPresenting = false;
          this.toasterMsg = id.toString() + ' stop presenting the screen';
        }
        delete this.remoteStreams[id];
      }
    })
    this.userInfoUpdatedSub = this.client.userInfoUpdated.subscribe((res: { uid: UID, msg: string }) => {
      console.log('userInfoUpdated', res);
      const id = Number(res.uid);
      if (this.remoteStreams.hasOwnProperty(id)) {
        switch (res.msg) {
          case 'mute-audio':
            this.remoteStreams[id].isAudio = false;
            break;
          case 'unmute-audio':
            this.remoteStreams[id].isAudio = true;
            break;
          default:
            break;
        }
      }
    });
    this.volumeIndicatorSub = this.client.volumeIndicator.subscribe((res: { level: number; uid: UID; }[]) => {
      console.log('res::::::::::', res);
      this.client.localVolumeLevel = 1;
      for (const [key, value] of Object.entries(this.remoteStreams)) {
        this.remoteStreams[Number(key)].volume = 1;
      }
      for (const user of res) {
        if (this.client.rtcClient.uid === user.uid) {
          this.client.localVolumeLevel = user.level;
        }
        if (this.remoteStreams.hasOwnProperty(Number(user.uid))) {
          this.remoteStreams[Number(user.uid)].volume = user.level;
        }
      }
    })
    this.errorsSub = this.client.errors.subscribe(async (res: { code: string | number; msg: string; }) => {
      switch (res.code) {
        case 'CAN_NOT_GET_GATEWAY_SERVER':
          this.toasterMsg = res.msg;
          await this.leaveChannel();
          break;
        default:
          break;
      }
    })
  }

  /**
   * Join the the created channel initially.
   */
  async joinChannel(event: { camera: boolean, audio: boolean }): Promise<void> {
    await this.client.joinChannel(this.appId, this.channel, this.token, event.audio, event.camera);
  }

  /**
   * Leave the chanel.
   */
  async leaveChannel(): Promise<void> {
    if (this.screenShareClient && this.screenShareClient.isScreenPresenting === true) {
      await this.stopScreenShare();
    }
    this.remoteStreams = {};
    await this.client.leaveCall();
    this.isPresenting = false;
    this.leave = true;
  }

  /**
   * Toggle the mic and camera of local client.
   */
  muteVolume(): void {
    this.client.audio = !this.client.audio;
  }
  videoChannel(): void {
    this.client.camera = !this.client.camera;
  }

  /**
   * Stop the ScreenShare of local client.
   */
  async stopScreenShare(): Promise<void> {
    await this.screenShareClient.stopScreenSharing();
  }

  /**
   * Create the new client fo the screen share and join the same channel.
   */
  async screenShare(): Promise<void> {
    this.screenShareClient = new AgStream(this.appId, this.channel, this.token, true);
    await this.screenShareClient.joinScreenShareChannel(this.appId, this.channel, this.token);
  }

  /**
   * Emit the redirect to credentials.
   */
  redirectToCredentials(): void {
    this.emitRedirectToCredentials.emit(true);
  }

  /**
   * Unsubscribe the subscription.
   */
  ngOnDestroy(): void {
    if (this.userInfoUpdatedSub) {
      this.userInfoUpdatedSub.unsubscribe();
    }
    if (this.userLeftSub) {
      this.userLeftSub.unsubscribe();
    }
    if (this.userJoinedSub) {
      this.userJoinedSub.unsubscribe();
    }
    if (this.volumeIndicatorSub) {
      this.volumeIndicatorSub.unsubscribe();
    }
    if (this.errorsSub) {
      this.errorsSub.unsubscribe();
    }
  }
}
