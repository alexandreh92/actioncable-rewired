import { ChangeEvent, useRef, useState } from 'react';

import { createConsumer, logger } from 'actioncable-rewired';

import Subscription from 'actioncable-rewired/dist/subscription';

logger.enabled = true;

function App() {
  const subscriptionRef = useRef<Subscription>();

  const [url, setUrl] = useState('ws://localhost:3000/api/websockets');
  const [channel, setChannel] = useState('ChatChannel');
  const [params, setParams] = useState('');
  const [subscriptionMessages, setSubscriptionMessages] = useState<string[]>(
    [],
  );
  const [loggerMessages, setLoggerMessages] = useState<string[]>([]);

  const handleOnUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleOnChannelChange = (e: ChangeEvent<HTMLInputElement>) => {
    setChannel(e.target.value);
  };

  const handleOnParamsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setParams(e.target.value);
  };

  const handleOnCreateSubscription = () => {
    const consumer = createConsumer(url);

    subscriptionRef.current = consumer.subscriptions.create(channel, {
      connected: () => {
        setLoggerMessages((oldState) => [
          ...oldState,
          `${Date.now().toString()} - ${JSON.stringify('connected')}`,
        ]);
      },
      received: (data: any) => {
        setSubscriptionMessages((oldState) => [
          ...oldState,
          `${Date.now().toString()} - ${JSON.stringify(data)}`,
        ]);
      },
    });
  };

  const handleOnSubscribe = () => {
    subscriptionRef.current?.unsubscribe();
  };

  return (
    <div>
      <input name="url" value={url} onChange={handleOnUrlChange} />
      <input name="channel" value={channel} onChange={handleOnChannelChange} />
      <input name="params" value={params} onChange={handleOnParamsChange} />
      <button type="button" onClick={handleOnCreateSubscription}>
        Create subscription
      </button>
      <button type="button" onClick={handleOnSubscribe}>
        Unsubscribe
      </button>
      <button type="button">Send</button>
      <textarea
        name="loggerMessages"
        value={loggerMessages.join('\r\n')}
        readOnly
      />
      <textarea
        name="subscriptionMessages"
        value={subscriptionMessages.join('\r\n')}
        readOnly
      />
    </div>
  );
}

export default App;
