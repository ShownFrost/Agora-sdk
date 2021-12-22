/**
 * Angular imports.
 */
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

/**
 * Agora credential form which required appId, Channel Name and Token.
 * Link provided to get the Agora Credentials.
 */
@Component({
  selector: 'app-agora-credentials',
  templateUrl: './agora-credentials.component.html',
  styleUrls: ['./agora-credentials.component.scss']
})
export class AgoraCredentialsComponent implements OnInit {

  /**
   * convenience getter for easy access to form fields
   */
  get appId(): AbstractControl | null { return this.agoraForm.get('appId'); }
  get channelName(): AbstractControl | null { return this.agoraForm.get('channelName'); }
  get token(): AbstractControl | null { return this.agoraForm.get('token'); }

  /**
   * Form Group, Submitted and login flag.
   */
  public agoraForm!: FormGroup;
  public submitted = false;
  public login = false;

  /**
   * Create necessary instances.
   */
  constructor(private formBuilder: FormBuilder) { }

  /**
   * Initialize the agora Form.
   */
  ngOnInit(): void {
    this.agoraForm = this.formBuilder.group({
      appId: ['29b796615e624917a1212539f7551fb9', Validators.required],
      channelName: ['demo_channel_name', Validators.required],
      token: ['00629b796615e624917a1212539f7551fb9IAALWqDYswqbFUrxtMSPfTeDz+gFH43wmtki93/OFQXt3o4kO3kAAAAAEABaBdmzrxXEYQEAAQCvFcRh', Validators.required]
    })
  }

  /**
   * Submit the agora Form and check if form is valid.
   */
  onSubmit() {
    this.submitted = true;
    /**
     * stop here if form is invalid
     */
    if (this.agoraForm.invalid) {
      return;
    }
    this.login = true;
  }

  /**
   * Reset the agora Form.
   */
  onReset() {
    this.submitted = false;
    this.agoraForm.reset({ appId: '', channelName: '', token: '' });
  }
}
