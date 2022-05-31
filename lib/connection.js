import { w3cwebsocket as WebSocket } from "websocket";

import ConnectionMonitor from "./connection_monitor";

import logger from "./logger";
import INTERNAL from "./internal";

const { message_types, protocols } = INTERNAL;
const supportedProtocols = protocols.slice(0, protocols.length - 1);
const defaultProtocol = INTERNAL.protocols[0];

export const CONNECTION_STATE = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
};

export const CONNECTION_STATE_MAPPING = Object.entries(CONNECTION_STATE).reduce(
  (acc, [key, value]) => {
    acc[value] = key;
    return acc;
  },
  {}
);

const indexOf = [].indexOf;

export default class Connection {
  constructor(consumer) {
    this.open = this.open.bind(this);
    this.consumer = consumer;
    this.subscriptions = this.consumer.subscriptions;
    this.disconnected = true;
    this.monitor = new ConnectionMonitor(this);
    this.webSocket = undefined;
  }

  send(data) {
    if (this.isOpen()) {
      this.webSocket.send(JSON.stringify(data));
      return true;
    } else {
      return false;
    }
  }

  open() {
    if (this.isActive()) {
      logger.log(
        `Attempted to open WebSocket, but existing socket is ${this.getState()}`
      );
      return false;
    }

    if (this.webSocket) {
      this.uninstallEventHandlers();
    }

    logger.log(
      `Opening WebSocket, current state is ${this.getState()}, subprotocols: ${protocols}`
    );
    this.webSocket = new WebSocket(this.consumer.url, defaultProtocol);
    this.installEventHandlers();
    this.monitor.start();
    return true;
  }

  close({ allowReconnect } = { allowReconnect: true }) {
    if (!allowReconnect) {
      this.monitor.stop();
    }
    if (this.isOpen()) {
      return this.webSocket?.close();
    }
  }

  reopen() {
    logger.log(`Reopening WebSocket, current state is ${this.getState()}`);
    if (this.isActive()) {
      try {
        return this.close();
      } catch (error) {
        logger.log("Failed to reopen WebSocket", error);
      } finally {
        logger.log(`Reopening WebSocket in ${this.constructor.reopenDelay}ms`);
        setTimeout(this.open, this.constructor.reopenDelay);
      }
    } else {
      return this.open();
    }
  }

  getProtocol() {
    if (this.webSocket) {
      return this.webSocket.protocol;
    }
  }

  isOpen() {
    return this.isState(CONNECTION_STATE.OPEN);
  }

  isActive() {
    return this.isState(CONNECTION_STATE.OPEN, CONNECTION_STATE.CONNECTING);
  }

  // Private

  isProtocolSupported() {
    return indexOf.call(supportedProtocols, this.getProtocol()) >= 0;
  }

  isState(...states) {
    return states.some((state) => state === this.getState());
  }

  getState() {
    return this.webSocket?.readyState;
  }

  installEventHandlers() {
    for (let eventName in this.events) {
      const handler = this.events[eventName].bind(this);
      this.webSocket[`on${eventName}`] = handler;
    }
  }

  uninstallEventHandlers() {
    for (let eventName in this.events) {
      this.webSocket[`on${eventName}`] = () => undefined;
    }
  }
}

Connection.prototype.events = {
  message(event) {
    if (!this.isProtocolSupported()) {
      return;
    }

    const { identifier, message, reason, reconnect, type } = JSON.parse(
      event.data
    );
    switch (type) {
      case message_types.welcome:
        this.monitor.recordConnect();
        return this.subscriptions.reload();
      case message_types.disconnect:
        logger.log(`Disconnecting. Reason: ${reason}`);
        return this.close({ allowReconnect: reconnect });
      case message_types.ping:
        return this.monitor.recordPing();
      case message_types.confirmation:
        this.subscriptions.confirmSubscription(identifier);
        return this.subscriptions.notify(identifier, "connected");
      case message_types.rejection:
        return this.subscriptions.reject(identifier);
      default:
        return this.subscriptions.notify(identifier, "received", message);
    }
  },

  open() {
    logger.log(
      `WebSocket onopen event, using '${this.getProtocol()}' subprotocol`
    );
    this.disconnected = false;
    if (!this.isProtocolSupported()) {
      logger.log(
        "Protocol is unsupported. Stopping monitor and disconnecting."
      );
      return this.close({ allowReconnect: false });
    }
  },

  close() {
    logger.log("WebSocket onclose event");
    if (this.disconnected) {
      return;
    }
    this.disconnected = true;
    this.monitor.recordDisconnect();
    return this.subscriptions.notifyAll("disconnected", {
      willAttemptReconnect: this.monitor.isRunning(),
    });
  },

  error() {
    logger.log("WebSocket onerror event");
  },
};
