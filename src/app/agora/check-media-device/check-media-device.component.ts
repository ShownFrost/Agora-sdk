import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import AgoraRTC, { ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';

@Component({
  selector: 'app-check-media-device',
  templateUrl: './check-media-device.component.html',
  styleUrls: ['./check-media-device.component.scss']
})
export class CheckMediaDeviceComponent implements OnInit {
  @Output() emitJoinChannel = new EventEmitter<{ camera: boolean, audio: boolean }>();
  @Output() emitBackToCredentials = new EventEmitter<boolean>();
  selectedMicrophoneId!: string;
  selectedCameraId!: string;
  checkVolumeLevel = 0;
  videoTrack!: ICameraVideoTrack;
  audioTrack!: IMicrophoneAudioTrack;
  public loading = true;
  private _audio = false;
  private interval!: any;
  get audio(): boolean {
    return this._audio;
  }
  set audio(val: boolean) {
    this.audioTrack.setEnabled(val);
    this._audio = val;
  }
  private _camera = false;
  get camera(): boolean {
    return this._camera;
  }
  set camera(val: boolean) {
    if (val) {
      this.videoTrack.play("check_" + this.selectedCameraId);
    } else {
      this.videoTrack.stop();
    }
    this.enableVideo(val);
    this._camera = val;
  }

  ngOnInit(): void {
    // Get all audio and video devices.
    AgoraRTC.getDevices()
      .then(devices => {
        const audioDevices = devices.filter(function (device) {
          return device.kind === "audioinput";
        });
        const videoDevices = devices.filter(function (device) {
          return device.kind === "videoinput";
        });

        this.selectedMicrophoneId = audioDevices[0].deviceId;
        this.selectedCameraId = videoDevices[0].deviceId;
        return Promise.all([
          AgoraRTC.createCameraVideoTrack({ cameraId: this.selectedCameraId }),
          AgoraRTC.createMicrophoneAudioTrack({ microphoneId: this.selectedMicrophoneId }),
        ]);
      })
      .then(([videoTrack, audioTrack]) => {
        this.videoTrack = videoTrack;
        this.audioTrack = audioTrack;
        videoTrack.play("check_" + this.selectedCameraId);
        this.loading = false
        this._camera = true;
        this._audio = true;
        this.interval = setInterval(() => {
          this.checkVolumeLevel = audioTrack.getVolumeLevel();
          console.log("local stream audio level", this.checkVolumeLevel);
        }, 1000);
      })
      .catch((reason: any) => { console.log('reason::::;', reason) });
  }

  toggleAudio(): void {
    // this.audioTrack.setDevice(this.selectedMicrophoneId).then(() => {
    //   console.log("set device success");
    // }).catch(e => {
    //   console.log("set device error", e);
    // });
    this.audio = !this.audio;
  }

  toggleCamera(): void {
    // this.videoTrack.setDevice(this.selectedCameraId).then(() => {
    //   console.log("set device success");
    // }).catch(e => {
    //   console.log("set device error", e);
    // });
    this.camera = !this.camera;
  }

  async enableVideo(val: boolean): Promise<void> {
    await this.videoTrack.setEnabled(val);
  }

  joinChanel(): void {
    clearInterval(this.interval);
    this.emitJoinChannel.emit({ camera: this._camera, audio: this._audio });
    this.camera = false;
    this.audio = false;
  }

  back(): void {
    this.emitBackToCredentials.emit(true);
  }
}
