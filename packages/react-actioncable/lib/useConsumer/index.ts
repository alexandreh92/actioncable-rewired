import { useContext } from 'react';

import { ActionCableContext } from '../ActionCableProvider';

export function useConsumer() {
  return useContext(ActionCableContext);
}
