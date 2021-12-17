import AgoraRTC, { ConnectionDisconnectedReason, ConnectionState, IAgoraRTCClient, IAgoraRTCRemoteUser, ICameraVideoTrack, ILocalAudioTrack, ILocalVideoTrack, IMicrophoneAudioTrack, NetworkQuality, RemoteStreamType, UID } from "agora-rtc-sdk-ng";
import { from, fromEvent, ReplaySubject } from "rxjs";


export class AgStream {
  private appId: string;
  private channel: string;
  private token: string;
  private _isScreenPresenting: boolean = false;

  private localAudioTrack!: IMicrophoneAudioTrack;
  private localVideoTrack!: ICameraVideoTrack;

  private uid: any;

  private _camera: boolean = true;

  private _localVolumeLevel = 0;

  private _audio: boolean = true;
  private screenShareUid!: number | string;
  private localScreenTrack!: any;

  public rtcClient!: IAgoraRTCClient;
  public loading: boolean = false;
  public isJoined: boolean = false;
  rtmClient: any;
  disableVideo: boolean = false;

  /**
   * Contains details of all the streams
   */
  // public remoteStreams: { [name: string]: any } = {};

  get isScreenPresenting(): boolean {
    return this._isScreenPresenting;
  }

  set isScreenPresenting(val: boolean) {
    this._isScreenPresenting = val;
  }

  get localVolumeLevel(): number {
    return this._localVolumeLevel;
  }

  set localVolumeLevel(val: number) {
    this._localVolumeLevel = val;
  }

  get camera(): boolean {
    return this._camera;
  }

  get audio(): boolean {
    return this._audio;
  }

  set camera(val: boolean) {
    console.log('val', val,);
    if (!val) {
      this.disableVideo = true;
      this.publishLocalVideoTracks();
    } else {
      if (this.localVideoTrack) {
        this.rtcClient.unpublish(this.localVideoTrack)
        this.localVideoTrack.close();
        this._camera = val;
      }
    }
  }

  set audio(val: boolean) {
    if (!val) {
      this.publishLocalAudioTracks();
    } else {
      if (this.localAudioTrack) {
        this.rtcClient.unpublish(this.localAudioTrack);
        this.localAudioTrack.close();
        this._audio = val;
      }
    }
  }

  public userJoined = new ReplaySubject<IAgoraRTCRemoteUser>();
  public userInfoUpdated = new ReplaySubject<{ uid: UID, msg: string }>();
  public networkQuality = new ReplaySubject<NetworkQuality>();
  public volumeIndicator = new ReplaySubject<{ level: number; uid: UID; }[]>();
  public userLeft = new ReplaySubject<{ user: IAgoraRTCRemoteUser, reason: string }>();
  public trackEnded = new ReplaySubject<string>();
  public errors = new ReplaySubject<{ code: number | string; msg: string }>();

  /**
   * Rtm clent detail.
   */
  private rtmClientDetail!: any;

  constructor(appId: string, channel: string, token: string, isScreenPresenting: boolean, audio: boolean, camera: boolean) {
    this.appId = appId;
    this.channel = channel;
    this.token = token;
    this.isScreenPresenting = isScreenPresenting;
    this.rtcClient = this.createLocalClient();
    console.log('this.isScreenPresenting:::::::::::::::::::::::', this.isScreenPresenting);

    if (!isScreenPresenting) {
      this.userPublish();
    }
    this.connectionState();
    // this.joinChannel(appId, channel, token, audio, camera);
  }

  private createLocalClient(): IAgoraRTCClient {
    return AgoraRTC.createClient({ mode: "rtc", codec: "h264" });
  }

  async joinChannel(appId: string, channel: string, token: string, audio: boolean, camera: boolean) {
    this.loading = true;
    await this.rtcClient.join(appId, channel, token, null)
      .then(async (value: UID) => {
        this.uid = value;
        this.isJoined = true;
        this.rtcClient.enableAudioVolumeIndicator();
        console.log('audio camera', audio, camera);

        if (audio) {
          await this.publishLocalAudioTracks();
        }
        if (camera) {
          await this.publishLocalVideoTracks();
        }
        // this.publishLocalTracks();
        console.log('this.uid', this.uid);
      })
      .catch((res: any) => {
        console.log('reason:::::::::::::::::', res);
        this.errors.next({ code: res.code, msg: res.message });
        return;
      });
  }

  async joinScreenShareChannel(appId: string, channel: string, token: string) {
    await this.rtcClient.join(appId, channel, token, 1)
      .then(async (value: UID) => {
        this.screenShareUid = value;
        this.publishScreenTracks();
        this.isScreenPresenting = true;
        console.log('this.uid', this.screenShareUid);
      })
      .catch((res: any) => {
        console.log('catchreason:::::::::::::::::', res);
        this.errors.next({ code: res.code, msg: res.message });
      });;
  }

  private async publishScreenTracks(): Promise<void> {
    AgoraRTC.createScreenVideoTrack({
      // Set the encoder configurations. For details, see the API description.
      encoderConfig: "1080p_1",
    }).then(async localScreenTrack => {
      this.localScreenTrack = localScreenTrack;
      await this.rtcClient.publish(this.localScreenTrack);
      await this.localScreenTrack.on('track-ended', async () => {
        console.log('track-ended');
        this.trackEnded.next('track-ended');
        await this.stopScreenSharing();
      })
      /** ... **/
    }).catch((res: any) => {
      console.log('reason:::::::::::::::::', res);
      this.errors.next({ code: res.code, msg: res.message });
      this.stopScreenSharing();
    });
  }

