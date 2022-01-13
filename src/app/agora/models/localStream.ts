/**
 * Agora imports.
 */
import { UID } from "agora-rtc-sdk-ng";

/**
 * Local user interface.
 */
export interface localStream {
  uid: UID | undefined;
  name: string;
  level: number;
  audio: boolean;
  camera: boolean;
  isPresenting: boolean;
  initials: string;
}

/**
 * Global chat interface.
 */
export interface ChatMessages {
  memberId: string;
  memberName: string;
  message: string;
  messageType: string;
  timestamp: number
}
