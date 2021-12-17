

export class RemoteStream {

  private uid: number;

  private _isPresenting: boolean;

  private _isAudio: boolean;

  private _isVideo: boolean;

  get isAudio(): boolean {
    return this._isAudio;
  }
  set isAudio(val) {
    this._isAudio = val;
  }
  get isVideo(): boolean {
    return this._isVideo;
  }

  get isPresenting(): boolean {
    return this._isPresenting;
  }
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

  constructor(uid: number, isPresenting: boolean, audio: boolean, video: boolean, volume: number) {
    this.uid = uid;
    this._isPresenting = isPresenting;
    console.log('audio, video', audio, video);
    this._isAudio = audio;
    this._isVideo = video;
    this._volume = volume
  };

}
