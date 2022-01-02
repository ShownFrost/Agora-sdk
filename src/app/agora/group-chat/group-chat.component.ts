/**
 * Angular imports.
 */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UID } from 'agora-rtc-sdk-ng';

/**
 * Group chat of the active users.
 */
@Component({
  selector: 'app-group-chat',
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.scss']
})
export class GroupChatComponent implements OnInit {

  /**
   * Received chat messages.
   * member id and name.
   */
  @Input() chatMessages!: { memberId: string; memberName: string; message: string; timestamp: number }[];
  @Input() memberId!: UID | undefined;
  @Input() memberName!: string;

  /**
   * Emit close chat flag.
   * Emit message.
   */
  @Output() emitCloseChat = new EventEmitter<boolean>();
  @Output() emitSendMessage = new EventEmitter<{ message: string; memberName: string; timestamp: number }>();

  /**
   * Form Group, Submitted and login flag.
   */
  public chatForm!: FormGroup;

  /**
   * Create necessary instances.
   */
  constructor(private formBuilder: FormBuilder) { }

  /**
   * Initiate chatForm.
   */
  ngOnInit(): void {
    this.chatForm = this.formBuilder.group({
      message: ['', Validators.required]
    })
  }

  /**
   * Emit close chat flag.
   */
  closeChat(): void {
    this.emitCloseChat.emit(false);
  }

  /**
   * Emit close chat flag.
   */
  sendMessage(): void {
    this.chatForm.setValue({ message: this.chatForm.value.message.trim() })
    /**
     * stop here if form is invalid
     */
    if (this.chatForm.invalid) {
      return;
    }
    this.emitSendMessage.emit({ message: this.chatForm.value.message, memberName: this.memberName, timestamp: Date.now() });
    this.chatForm.reset({ message: '' })
  }
}
