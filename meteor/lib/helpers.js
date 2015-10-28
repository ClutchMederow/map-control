roundCurrency = function(amount) {
      //need amount in valid USD, i.e. 2 decimal places max
      //http://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-in-javascript for more details
      return +(Math.round(amount + "e+2") + "e-2");
};
