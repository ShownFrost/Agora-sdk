import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IAgoraRTCRemoteUser, UID } from "agora-rtc-sdk-ng"
import { Subscription } from 'rxjs';
import { AgStream } from '../../agora/models/agStream';
import { RemoteStream } from '../../agora/models/remoteStream';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

  @Input() appId = '';
  // Set the channel name.
  @Input() channel = '';
  // Pass a token if your project enables the App Certificate.
  @Input() token = '';

  @Input() preAudio = false;

  @Input() preVideo = false;

  @Output() emitRedirectToCredentials = new EventEmitter<boolean>();

  public client!: AgStream;

  public screenShareClient!: AgStream;

  public remoteStreams: { [name: number]: RemoteStream } = {};
  private userInfoUpdatedSub!: Subscription;
  private userLeftSub!: Subscription;
  private userJoinedSub!: Subscription;
  private _isPresenting = false;
  private errorsSub!: Subscription;
  private volumeIndicatorSub!: Subscription;
  public leave = false;
  set isPresenting(val) {
    this._isPresenting = val;
  }
  get isPresenting(): boolean {
    return this._isPresenting;
  }

  ngOnInit(): void {
    this.client = new AgStream(this.appId, this.channel, this.token, false, this.preAudio, this.preVideo);
    console.log('client', this.client);
    this.internalEventListener();
  }


  internalEventListener(): void {
    this.userJoinedSub = this.client.userJoined.subscribe((user: IAgoraRTCRemoteUser) => {
      console.log('userJoinedSub', user);
      const uid = Number(user.uid);
      if (uid === 1) {
        console.log('yes');
        console.log('user.hasAudio, user.hasVideo', user.hasAudio, user.hasVideo, user.audioTrack);
        this.remoteStreams[uid] = new RemoteStream(uid, true, user.hasAudio, user.hasVideo, 0);
        this.isPresenting = true;
      } else {
        console.log('not');
        console.log('user.hasAudio, user.hasVideo', user.hasAudio, user.hasVideo, user.audioTrack);
        this.remoteStreams[uid] = new RemoteStream(uid, false, true, true, 0);
        console.log('userJoinedSub2', user);
      }
    })
    this.userLeftSub = this.client.userLeft.subscribe((res: { user: IAgoraRTCRemoteUser; reason: string; }) => {
      console.log('userLeft', res);
      const id = Number(res.user.uid);
      if (this.remoteStreams.hasOwnProperty(id)) {
        if (id === 1) {
          this.isPresenting = false;
        }
        delete this.remoteStreams[id];
      }
      console.log(this.remoteStreams);
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
          console.log('inside::::::::::', user.level);
          this.remoteStreams[Number(user.uid)].volume = user.level;
        }
      }
    })
    this.errorsSub = this.client.errors.subscribe(async (res: { code: string | number; msg: string; }) => {
      console.log("PERMISSION_DENIED", res);
      switch (res.code) {
        case 'CAN_NOT_GET_GATEWAY_SERVER':
          console.log('calling');
          await this.leaveChannel();
          break;
        default:
          break;
      }
    })
  }

  async joinChannel(event: { camera: boolean, audio: boolean }): Promise<void> {
    console.log('joinChannel event', event);

    await this.client.joinChannel(this.appId, this.channel, this.token, event.audio, event.camera);
  }

  async leaveChannel(): Promise<void> {
    if (this.screenShareClient && this.screenShareClient.isScreenPresenting === true) {
      await this.stopScreenShare();
    }
    this.remoteStreams = {};
    await this.client.leaveCall();
    this.isPresenting = false;
    this.leave = true;
  }

  muteVolume(): void {
    this.client.audio = !this.client.audio;
  }

  async stopScreenShare(): Promise<void> {
    await this.screenShareClient.stopScreenSharing();
  }

  async screenShare(): Promise<void> {
    this.screenShareClient = new AgStream(this.appId, this.channel, this.token, true, false, false);
    await this.screenShareClient.joinScreenShareChannel(this.appId, this.channel, this.token);
  }

  videoChannel(): void {
    this.client.camera = !this.client.camera;
  }

  redirectToCredentials(): void {
    this.emitRedirectToCredentials.emit(true);
  }


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
