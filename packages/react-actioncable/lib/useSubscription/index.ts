import { useContext, useEffect, useMemo } from 'react';

import { ActionCableContext } from '../ActionCableProvider';

export function useSubscription<T extends ActionCable.CreateMixin>(
  channel: string | ActionCable.ChannelNameWithParams,
  obj?: T & ThisType<ActionCable.Channel>,
) {
  const { consumer } = useContext(ActionCableContext);

  const subscription = useMemo(
    () => consumer.subscriptions.create(channel, obj),
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
