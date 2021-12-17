import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-agora-credentials',
  templateUrl: './agora-credentials.component.html',
  styleUrls: ['./agora-credentials.component.scss']
})
export class AgoraCredentialsComponent implements OnInit {

  public joined = false;


  // convenience getter for easy access to form fields
  get appId(): AbstractControl | null { return this.agoraForm.get('appId'); }
  get channelName(): AbstractControl | null { return this.agoraForm.get('channelName'); }
  get token(): AbstractControl | null { return this.agoraForm.get('token'); }
  get audio(): AbstractControl | null { return this.agoraForm.get('audio'); }
  get camera(): AbstractControl | null { return this.agoraForm.get('camera'); }

  public agoraForm!: FormGroup;
  public submitted = false;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.agoraForm = this.formBuilder.group({
      appId: ['29b796615e624917a1212539f7551fb9', Validators.required],
      channelName: ['demo_channel_name', Validators.required],
      token: ['00629b796615e624917a1212539f7551fb9IADziR8J/XG/TT04sulyN7gVXu0r9IPfk2RKS6Dq+TCsLI4kO3kAAAAAEADfTJIXT569YQEAAQBPnr1h', Validators.required],
      audio: [true, [Validators.required]],
      camera: [true, [Validators.required]],
    })
  }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.agoraForm.invalid) {
      return;
    }
    // display form values on success
    alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.agoraForm.value, null, 4));
    this.joined = true;
  }

  onReset() {
    this.submitted = false;
    this.agoraForm.reset();
  }
}
