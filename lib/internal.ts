const internalVars = {
  message_types: {
    welcome: 'welcome',
    disconnect: 'disconnect',
    ping: 'ping',
    confirmation: 'confirm_subscription',
    rejection: 'reject_subscription',
  },
  disconnect_reasons: {
    unauthorized: 'unauthorized',
    invalid_request: 'invalid_request',
    server_restart: 'server_restart',
    remote: 'remote',
  },
  default_mount_path: '/cable',
  protocols: ['actioncable-v1-json', 'actioncable-unsupported'],
};

export type InternalVars = typeof internalVars;
export type MessageTypes = keyof typeof internalVars.message_types;
export type DisconnectReasonType = keyof typeof internalVars.disconnect_reasons;
export type Protocols = keyof typeof internalVars.protocols;

export default internalVars;
