/**
 * Angular imports.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

/**
 * Component imports.
 */
import { MainComponent } from './main/main.component';
import { StreamsComponent } from './streams/streams.component';
import { ControlsComponent } from './controls/controls.component';
import { AgoraCredentialsComponent } from './agora-credentials/agora-credentials.component';
import { PeopleListComponent } from './people-list/people-list.component';
import { LeaveComponent } from './leave/leave.component';
import { ToasterComponent } from './toaster/toaster.component';
import { CheckMediaDeviceComponent } from './check-media-device/check-media-device.component';

/**
 * Module imports.
 */
import { AgoraRoutingModule } from './agora-routing.module';

/**
 * Pipe imports.
 */
import { WithoutScreenSharePipe } from './models/withoutScreenShare';
import { WithScreenSharePipe } from './models/withScreenShare.pipe';


@NgModule({
  declarations: [
    MainComponent,
    StreamsComponent,
    ControlsComponent,
    AgoraCredentialsComponent,
    WithScreenSharePipe,
    WithoutScreenSharePipe,
    CheckMediaDeviceComponent,
    LeaveComponent,
    PeopleListComponent,
    ToasterComponent
  ],
  imports: [
    CommonModule,
    AgoraRoutingModule,
    ReactiveFormsModule
  ]
})
export class AgoraModule { }
