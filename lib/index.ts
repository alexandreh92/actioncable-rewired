import Consumer from './consumer';

export { default as logger } from './logger';

type CreateConsumer = (url: string) => IConsumer;

export const createConsumer: CreateConsumer = (url) => new Consumer(url);
