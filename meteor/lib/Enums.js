Enums = {
  ItemStatus: {
    PENDING_DEPOSIT: 'PENDING_DEPOSIT',
    PENDING_WITHDRAWAL: 'PENDING_WITHDRAWAL',
    STASH: 'STASH',
    EXTERNAL: 'EXTERNAL'
  },

  TransType: {
    WITHDRAW: 'WITHDRAW',
    DEPOSIT: 'DEPOSIT'
  },

  TransStage: {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    DECLINED: 'DECLINED',
    CANCELED: 'CANCELED'
  },

  LogType: {
    DEBIT: 'DEBIT', //removing money from their IronBucks account
    CREDIT: 'CREDIT', //adding money to their IronBucks account
    TRADE: 'TRADE', //trade between 2 players
    AUDIT: 'AUDIT', //internal audit
    SALE: 'SALE', //selling an item
    BUY: 'BUY',  //buying an item
    FEE: 'FEE', //our DL fee
    ERROR: 'ERROR', //an error
    MOVE_ITEM: 'MOVE_ITEM',
  },

  ChatType: {
    TRADE: 'TRADE',
    CHAT: 'CHAT',
  },

  TradeCloseReason: {
    CANCELED: 'CANCELED',
    ITEM_NOT_AVAILABLE: 'ITEM_NOT_AVAILABLE'
  },

  Environments: {
    DEV: 'dev',
    QA: 'qa',
    PROD: 'prod'
  },

  MeteorError: {
    PRIVATE_INVENTORY: 'PRIVATE_INVENTORY',
    BAD_HTTP: 'BAD_HTTP',
    NEGATIVE_IRONBUCKS: 'NEGATIVE_IRONBUCKS',
    UNIT_PRICE_MAC_EXCEEDED: 'UNIT_PRICE_MAC_EXCEEDED',
    INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
    EXCEEDED_DEPOSIT_RATE: 'EXCEEDED_DEPOSIT_RATE',
    EXCEEDED_WITHDRAWAL_RATE: 'EXCEEDED_WITHDRAWAL_RATE',
    INVALID_TOKEN: 'INVALID_TOKEN',
    DECLINED_TRADE: 'DECLINED_TRADE',
    MAX_OFFERS_OUT: 'MAX_OFFERS_OUT',
  },
};

TradeStatus = {
  success: 'SUCCESSFUL',
  failed: 'FAILURE'
};

SteamConstants = {
  offerStatus: {
    1: 'k_ETradeOfferStateInvalid',
    2: 'k_ETradeOfferStateActive',
    3: 'k_ETradeOfferStateAccepted',
    4: 'k_ETradeOfferStateCountered',
    5: 'k_ETradeOfferStateExpired',
    6: 'k_ETradeOfferStateCanceled',
    7: 'k_ETradeOfferStateDeclined',
    8: 'k_ETradeOfferStateInvalidItems',
    9: 'k_ETradeOfferStateEmailPending',
    10: 'k_ETradeOfferStateEmailCanceled'
  },

  steamApi: {
    errors: {
      privateProfile: 'This profile is private.',
    },
  },
};
