/**
 * Angular imports.
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * agora rtc sdk imports.
 */
import { IAgoraRTCRemoteUser, NetworkQuality, UID } from "agora-rtc-sdk-ng"

/**
 * Rxjs imports.
 */
import { defer, from, of, Subscription } from 'rxjs';
import { delay, retry } from 'rxjs/operators';

/**
 * Service imports.
 */
import { ApiService } from 'src/app/services/api/api.service';

/**
 * Agora model imports.
 */
import { AgStream } from '../../agora/models/agStream';
import { RemoteStream } from '../../agora/models/remoteStream';
import { WithScreenSharePipe } from '../models/withScreenShare.pipe';

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
   * The appId, channel, screenShareUid and token of agora.
   */
  private appId!: string;
  private channel!: string;
  // private screenShareUid!: number | string;
  private token = '';

  /**
   * Subscription for remote info update, left, join, error, volume indicator.
   * Screen share user id by default 10000.
   */
  private userInfoUpdatedSub!: Subscription;
  private userLeftSub!: Subscription;
  private userJoinedSub!: Subscription;
  private errorsSub!: Subscription;
  private volumeIndicatorSub!: Subscription;
  private networkQualitySub!: Subscription;
  private peerToPeerMsgSub!: Subscription;
  private playRemoteSub!: Subscription;
  private activateRouteSub!: Subscription;

  /**
   * setter and getter for presenting flag, pin user and username.
   */
  private _pinUserDetail = { status: false, key: 0 };
  get pinUserDetail(): { status: boolean, key: number } {
    return this._pinUserDetail;
  }
  set pinUserDetail(val) {
    this._pinUserDetail = val;
  }
  private _isPresenting = false;
  set isPresenting(val) {
    this._isPresenting = val;
  }
  get isPresenting(): boolean {
    return this._isPresenting;
  }
  private _username!: string;
  get username(): string {
    return this._username;
  }
  private _initials!: string;
  get initials(): string {
    return this._initials;
  }
  /**
   * Public flag for client and close people list
   * ScreenShare client,, remote stream, toaster msg, leave flag.
   */
  public client!: AgStream;
  public closePeopleList = false;
  public closeChatList = false;
  public screenShareClient!: AgStream;
  public remoteStreams: { [name: number]: RemoteStream } = {};
  public toasterMsg = '';
  public leave = false;

  /**
   * Create necessary instances.
   */
  constructor(private apiService: ApiService, private route: ActivatedRoute, private router: Router) { }

  /**
   * Create the agora client and initiate the listeners event.
   */
  ngOnInit(): void {
    this.activateRouteSub = this.route.params
      .subscribe((params) => {
        this.appId = params.id;
      });
    this.activateRouteSub = this.route.queryParams
      .subscribe((queryParams) => {
        this.channel = queryParams.cname;
      });
    this.client = new AgStream(this.appId, this.channel, this.token, false);
  }

  /**
   * Listeners event like remote info update, left, join, error, volume indicator.
   */
  private internalEventListener(): void {
    this.userJoinedSub = this.client.userJoined.pipe(delay(400))
      .subscribe(async (user: IAgoraRTCRemoteUser) => {
        console.log('userJoinedSub', user);
        const uid = Number(user.uid);
        defer(() => { return from(this.client.getUserAttribute(uid.toString())) }).pipe(
          retry(5),
        ).subscribe({
          next: (value: { name: string, isPresenting: string, number: string}) => {
            const name = value.name;
            this.toasterMsg = name + ' is joined the call';
            if (value.isPresenting === '1') {
              // this.screenShareUid = uid;
              this.toasterMsg = name + ' start Presenting the screen';
              this.remoteStreams[uid] = new RemoteStream(uid, name ? name : 'anonymous', true, user.hasAudio, user.hasVideo, 0, user, false, Number(value.number));
              this.isPresenting = true;
            } else {
              this.remoteStreams[uid] = new RemoteStream(uid, name ? name : 'anonymous', false, user.hasAudio, user.hasVideo, 0, user, false);
            }
          },
          error: (err: any) => {
            console.log('Joined error', err);
          }
        })
      });
    this.userLeftSub = this.client.userLeft.subscribe((res: { user: IAgoraRTCRemoteUser; reason: string; }) => {
      console.log('userLeft', res);
      const id = Number(res.user.uid);
      if (this.remoteStreams.hasOwnProperty(this.pinUserDetail.key) && this.pinUserDetail.status && this.pinUserDetail.key === id) {
        this.pinUserDetail = { status: false, key: 0 };
      }
      this.toasterMsg = this.remoteStreams[id].name + ' is left the call';
      if (this.remoteStreams.hasOwnProperty(id)) {
        if (this.remoteStreams[id].isPresenting) {
          this.isPresenting = false;
          this.toasterMsg = this.remoteStreams[id].name + ' stop presenting the screen';
        }
        delete this.remoteStreams[id];
      }
      for (const [key, value] of Object.entries(this.remoteStreams)) {
        if (this.remoteStreams[Number(key)].isPresenting) {
          this.isPresenting = true;
        }
        if (this.remoteStreams[Number(key)].stream.hasVideo) {
          const remoteVideoTrack = this.remoteStreams[Number(key)].stream?.videoTrack;
          this.playRemoteStream(remoteVideoTrack, Number(key));
        }
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
          case 'mute-video':
            this.remoteStreams[id].isVideo = false;
            break;
          case 'unmute-video':
            this.remoteStreams[id].isVideo = true;
            break;
          default:
            break;
        }
      }
    });
    this.volumeIndicatorSub = this.client.volumeIndicator.subscribe((res: { level: number; uid: UID; }[]) => {
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
      console.log('errorsSub', res);
      switch (res.code) {
        case 'CAN_NOT_GET_GATEWAY_SERVER':
          this.toasterMsg = res.msg;
          await this.leaveChannel();
          break;
        default:
          break;
      }
    })
    this.networkQualitySub = this.client.networkQuality.subscribe((stats: NetworkQuality) => {
      switch (stats.uplinkNetworkQuality || stats.downlinkNetworkQuality) {
        case 0:
          'The quality is unknown.';
          break;
        case 1:
          'The quality is excellent.';
          break;
        case 2:
          'The quality is good, but the bitrate is less than optimal.';
          break;
        case 3:
          'Users experience slightly impaired communication';
          break;
        case 4:
          this.toasterMsg = 'Users can communicate with each other, but not very smoothly.';
          break;
        case 5:
          this.toasterMsg = 'The quality is so poor that users can barely communicate.';
          break;
        case 6:
          this.toasterMsg = 'The network is disconnected and users cannot communicate.';
          break;
        default:
          break;
      }
    })
    this.peerToPeerMsgSub = this.client.peerToPeerMsg.subscribe((res: { text: string, messageType: string, sendPeerId: string }) => {
      switch (res.text) {
        case 'mute-audio':
          this.toasterMsg = 'Your Mic is off by ' + this.remoteStreams[Number(res.sendPeerId)].name;
          this.muteVolume();
          break;
        case 'leave-channel':
          this.toasterMsg = this.remoteStreams[Number(res.sendPeerId)].name + ' Removed you from the Meeting';
          this.leaveChannel();
          break;
        default:
          break;
      }
    })
  }

  /**
   * Join the the created channel initially.
   */
  async joinChannel(event: { camera: boolean; audio: boolean; userName: string }): Promise<void> {
    this._username = event.userName;
    this._initials = this.username.charAt(0).toUpperCase();
    await this.client.joinChannel(this.appId, this.channel, this.token, event.audio, event.camera, this.username);
    this.internalEventListener();
    this.apiService.appId = this.appId;
    this.apiService.cname = this.channel;
    this.apiService.uid = this.client.rtcClient.uid?.toString();
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
    this.router.navigate(['leave']);
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
  async joinShare(): Promise<void> {
    const withScreenSharePipe = new WithScreenSharePipe();
    const screenShareRemotes = withScreenSharePipe.transform(this.remoteStreams);
    const max = [0];
    for (const key in screenShareRemotes) {
      max.push(screenShareRemotes[key].number);
    }
    this.screenShareClient = new AgStream(this.appId, this.channel, this.token, true);
    await this.screenShareClient.joinScreenShareChannel(this.appId, this.channel, this.token, this.username, Math.max(...max) + 1);
  }

  /**
   * Create the screen track for sharing and publish it.
   */
  createScreenShareTrack() {
    this.screenShareClient.publishScreenTracks();
  }

  /**
   * Emit the group msg event.
   */
  sendMessage(event: { message: string; memberName: string; timestamp: number }): void {
    console.log('sendMessage', event);
    this.client.sendMessageToGroup(event);
  }

  /**
   * Emit the peer to peer msg event.
   */
  sendMessageToPeer(event: { message: string, peerId: string }): void {
    console.log('sendMessageToPeer', event.message);
    this.client.sendMessageToPeer(event.message, event.peerId);
  }

  /**
   * Emit the peer to peer msg event.
   */
  pinKey(pinKey: string): void {
    this.remoteStreams[Number(pinKey)].pin = !this.remoteStreams[Number(pinKey)].pin;
    this.pinUserDetail = { status: false, key: Number(pinKey) };
    if (this.remoteStreams[Number(pinKey)].pin) {
      if (this.remoteStreams[Number(pinKey)].stream.hasVideo) {
        const remoteVideoTrack = this.remoteStreams[Number(pinKey)].stream?.videoTrack;
        this.playRemoteStream(remoteVideoTrack, Number(pinKey));
      }
      this.pinUserDetail = { status: true, key: Number(pinKey) };
      for (const [key, value] of Object.entries(this.remoteStreams)) {
        if (pinKey != key) {
          this.remoteStreams[Number(key)].pin = false;
        }
      }
    } else {
      for (const [key, value] of Object.entries(this.remoteStreams)) {
        if (this.remoteStreams[Number(key)].stream.hasVideo) {
          const remoteVideoTrack = this.remoteStreams[Number(key)].stream?.videoTrack;
          this.playRemoteStream(remoteVideoTrack, Number(key));
        }
      }
    }
  }

  /**
   * Play remote streams in case of user left while it was pinned.
   */
  playRemoteStream(remoteVideoTrack: any, key: number): void {
    this.playRemoteSub = of(remoteVideoTrack).pipe(delay(100))
      .subscribe(remoteVideoTrack => {
        remoteVideoTrack?.play("remote_stream_" + this.remoteStreams[key].stream.uid);
      });
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
    if (this.networkQualitySub) {
      this.networkQualitySub.unsubscribe();
    }
    if (this.peerToPeerMsgSub) {
      this.peerToPeerMsgSub.unsubscribe();
    }
    if (this.playRemoteSub) {
      this.playRemoteSub.unsubscribe();
    }
    if (this.activateRouteSub) {
      this.activateRouteSub.unsubscribe();
    }
  }
}
