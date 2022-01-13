/**
 * Angular imports.
 */
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

/**
 * Service imports.
 */
import { ApiService } from './../../services/api/api.service';

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
  constructor(private formBuilder: FormBuilder, private router: Router, private apiService: ApiService) { }

  /**
   * Initialize the agora Form.
   */
  ngOnInit(): void {
    this.agoraForm = this.formBuilder.group({
      appId: ['2e493d6575084c7780e6ac621bc40357', Validators.required],
      channelName: ['demo_channel_name', Validators.required],
      token: ['']
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
    this.apiService.appId = this.appId?.value;
    this.apiService.cname = this.channelName?.value;
    this.router.navigate(['agora/' + this.apiService.appId],
      { queryParams: { cname: this.apiService.cname } });
  }

  /**
   * Reset the agora Form.
   */
  onReset() {
    this.submitted = false;
    this.agoraForm.reset({ appId: '', channelName: '', token: '' });
  }
}
