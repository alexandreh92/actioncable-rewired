type CreateWebSocketURL = (url: string | (() => string)) => string;

export const createWebSocketURL: CreateWebSocketURL = (url) => {
  const newUrl = typeof url === 'function' ? url() : url;

  if (newUrl && !/^wss?:/i.test(newUrl)) {
    const a = document.createElement('a');
    a.href = newUrl;
    // Fix populating Location properties in IE. Otherwise, protocol will be blank.
    // eslint-disable-next-line no-self-assign
    a.href = a.href;
    a.protocol = a.protocol.replace('http', 'ws');
    return a.href;
  }
  return newUrl;
};
