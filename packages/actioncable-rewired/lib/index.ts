import Consumer from './consumer';
import { ChannelNameWithParams, Mixin, NotificationCallback } from './@types';

export { default as logger } from './logger';

export type CreateConsumer = (url: string) => Consumer;

export type { Consumer, ChannelNameWithParams, Mixin, NotificationCallback };

export const createConsumer: CreateConsumer = (url) => new Consumer(url);
