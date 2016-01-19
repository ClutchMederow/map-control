var SteamConstants = {
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
      maxOffersOut: 'There was an error sending your trade offer.  Please try again later.<br><br>You cannot trade with',
    },
  },
};

module.exports = SteamConstants;