  async stopScreenSharing(): Promise<void> {
    await this.rtcClient.unpublish();
    await this.rtcClient.leave();
    await this.localScreenTrack?.close();
    this.isScreenPresenting = false;
  }

  private async publishLocalAudioTracks(): Promise<void> {
    this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    await this.rtcClient.publish(this.localAudioTrack)
      .then(() => {
        console.log('then localAudioTrack');
        this._audio = false;
      })
      .catch((reason: any) => {
        this.rtcClient.unpublish(this.localAudioTrack);
        console.log('catch localAudioTrack', reason);
      });
  }

  private async publishLocalVideoTracks(): Promise<void> {
    this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    await this.rtcClient.publish(this.localVideoTrack)
      .then(() => {
        this.localVideoTrack.play("local_stream_" + this.uid);
        this._camera = false;
      })
      .catch((reason: any) => {
        this.rtcClient.unpublish(this.localVideoTrack);
        console.log("catch localVideoTrack", reason);
      })
      .finally(() => this.disableVideo = false);
    // Play the remote video track.
    // Pass the DIV container and the SDK dynamically creates a player in the container for playing the remote video track.
  }

  private connectionState(): void {
    this.rtcClient.on('connection-state-change', (curState: ConnectionState, revState: ConnectionState, reason?: ConnectionDisconnectedReason) => {
      console.log("connection-state-change!", curState, revState, reason);
    })
  }

  private userPublish(): void {
    this.rtcClient.on("user-joined", async (user: IAgoraRTCRemoteUser) => {
      console.log('user-joined', user.hasAudio, user.hasVideo, user.videoTrack, user.audioTrack);

      this.userJoined.next(user);
    });
    this.rtcClient.on("user-info-updated", async (uid: UID, msg: string) => {
      console.log('user-info-updated', uid, msg);
      this.userInfoUpdated.next({ uid: uid, msg: msg });
    });
    this.rtcClient.on("network-quality", async (stats: NetworkQuality) => {
      this.networkQuality.next(stats);
      // console.log('network-quality', stats);
    });

    this.rtcClient.on("user-published", async (user, mediaType) => {
      // Subscribe to a remote user.
      await this.rtcClient.subscribe(user, mediaType);
      console.log("subscribe success", user, mediaType, this.rtcClient);
      console.log("mediaType subscribe success", mediaType);
      console.log("this.rtcClient", this.rtcClient);
      const id = user.uid;
      // If the subscribed track is video.
      if (mediaType === "video") {
        // Get `RemoteVideoTrack` in the `user` object.
        const remoteVideoTrack = user?.videoTrack;
        // Pass the DIV container and the SDK dynamically creates a player in the container for playing the remote video track.
        remoteVideoTrack?.play("remote_stream_" + user.uid);

        // Or just pass the ID of the DIV container.
        // remoteVideoTrack.play(playerContainer.id);
        console.log('user.id', user.uid);
      }

      // If the subscribed track is audio.
      if (mediaType === "audio") {
        // Get `RemoteAudioTrack` in the `user` object.
        const remoteAudioTrack = user.audioTrack;
        // Play the audio track. No need to pass any DOM element.
        remoteAudioTrack?.play();
      }
    });

    this.rtcClient.on("user-unpublished", (user, mediaType) => {
      if (mediaType === "video") {
        // Get the dynamically created DIV container.
        const playerContainer = document.getElementById(user.uid.toString());
        // Destroy the container.
        playerContainer?.remove();
      }
      console.log('user', user);
    });
    this.rtcClient.on('user-left', (user: IAgoraRTCRemoteUser, reason: string) => {
      console.log('user-left', user, reason)
      this.userLeft.next({ user, reason });
    })
    this.rtcClient.on('volume-indicator', (result: { level: number; uid: UID; }[]) => {
      console.log('volume-indicator:::');
      this.volumeIndicator.next(result);
    });
    this.rtcClient.on('token-privilege-will-expire', () => {
      console.log('token-privilege-will-expire');
    });
    this.rtcClient.on('token-privilege-did-expire', () => {
      console.log('token-privilege-did-expire');
    });
    this.rtcClient.on('exception', (event: { code: number; msg: string; uid: UID; }) => {
      console.log('exception', event);
    });
  }

  async leaveCall(): Promise<void> {
    if (!this.audio) {
      // Destroy the local audio and video tracks.
      await this.localAudioTrack.close();
    }
    if (!this.camera) {
      await this.localVideoTrack.close();
    }
    // const localContainer = document.getElementById(this.uid.toString());
    // // Destroy the container.
    // localContainer?.remove();
    // Traverse all remote users.
    await this.rtcClient.remoteUsers.forEach(user => {
      user.audioTrack?.stop()
      user.videoTrack?.stop()
      // Destroy the dynamically created DIV container.
      // const playerContainer = document.getElementById(user.uid.toString());
      // playerContainer && playerContainer.remove();
    });

    // Leave the channel.
    await this.rtcClient.leave();
    this.isJoined = false;
  }

  private async audioOnAndOff(): Promise<void> {
    if (!this.audio) {
      await this.publishLocalAudioTracks();
    } else {
      this.rtcClient.unpublish(this.localAudioTrack);
      this.localAudioTrack.close();
    }
    // await this.localAudioTrack.setEnabled(this.audio);
  }

  private async videoOnAndOff(): Promise<void> {
    console.log('aaya ?');
    if (!this.camera) {
      await this.publishLocalVideoTracks();
    } else {
      console.log("unpublish localVideoTrack");
      await this.rtcClient.unpublish(this.localVideoTrack)
      this.localVideoTrack.close();
    }
    // await this.localVideoTrack.setEnabled(this.camera);
  }

}
