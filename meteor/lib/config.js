Config = {
  bots: {
    newBotRetries: 5,
    maxBotInventory: 1000,
    maxFullPercentage: 0.75,

    // in seconds
    maxInventoryCacheTime: 60,
    maxActiveOfferTime: 2*60,

    // in ms
    checkOutstandingInterval: 30000,
    maxOffersRetryInterval: 30000,
    maxOutstandingOffersSent: 30,
  },

  tradingFloor: {
    defaultChannel: 'Trading Floor'
  },

  contactInfo: {
    email: "deltaveelabs@gmail.com"
  },

  financial: {
    fee: 0.1,
    unitPriceMax: 2000,
    maxTimePeriod: 3, //days
    maxAddAmount: 1000, //usd
    maxWithdrawAmount: 1000, //usd
  },

  youtube: {
    tutorialChannels: ['TheWarOwl', '3kliksphilip', 'adreN_TV'],
    proMatches: ['ESEA', 'ESL', 'FACEITvods', 'csgo.StarLadder.tv','DreamHack','playCEVO']
  },
};

Constants = {
  tradeOfferURL: 'https://steamcommunity.com/tradeoffer/',
  steamCDN: 'https://steamcommunity-a.akamaihd.net/economy/image/',
  tradeURL: 'https://steamcommunity.com/id/meatsting/tradeoffers/privacy',
  editProfile: 'https://steamcommunity.com/profiles/CONST_STEAM_ID/edit/settings',
  getItemAttributesURL: 'http://api.steampowered.com/IEconItems_730/GetPlayerItems/v0001/?key=STEAM_API_KEY&SteamID=CONST_STEAM_ID'
};

