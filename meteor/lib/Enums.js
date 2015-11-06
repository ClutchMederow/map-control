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

  LogType: {
    DEBIT: 'DEBIT', //removing money from their IronBucks account
    CREDIT: 'CREDIT', //adding money to their IronBucks account
    TRADE: 'TRADE', //trade between 2 players
    AUDIT: 'AUDIT', //internal audit
    SALE: "SALE", //selling an item
    BUY: "BUY",  //buying an item
    FEE: "FEE" //our DL fee
  },

  ChatType: {
    TRADE: 'TRADE',
    CHAT: 'CHAT'
  }
};

TradeStatus = {
  success: "SUCCESSFUL",
  failed: "FAILURE"
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
  }
};
