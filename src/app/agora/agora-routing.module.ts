/**
 * Angular imports.
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/**
 * Component imports.
 */
import { AgoraCredentialsComponent } from './agora-credentials/agora-credentials.component';

const routes: Routes = [
  {
    path: '',
    component: AgoraCredentialsComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgoraRoutingModule { }
