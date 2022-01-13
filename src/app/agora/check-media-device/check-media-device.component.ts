/**
 * Angular imports.
 */
import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

/**
 * Agora rtc sdk imports.
 */
import AgoraRTC, { ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';

/**
 * Used to check that the camera and mic of the browser is working or not.
 */
@Component({
  selector: 'app-check-media-device',
  templateUrl: './check-media-device.component.html',
  styleUrls: ['./check-media-device.component.scss']
})
export class CheckMediaDeviceComponent implements OnInit, OnDestroy {

  /**
   * Output the joinChannel.
   */
  @Output() emitJoinChannel = new EventEmitter<{ camera: boolean; audio: boolean; userName: string }>();

  /**
   * Private variables MicrophoneId, videoTrack and audioTrack object.
   * Interval to get the volume level
   */
  private selectedMicrophoneId!: string;
  private videoTrack!: ICameraVideoTrack;
  private audioTrack!: IMicrophoneAudioTrack;
  private interval!: any;

  /**
   * Audio and camera setter and getter for on and Off.
   */
  private _audio = false;
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

  /**
   * Camera id to stream the video on particular div.
   * Volume level.
   * Loading flag.
   */
  public selectedCameraId!: string;
  public checkVolumeLevel = 0;
  public mediaChecking = true;
  public loading = false;

  /**
   * Form Group, Submitted and login flag.
   */
  public joinForm!: FormGroup;

  /**
   * Create necessary instances.
   */
  constructor(private formBuilder: FormBuilder) { }


  /**
   * Call the getDeviceInfo function.
   */
  ngOnInit(): void {
    this.joinForm = this.formBuilder.group({
      userName: ['', Validators.required]
    })
    this.getDeviceInfo();
  }

  /**
   * Get all audio and video devices.
   */
  private getDeviceInfo(): void {
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
        this.mediaChecking = false
        this._camera = true;
        this._audio = true;
        this.interval = setInterval(() => {
          this.checkVolumeLevel = audioTrack.getVolumeLevel();
        }, 1000);
      })
      .catch((reason: any) => { alert(reason) });
  }

  /**
   * Toggle the audio and video flag which call the setter's and getter's.
   */
  toggleAudio(): void {
    this.audio = !this.audio;
  }
  toggleCamera(): void {
    this.camera = !this.camera;
  }

  /**
   * On and Off the video Temporarily.
   */
  private async enableVideo(val: boolean): Promise<void> {
    await this.videoTrack.setEnabled(val);
  }

  /**
   * Clear the volume level indicator
   * Emit the join credentials.
   * And Off Checking audio and video.
   */
  joinChanel(): void {
    this.loading = true;
    this.joinForm.setValue({ userName: this.joinForm.value.userName.trim() })
    /**
     * stop here if form is invalid
     */
    if (this.joinForm.invalid) {
      return;
    }
    this.emitJoinChannel.emit({
      camera: this._camera,
      audio: this._audio,
      userName: this.joinForm.value.userName
    });
  }

  ngOnDestroy(): void {
    this.camera = false;
    this.audio = false;
    clearInterval(this.interval);
  }
}
