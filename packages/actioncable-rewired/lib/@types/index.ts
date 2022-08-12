import INTERNAL_VARS from '../internal';

export type NotificationCallback =
  typeof INTERNAL_VARS.NOTIFICATION_CALLBACKS[keyof typeof INTERNAL_VARS.NOTIFICATION_CALLBACKS];

export interface Mixin<T> {
  connected?(): void;
  disconnected?(): void;
  received?(obj: T): void;
  [key: string]: any;
}

export interface ChannelNameWithParams {
  channel: string;
  [key: string]: any;
}
