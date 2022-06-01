import ConnectionClass from '../connection';
import ConsumerClass from '../consumer';
import SubscriptionsClass from '../subscriptions';

declare global {
  type Connection = ConnectionClass;
  type Consumer = ConsumerClass;
  type Subscriptions = SubscriptionsClass;
}

export default {};
