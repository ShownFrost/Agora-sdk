/**
 * Angular imports.
 */
import { Component } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Service imports.
 */
import { ApiService } from './../../services/api/api.service';

/**
 * Leave screen and left after getting any error aur user leave the call.
 */
@Component({
  selector: 'app-leave',
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.scss']
})
export class LeaveComponent {

  /**
   * Create necessary instances.
   * Redirect to credential if appId is not present.
   * Too lazy to implement the guard for this.
   */
  constructor(private apiService: ApiService, private router: Router) {
    if (!this.apiService.appId) {
      this.router.navigate(['/']);
    }
  }

  /**
   * redirect to the check media screen.
   */
  rejoin(): void {
    this.router.navigate(['agora/' + this.apiService.appId],
      { queryParams: { cname: this.apiService.cname } });
  }
}
