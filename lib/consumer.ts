import Connection from './connection';
import Subscriptions from './subscriptions';

import { createWebSocketURL } from './utils';

export default class Consumer {
  _url: string;
  subscriptions: Subscriptions;
  connection: Connection;

  constructor(url: string) {
    this._url = url;
    this.subscriptions = new Subscriptions(this);
    this.connection = new Connection(this);
  }

  get url(): string {
    return createWebSocketURL(this._url);
  }

  send(data: Record<string, unknown>): boolean {
    return this.connection.send(data);
  }

  connect(): void {
    return this.connection.open();
  }

  disconnect(): void {
    return this.connection.close({ allowReconnect: false });
  }

  ensureActiveConnection(): void {
    if (this.connection.isActive()) return;
    this.connection.open();
  }
}
