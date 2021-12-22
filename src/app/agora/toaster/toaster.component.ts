/**
 * Angular imports.
 */
import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';

/**
 * Toaster for the updates.
 */
@Component({
  selector: 'app-toaster',
  templateUrl: './toaster.component.html',
  styleUrls: ['./toaster.component.scss']
})
export class ToasterComponent implements OnInit, OnDestroy {


  /**
   * Receive the toaster message.
   */
  @Input() toasterMsg!: string;
  @Output() emitToasterMsg = new EventEmitter<string>();


  private toasterSub!: any;

  /**
   * Initiate the interval so that toaster will clear after certain interval.
   */
  ngOnInit(): void {
    this.toasterSub = setInterval(() => {
      this.toasterMsg = '';
      this.emitToasterMsg.emit(this.toasterMsg);
      clearInterval(this.toasterSub);
    }, 5000);
  }

  /**
   * Clear the interval.
   */
  ngOnDestroy(): void {
    clearInterval(this.toasterSub);
  }
}
