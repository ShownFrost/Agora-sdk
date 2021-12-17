import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgoraRoutingModule } from './agora-routing.module';
import { MainComponent } from './main/main.component';
import { StreamsComponent } from './streams/streams.component';
import { ControlsComponent } from './controls/controls.component';
import { AgoraCredentialsComponent } from './agora-credentials/agora-credentials.component';
import { WithoutScreenSharePipe } from './models/withoutScreenShare';
import { WithScreenSharePipe } from './models/withScreenShare.pipe';
import { ReactiveFormsModule } from '@angular/forms';
import { CheckMediaDeviceComponent } from './check-media-device/check-media-device.component';
import { LeaveComponent } from './leave/leave.component';


@NgModule({
  declarations: [
    MainComponent,
    StreamsComponent,
    ControlsComponent,
    AgoraCredentialsComponent,
    WithScreenSharePipe,
    WithoutScreenSharePipe,
    CheckMediaDeviceComponent,
    LeaveComponent
  ],
  imports: [
    CommonModule,
    AgoraRoutingModule,
    ReactiveFormsModule
  ]
})
export class AgoraModule { }
