/**
 * Angular imports.
 */
import { Component, EventEmitter, Output } from '@angular/core';

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
   * Emit the rejoin and back to credential page.
   */
  @Output() emitRejoin = new EventEmitter<boolean>();
  @Output() emitCredentials = new EventEmitter<boolean>();

  /**
   * Emit the rejoin and back to credential page.
   */
  rejoin(): void {
    this.emitRejoin.emit(true);
  }
  credentials(): void {
    this.emitCredentials.emit(true);
  }
}
