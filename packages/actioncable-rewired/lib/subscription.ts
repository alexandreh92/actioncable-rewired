/* eslint-disable no-param-reassign */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable padded-blocks */
/* eslint-disable @typescript-eslint/ban-ts-comment */

// A new subscription is created through the ActionCable.Subscriptions instance available on the consumer.
// It provides a number of callbacks and a method for calling remote procedure calls on the corresponding
// Channel instance on the server side.
//
// An example demonstrates the basic functionality:
//
//   App.appearance = App.cable.subscriptions.create("AppearanceChannel", {
//     connected() {
//       // Called once the subscription has been successfully completed
//     },
//
//     disconnected({ willAttemptReconnect: boolean }) {
//       // Called when the client has disconnected with the server.
//       // The object will have an `willAttemptReconnect` property which
//       // says whether the client has the intention of attempting
//       // to reconnect.
//     },
//
//     appear() {
//       this.perform('appear', {appearing_on: this.appearingOn()})
//     },
//
//     away() {
//       this.perform('away')
//     },
//
//     appearingOn() {
//       $('main').data('appearing-on')
//     }
//   })
//
// The methods #appear and #away forward their intent to the remote AppearanceChannel instance on the server
// by calling the `perform` method with the first parameter being the action (which maps to AppearanceChannel#appear/away).
// The second parameter is a hash that'll get JSON encoded and made available on the server in the data parameter.
//
// This is how the server component would look:
//
//   class AppearanceChannel < ApplicationActionCable::Channel
//     def subscribed
//       current_user.appear
//     end
//
//     def unsubscribed
//       current_user.disappear
//     end
//
//     def appear(data)
//       current_user.appear on: data['appearing_on']
//     end
//
//     def away
//       current_user.away
//     end
//   end
//
// The "AppearanceChannel" name is automatically mapped between the client-side subscription creation and the server-side Ruby class name.
// The AppearanceChannel#appear/away public methods are exposed automatically to client-side invocation through the perform method.

import { Mixin } from './@types';
import Consumer from './consumer';

// @ts-ignore
const extend = (object, properties) => {
  if (properties != null) {
    for (const key in properties) {
      const value = properties[key];
      object[key] = value;
    }
  }
  return object;
};

export default class Subscription<T = any> {
  consumer: Consumer;
  identifier: string;

  constructor(
    consumer: Consumer,
    // eslint-disable-next-line default-param-last
    params: Record<string, unknown> = {},
    mixin: Mixin<T>,
  ) {
    this.consumer = consumer;
    this.identifier = JSON.stringify(params);
    extend(this, mixin);
  }

  // Perform a channel action with the optional data passed as an attribute
  perform(action: string, data: Record<string, unknown> = {}): boolean {
    const newData = data;
    newData.action = action;
    return this.send(newData);
  }

  send(data: Record<string, unknown>): boolean {
    return this.consumer.send({
      command: 'message',
      identifier: this.identifier,
      data: JSON.stringify(data),
    });
  }

  unsubscribe(): Subscription<T> {
    return this.consumer.subscriptions.remove(this);
  }
}
