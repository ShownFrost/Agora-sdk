/**
 * Angular imports.
 */
import { Component, OnDestroy } from '@angular/core';

/**
 * Service imports.
 */
import { ApiService } from 'src/app/services/api/api.service';

/**
 * Rxjs imports.
 */
import { Subscription } from 'rxjs';

/**
 * Recording apis.
 */
@Component({
  selector: 'app-recording',
  templateUrl: './recording.component.html',
  styleUrls: ['./recording.component.scss']
})
export class RecordingComponent implements OnDestroy {

  /**
   * Recording start or stop status.
   */
  private _recordingStart = false;
  private acquireRecordingSub!: Subscription;
  private startRecordingSub!: Subscription;
  private stopRecordingSub!: Subscription;

  get isRecordingStart(): boolean {
    return this._recordingStart;
  }
  set isRecordingStart(val) {
    this._recordingStart = val;
  }

  /**
   * Recording start or stop status.
   */
  public loading = false;

  /**
   * Create necessary instances.
   */
  constructor(private apiService: ApiService) { }

  /**
   * Use the Acquire endpoint to receive the reqwuired token (resourceId)
   * needed for use with each of the other Agora.io Cloud Recording endpoints.
   * If this method call succeeds, you will receive a resource ID (resourceId) from the HTTP response body.
   * The resource ID is valid for five minutes, so you need to start recording with this resource ID within five minutes.
   */
  acquireRecording(): void {
    this.loading = true;
    this.acquireRecordingSub = this.apiService.acquireRecording()
      .subscribe(
        (next: { resourceId: string; }) => {
          if (next) {
            this.apiService.resourceId = next.resourceId;
            this.startRecording();
          }
        },
        (error: any) => {
          if (error) {
            this.loading = false;
          }
        }
      );
  }

  /**
   * Call the start method within five minutes after getting the resource ID to join a channel and
   * start the recording.
   * If this method call succeeds, you get a recording ID (sid) from the HTTP response body.
   */
  startRecording(): void {
    this.startRecordingSub = this.apiService.startRecording()
      .subscribe(
        (next: any) => {
          if (next) {
            this.apiService.sid = next.sid;
            this.loading = false;
            this.isRecordingStart = true;
          }
        },
        (error: any) => {
          if (error) {
            this.loading = false;
          }
        }
      );
  }

  /**
   * Call the stop method to stop the recording.
   * If this method call succeeds, you get the M3U8 filename and
   * the current uploading status from the HTTP response body.
   */
  stopRecording(): void {
    this.loading = true;
    this.stopRecordingSub = this.apiService.stopRecording()
      .subscribe(
        (next: any) => {
          if (next) {
            this.loading = false;
            this.isRecordingStart = false;
          }
        },
        (error: any) => {
          if (error) {
            this.loading = false;
          }
        }
      );
  }

  /**
   * During the recording, you can call the query method to check the recording status multiple times.
   * If this method call succeeds, you get the M3U8 filename and the current recording status from the HTTP response body.
   */
  queryRecording(): void {
    this.apiService.queryRecording()
      .subscribe(
        (next: any) => {
          if (next) {
            this.loading = false;
            this.isRecordingStart = false;
            this.stopRecording();
          }
        },
        (error: any) => {
          if (error) {
            this.loading = false;
          }
        }
      );
  }

  /**
   * Unsubscribe the subscription.
   */
  ngOnDestroy(): void {
    if (this.startRecordingSub) {
      this.startRecordingSub.unsubscribe();
    }
    if (this.acquireRecordingSub) {
      this.acquireRecordingSub.unsubscribe();
    }
    if (this.stopRecordingSub) {
      this.stopRecordingSub.unsubscribe();
    }
  }
}
