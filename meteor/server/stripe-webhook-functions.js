stripeCreateInvoice = function(request){
  var getUser = Meteor.users.findOne({"customerId": request.customer}, {fields: {"_id": 1, "emails.address": 1}});

  if (getUser){
    var invoiceItem = request.lines.data[0];
    var totalAmount = request.total;

    if (totalAmount > 0) {
      // Setup an invoice object.
      var invoice = {
        owner: getUser._id,
        email: getUser.emails[0].address,
        date: request.date,
        planId: invoiceItem.plan.id,
        ends: invoiceItem.period.end,
        amount: totalAmount,
        transactionId: Random.hexString(10)
      };

      Invoices.insert(invoice, function(error, response){
        if (error){
          console.log(error);
        }
      });
    }
  }
};
