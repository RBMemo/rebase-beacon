const Web3 = require('web3');
const Web3WsProvider = require('web3-providers-ws');
const { logger } = require('./logger');
const { sendMessage } = require('./sqs');
const MemoController = require('@splitbase-dev/contracts/deployments/mainnet/RBPoolController.json');

const AVAX_WS_URL = 'wss://api.avax.network/ext/bc/C/ws';
const MEMO_ADDRESS = '0x136Acd46C134E8269052c62A67042D6bDeDde3C9';
const MEMO_REBASE_TOPIC = '0x6012dbce857565c4a40974aa5de8373a761fc429077ef0c8c8611d1e20d63fb2';
const TOKEN_CONTROLLER = {
  MEMO_ADDRESS: MemoController.address
}
const PROVIDER_OPTIONS = {
  timeout: 30000, // ms
  clientConfig: {
    keepalive: true,
    keepaliveInterval: 60000 // ms
  },
  reconnect: {
    auto: true,
    delay: 5000, // ms
    maxAttempts: 10,
    onTimeout: false
  }
};

class Connection {
  web3;
  connected = false;
  subscription;
  ws_provider;

  constructor() {
    this.init();
  }
  
  init() {
    this.ws_provider = new Web3WsProvider(AVAX_WS_URL, PROVIDER_OPTIONS);
    this.web3 = new Web3(this.ws_provider);
    this.subscription = this.web3.eth.subscribe('logs', {
      address: MEMO_ADDRESS,
      topics: [MEMO_REBASE_TOPIC]
    })
    .on('connected', this.#onConected.bind(this))
    .on('error', this.#onError.bind(this))
    .on('data', this.#onData.bind(this))
    .on('changed', this.#onChanged.bind(this));
  }

  #onConected(subId) {
    this.connected = true;
    logger.info(`[Connection] Log subscription connected successfully with subId=${subId}`);
  }

  #onError(obj) {
    logger.error(`[Connection] Error with subId=${this.subscription.id}, reinitializing...`, obj);
    this.connected = false;
    this.init();
  }

  #onChanged(obj) {
    logger.warn('[Connection] Changed reached', obj);
  }
  
  #onData(obj) {
    logger.info('[Connection] Rebase detected');
    sendMessage({
      tokenAddress: obj.address,
      controllerAddress: TOKEN_CONTROLLER[obj.address]
    });
  }
}

module.exports = { Connection };
