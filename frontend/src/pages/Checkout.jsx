import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import { useParams } from "react-router-dom";

// Use your STRIPE PUBLISHABLE KEY here (pk_test_...)
// Optionally, use environment variables for security purposes
const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY || "pk_test_51SmH8RLx6ZpJo8bKJPDb9vU7C3Pt1oZW994gHZqTqWyMGQ2T64ytiODZxf4TLf8HtSORQAeYuC8K4LUGAFV1o1On00ew8ouopk";  // Use your actual key here
const stripePromise = loadStripe(stripePublicKey);


const CheckoutForm = () => {
  const { bookingId } = useParams();  // Get bookingId from URL
  const stripe = useStripe();
  const elements = useElements();

  const handlePay = async () => {
    try {
      // 1️⃣ Initiate payment (Backend call)
      const { data } = await axios.post(
        "/api/payment/initiate",
        { bookingId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // 2️⃣ Confirm card payment with Stripe (using clientSecret)
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      // 3️⃣ Handle the payment result
      if (result.error) {
        // Payment failed
        console.error(result.error.message);
        window.location.href = "/payment-failed";
        return;
      }

      if (result.paymentIntent.status === "succeeded") {
        // 4️⃣ Verify payment (Backend call)
        await axios.post(
          "/api/payment/verify",
          { paymentIntentId: result.paymentIntent.id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // 5️⃣ Redirect to success page
        window.location.href = "/payment-success";
      }
    } catch (error) {
      console.error(error);
      window.location.href = "/payment-failed";
    }
  };

  return (
    <div>
      <h2>Checkout for Booking ID: {bookingId}</h2> {/* Show the dynamic bookingId */}
      <CardElement /> {/* Stripe Card Element */}
      <button onClick={handlePay} disabled={!stripe}>Pay Now</button> {/* Disable if Stripe is not loaded */}
    </div>
  );
};

export default function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm /> {/* Stripe form with payment */}
    </Elements>
  );
}
