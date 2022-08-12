import React, {
  createContext,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from 'react';

import { Consumer, createConsumer } from 'actioncable-rewired';

interface ActionCableContextProps {
  consumer: Consumer;
}

export const ActionCableContext = createContext<ActionCableContextProps>(
  {} as ActionCableContextProps,
);

interface ActionCableProviderProps {
  children: React.ReactNode;
  url: string;
}

interface ActionCableProviderHandles {
  consumer: Consumer;
}

export const ActionCableProvider = forwardRef<
  ActionCableProviderHandles,
  ActionCableProviderProps
>(({ children, url }, ref) => {
  const consumer = useMemo(() => createConsumer(url), [url]);

  const value = useMemo(
    () => ({
      consumer,
    }),
    [consumer],
  );

  useImperativeHandle(ref, () => ({ consumer }), [consumer]);

  return (
    <ActionCableContext.Provider value={value}>
      {children}
    </ActionCableContext.Provider>
  );
});
