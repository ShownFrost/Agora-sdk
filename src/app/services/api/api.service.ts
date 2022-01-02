
/**
 * Angular imports.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/**
 * Constant imports.
 */
import { API } from './../../constants/apiUrl.constant';

/**
 * Environment imports.
 */
import { environment } from './../../../environments/environment';

/**
 * Rxjs imports.
 */
import { Observable } from 'rxjs';

/**
 * Service for the cloud recording apis.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  /**
   * Receive appid, channel name
   * uid of the user who start the recording.
   * resourceId will get after acquiring api response.
   * sid will get after start recording api response.
   */
  public appId!: string;
  public cname!: string;
  public uid!: string | undefined;
  public resourceId!: string;
  public sid!: string;

  /**
   * Create necessary instances.
   */
  constructor(private httpClient: HttpClient) { }

  /**
   * Use the Acquire endpoint to receive the reqwuired token (resourceId)
   * needed for use with each of the other Agora.io Cloud Recording endpoints.
   * If this method call succeeds, you will receive a resource ID (resourceId) from the HTTP response body.
   * The resource ID is valid for five minutes, so you need to start recording with this resource ID within five minutes.
   */
  acquireRecording(): Observable<{ resourceId: string }> {
    return this.httpClient
      .post<{ resourceId: string }>(this.appId + '/' + API.CLOUD_RECORDING + '/' + API.ACQUIRE, {
        cname: this.cname,
        uid: this.uid,
        clientRequest: {
          resourceExpiredHour: environment.resourceExpiredHour,
          scene: environment.scene
        }
      })
  }

  /**
   * Call the start method within five minutes after getting the resource ID to join a channel and
   * start the recording.
   * If this method call succeeds, you get a recording ID (sid) from the HTTP response body.
   */
  startRecording(): Observable<any> {
    return this.httpClient
      .post<any>(
        this.appId + '/' + API.CLOUD_RECORDING + '/' +
        API.RESOURCE_ID + '/' + this.resourceId + '/' +
        API.MODE + '/' + environment.mode + '/' + API.START,
        {
          cname: this.cname,
          uid: this.uid,
          clientRequest: {
            token: environment.token,
            recordingConfig: {
              maxIdleTime: environment.maxIdleTime,
              streamTypes: environment.streamTypes,
              audioProfile: environment.audioProfile,
              channelType: environment.channelType,
              videoStreamType: environment.videoStreamType,
              transcodingConfig: environment.transcodingConfig,
              subscribeVideoUids: [this.uid],
              subscribeAudioUids: [this.uid],
              subscribeUidGroup: environment.subscribeUidGroup,
            },
            storageConfig: environment.storageConfig
          }
        })
  }

  /**
   * Call the stop method to stop the recording.
   * If this method call succeeds, you get the M3U8 filename and
   * the current uploading status from the HTTP response body.
   */
  stopRecording(): Observable<any> {
    return this.httpClient
      .post<any>(
        this.appId + '/' + API.CLOUD_RECORDING + '/' +
        API.RESOURCE_ID + '/' + this.resourceId + '/' + API.SID + '/' + this.sid + '/' +
        API.MODE + '/' + environment.mode + '/' + API.STOP,
        {
          cname: this.cname,
          uid: this.uid,
          clientRequest: {}
        })
  }

  /**
   * During the recording, you can call the query method to check the recording status multiple times.
   * If this method call succeeds, you get the M3U8 filename and the current recording status from the HTTP response body.
   */
  queryRecording(): Observable<any> {
    return this.httpClient.get<any>(
      this.appId + '/' + API.CLOUD_RECORDING + '/' +
      API.RESOURCE_ID + '/' + this.resourceId + '/' + API.SID + '/' + this.sid + '/' +
      API.MODE + '/' + environment.mode + '/' + API.QUERY
    )
  }
}
