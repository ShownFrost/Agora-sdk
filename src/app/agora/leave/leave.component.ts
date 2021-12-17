import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-leave',
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.scss']
})
export class LeaveComponent {


  @Output() emitRejoin = new EventEmitter<boolean>();

  @Output() emitCredentials = new EventEmitter<boolean>();

  rejoin(): void {
    this.emitRejoin.emit(true);
  }

  credentials(): void {
    this.emitCredentials.emit(true);
  }
}
