const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/Booking");

/* ===============================
   INITIATE PAYMENT
================================ */

exports.initiatePayment = async (req, res) => {
  const { bookingId } = req.body;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: booking.payment.amount * 100, // ✅ correct field
      currency: "bdt",
      metadata: { bookingId: booking._id.toString() },
    });

    // ✅ save Stripe ID correctly
    booking.payment.transactionId = paymentIntent.id;
    booking.payment.status = "pending";
    await booking.save();

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   VERIFY PAYMENT
================================ */

exports.verifyPayment = async (req, res) => {
  const { paymentIntentId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId
    );

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    // ✅ correct lookup
    const booking = await Booking.findOne({
      "payment.transactionId": paymentIntentId,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // ✅ update payment fields correctly
    booking.payment.status = "completed";
    booking.payment.amountPaid = paymentIntent.amount / 100;
    booking.payment.paidAt = new Date();

    await booking.save();

    res.status(200).json({ message: "Payment successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
