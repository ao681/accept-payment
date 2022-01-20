const express = require("express");
const app = express();
const { resolve } = require("path");
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.secret_key); // https://stripe.com/docs/keys#obtain-api-keys

app.use(express.static("."));
app.use(express.json());

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

// An endpoint for your checkout
app.post("/checkout", async (req, res) => {
  // Create or retrieve the Stripe Customer object associated with your user.
  let customer = await stripe.customers.create(); // This example just creates a new Customer every time
  
  
  var description = req.body.description
  var currency = req.body.currency
  var token = req.body.stripeToken
  var amount = req.body.amount
  
    
  // Create an ephemeral key for the Customer; this allows the app to display saved payment methods and save new ones
  const ephemeralKey = await stripe.ephemeralKeys.create(
    {customer: customer.id},
    {apiVersion: '2020-08-27'}
  ); 


    
  // Create a PaymentIntent with the payment amount, currency, and customer
  const paymentIntent = await stripe.paymentIntents.create({
    
  
    amount: amount,
    currency: "usd",
    customer: customer.id
  });
  
  
  console.log(req.body)

  stripe.charges.create({
    source: token,
    amount: amount,
    currency: currency,
    description: description

  }, function(err, charge) {
    if(err) {
      console.log(err, req.body)
      res.status(500).end()
    } else {
      console.log('success')
      res.status(200).send()
    }
  })

  // Send the object keys to the client
  res.send({
    publishableKey: process.env.publishable_key, // https://stripe.com/docs/keys#obtain-api-keys
    paymentIntent: paymentIntent.client_secret,
    customer: customer.id,
    ephemeralKey: ephemeralKey.secret
  });
});


app.listen(process.env.PORT, () =>
  console.log(`Node server listening on port ${process.env.PORT}!`)
);
