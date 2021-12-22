

/**
 * Create the remote streams.
 */
export class RemoteStream {

  /**
   * Uid of remote streamer.
   */
  private uid: number;

  /**
   * Mic flag of remote streamer.
   */
  private _isAudio: boolean;

  get isAudio(): boolean {
    return this._isAudio;
  }
  set isAudio(val) {
    this._isAudio = val;
  }

  /**
   * Camera flag of remote streamer.
   */
  private _isVideo: boolean;
  get isVideo(): boolean {
    return this._isVideo;
  }

  /**
   * Screen share flag of remote streamer.
   */
  private _isPresenting: boolean;
  get isPresenting(): boolean {
    return this._isPresenting;
  }

  /**
   * Volume flag of remote streamer.
   */
  private _volume: number
  set volume(val) {
    if (val) {
      val = Math.round(val);
      this._volume = val;
    }
  }
  get volume(): number {
    return this._volume;
  }

  /**
   * Initiate the remote.
   */
  constructor(uid: number, isPresenting: boolean, audio: boolean, video: boolean, volume: number) {
    this.uid = uid;
    this._isPresenting = isPresenting;
    this._isAudio = audio;
    this._isVideo = video;
    this._volume = volume
  };
}
