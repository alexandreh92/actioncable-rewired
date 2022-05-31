import ConnectionClass from '../connection';
import ConsumerClass from '../consumer';
import SubscriptionsClass from '../subscriptions';

declare global {
  type Connection = ConnectionClass;
  type Consumer = ConsumerClass;
  type Subscriptions = SubscriptionsClass;

  interface Events extends Partial<Connection> {
    message(event: any): void;
    open(): void;
    close(): void;
    error(): void;
  }
}

export default {};
