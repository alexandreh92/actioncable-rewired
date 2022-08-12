/* eslint-disable camelcase */
import { w3cwebsocket as WebSocket } from 'websocket';

import ConnectionMonitor from './connection_monitor';

import Consumer from './consumer';
import Subscriptions from './subscriptions';
import logger from './logger';
import INTERNAL_VARS, { EventData, MessageEvent } from './internal';
import { availableEvents } from './utils';

const { message_types, protocols, NOTIFICATION_CALLBACKS } = INTERNAL_VARS;
const supportedProtocols = protocols.slice(0, protocols.length - 1);
const defaultProtocol = INTERNAL_VARS.protocols[0];

export const CONNECTION_STATE = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
} as const;

export type ConnectionState =
  typeof CONNECTION_STATE[keyof typeof CONNECTION_STATE];

export default class Connection {
  consumer: Consumer;
  subscriptions: Subscriptions;
  disconnected: boolean;
  monitor: ConnectionMonitor;
  webSocket?: WebSocket;
  reopenDelay: number;

  constructor(consumer: Consumer) {
    this.open = this.open.bind(this);
    this.consumer = consumer;
    this.subscriptions = this.consumer.subscriptions;
    this.disconnected = true;
    this.monitor = new ConnectionMonitor(this);
    this.webSocket = undefined;
    this.reopenDelay = 500;
  }

  send(data: Record<string, unknown>) {
    if (this.isOpen()) {
      this.webSocket?.send(JSON.stringify(data));
      return true;
    }
    return false;
  }

  open() {
    if (this.isActive()) {
      logger.log(
        `Attempted to open WebSocket, but existing socket is ${this.getState()}`,
      );
      return false;
    }

    if (this.webSocket) {
      this.uninstallEventHandlers();
    }

    logger.log(
      `Opening WebSocket, current state is ${this.getState()}, subprotocols: ${protocols}`,
    );
    this.webSocket = new WebSocket(this.consumer.url, defaultProtocol);
    this.installEventHandlers();
    // this.monitor.start();
    return true;
  }

  close({ allowReconnect } = { allowReconnect: true }) {
    if (!allowReconnect) {
      this.monitor.stop();
    }
    if (this.isOpen()) {
      this.webSocket?.close();
    }
    return undefined;
  }

  reopen(): void {
    logger.log(`Reopening WebSocket, current state is ${this.getState()}`);
    if (this.isActive()) {
      try {
        return this.close();
      } catch (error) {
        logger.log('Failed to reopen WebSocket', error);
      } finally {
        logger.log(`Reopening WebSocket in ${this.reopenDelay}ms`);
        setTimeout(this.open, this.reopenDelay);
      }
    } else {
      this.open();
    }
    return undefined;
  }

  getProtocol() {
    return this.webSocket?.protocol;
  }

  isOpen() {
    return this.isState(CONNECTION_STATE.OPEN);
  }

  isActive() {
    return this.isState(CONNECTION_STATE.OPEN, CONNECTION_STATE.CONNECTING);
  }

  // Private

  isProtocolSupported() {
    return supportedProtocols.some(
      (protocol) => protocol === this.getProtocol(),
    );
  }

  isState(...states: ConnectionState[]) {
    return states.some((state) => state === this.getState());
  }

  getState() {
    return this.webSocket?.readyState;
  }

  installEventHandlers() {
    availableEvents.forEach((eventName) => {
      const handler = this[eventName].bind(this);
      Object.assign(this.webSocket as WebSocket, {
        [eventName]: handler,
      });
    });
  }

  uninstallEventHandlers() {
    availableEvents.forEach((eventName) => {
      Object.assign(this.webSocket as WebSocket, {
        [eventName]: () => undefined,
      });
    });
  }

  onmessage(event: MessageEvent) {
    if (!this.isProtocolSupported?.()) {
      return;
    }

    const { identifier, message, reason, reconnect, type }: EventData =
      JSON.parse(event.data);
    switch (type) {
      case message_types.welcome:
        this.monitor.recordConnect();
        this.subscriptions.reload();
        break;
      case message_types.disconnect:
        logger.log(`Disconnecting. Reason: ${reason}`);
        this.close({ allowReconnect: reconnect });
        this.subscriptions.notify(
          identifier,
          NOTIFICATION_CALLBACKS.DISCONNECTED,
        );
        break;
      case message_types.ping:
        this.monitor.recordPing();
        break;
      case message_types.confirmation:
        this.subscriptions.confirmSubscription(identifier);
        this.subscriptions.notify(identifier, NOTIFICATION_CALLBACKS.CONNECTED);
        break;
      case message_types.rejection:
        this.subscriptions.reject(identifier);
        break;
      default:
        this.subscriptions.notify(
          identifier,
          NOTIFICATION_CALLBACKS.RECEIVED,
          message,
        );
        break;
    }
  }

  onopen() {
    logger.log(
      `WebSocket onopen event, using '${this.getProtocol()}' subprotocol`,
    );
    this.disconnected = false;
    if (!this.isProtocolSupported()) {
      logger.log(
        'Protocol is unsupported. Stopping monitor and disconnecting.',
      );
      this.close({ allowReconnect: false });
    }
    return undefined;
  }

  onclose() {
    logger.log('WebSocket onclose event');
    if (this.disconnected) {
      return;
    }
    this.disconnected = true;
    this.monitor.recordDisconnect();
    this.subscriptions.notifyAll('disconnected', {
      willAttemptReconnect: this.monitor.isRunning(),
    });
  }

  // eslint-disable-next-line class-methods-use-this
  onerror() {
    logger.log('WebSocket onerror event');
  }
}
