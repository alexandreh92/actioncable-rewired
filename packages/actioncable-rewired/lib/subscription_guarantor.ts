import logger from './logger';
import Subscription from './subscription';
import Subscriptions from './subscriptions';

// Responsible for ensuring channel subscribe command is confirmed, retrying until confirmation is received.
// Internal class, not intended for direct user manipulation.

class SubscriptionGuarantor {
  subscriptions: Subscriptions;
  pendingSubscriptions: Subscription[];
  retryTimeout?: NodeJS.Timeout;

  constructor(subscriptions: Subscriptions) {
    this.subscriptions = subscriptions;
    this.pendingSubscriptions = [];
    this.retryTimeout = undefined;
  }

  guarantee(subscription: Subscription) {
    if (this.pendingSubscriptions.indexOf(subscription) === -1) {
      logger.log(
        `SubscriptionGuarantor guaranteeing ${subscription.identifier}`,
      );
      this.pendingSubscriptions.push(subscription);
    } else {
      logger.log(
        `SubscriptionGuarantor already guaranteeing ${subscription.identifier}`,
      );
    }
    this.startGuaranteeing();
  }

  forget(subscription: Subscription) {
    logger.log(`SubscriptionGuarantor forgetting ${subscription.identifier}`);
    this.pendingSubscriptions = this.pendingSubscriptions.filter(
      (s) => s !== subscription,
    );
  }

  startGuaranteeing() {
    this.stopGuaranteeing();
    this.retrySubscribing();
  }

  stopGuaranteeing() {
    clearTimeout(this.retryTimeout);
  }

  retrySubscribing() {
    this.retryTimeout = setTimeout(() => {
      if (
        this.subscriptions &&
        typeof this.subscriptions.subscribe === 'function'
      ) {
        this.pendingSubscriptions.map((subscription) => {
          logger.log(
            `SubscriptionGuarantor resubscribing ${subscription.identifier}`,
          );
          this.subscriptions.subscribe(subscription);
          return undefined;
        });
      }
    }, 500);
  }
}

export default SubscriptionGuarantor;
