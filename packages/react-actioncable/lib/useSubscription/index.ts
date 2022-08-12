import { useContext, useEffect, useMemo } from 'react';
import { ChannelNameWithParams, Mixin } from 'actioncable-rewired';

import { ActionCableContext } from '../ActionCableProvider';

export function useSubscription<T extends Mixin<T>>(
  channel: string | ChannelNameWithParams,
  obj: Mixin<T>,
) {
  const { consumer } = useContext(ActionCableContext);

  const subscription = useMemo(
    () => consumer.subscriptions.create<T>(channel, obj),
    [consumer, channel, obj],
  );

  useEffect(
    () => () => {
      subscription.unsubscribe();
    },
    [subscription],
  );

  return subscription;
}
