var Config = {
  bots: {
    newBotRetries: 5,
    maxBotInventory: 1000,
    maxFullPercentage: 0.75,

    // in seconds
    maxInventoryCacheTime: 60,
    maxActiveOfferTime: 5*60,

    // in ms
    checkOutstandingInterval: 30000,
    maxOffersRetryInterval: 30000,
    maxOutstandingOffersSent: 30,
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
  }
};

module.exports = Config;