var Constants = {
  jobType: {
    DEPOSIT_ITEMS: 'DEPOSIT_ITEMS',
    WITHDRAW_ITEMS: 'WITHDRAW_ITEMS',
    INTERNAL_TRANSFER: 'INTERNAL_TRANSFER',
    ACCEPT_OFFER: 'ACCEPT_OFFER',
    TASK: 'TASK'
  },

  jobStatus: {
    COMPLETE: 'COMPLETE',
    FAILED: 'FAILED',
    ROLLBACK_FAILED: 'ROLLBACK_FAILED',
    QUEUED: 'QUEUED',
    PENDING: 'PENDING',
    READY: 'READY',
    CANCELLED: 'CANCELLED',
    TIMEOUT: 'TIMEOUT'
  },

  tradeOfferURL: 'https://steamcommunity.com/tradeoffer/',
  steamCDN: 'https://steamcommunity-a.akamaihd.net/economy/image/',
  tradeURL: 'https://steamcommunity.com/id/meatsting/tradeoffers/privacy',
  editProfile: 'https://steamcommunity.com/profiles/CONST_STEAM_ID/edit/settings',
  getItemAttributesURL: 'http://api.steampowered.com/IEconItems_730/GetPlayerItems/v0001/?key=STEAM_API_KEY&SteamID=CONST_STEAM_ID'
};

module.exports = Constants;
