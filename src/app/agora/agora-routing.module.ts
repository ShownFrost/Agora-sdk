/**
 * Angular imports.
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/**
 * Component imports.
 */
import { AgoraCredentialsComponent } from './agora-credentials/agora-credentials.component';
import { MainComponent } from './main/main.component';
import { LeaveComponent } from './leave/leave.component';

const routes: Routes = [
  {
    path: '',
    component: AgoraCredentialsComponent
  },
  {
    path: 'agora/:id',
    component: MainComponent
  },
  {
    path: 'leave',
    component: LeaveComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgoraRoutingModule { }
