// "use server";

// import { auth } from "@clerk/nextjs/server";
// import Stripe from "stripe";

// export const createStripeCheckout = async () => {
//   const { userId } = await auth();

//   if (!userId) {
//     throw new Error("Unauthorized");
//   }

//   if (!process.env.STRIPE_SECRET_KEY) {
//     throw new Error("Stripe secret key not found");
//   }

//   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//     apiVersion: "2024-10-28.acacia",
//   });

//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ["card"],
//     mode: "subscription",
//     success_url: "http://localhost:3000",
//     cancel_url: "http://localhost:3000",
//     subscription_data: {
//       metadata: {
//         clerk_user_id: userId,
//       },
//     },
//     line_items: [
//       {
//         price: process.env.STRIPE_PREMIUM_PLAN_PRICE_ID,
//         quantity: 1,
//       },
//     ],
//   });

//   return { sessionId: session.id };
// };
"use server";

import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";

export const createStripeCheckout = async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key not found");
  }

  if (!process.env.STRIPE_PREMIUM_PLAN_PRICE_ID) {
    throw new Error("Stripe price id not found");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",

    success_url: "http://localhost:3000",
    cancel_url: "http://localhost:3000",

    // 🔑 METADATA NA SESSION (OBRIGATÓRIO)
    metadata: {
      clerk_user_id: userId,
    },

    // 🔑 METADATA NA SUBSCRIPTION (BOA PRÁTICA)
    subscription_data: {
      metadata: {
        clerk_user_id: userId,
      },
    },

    line_items: [
      {
        price: process.env.STRIPE_PREMIUM_PLAN_PRICE_ID,
        quantity: 1,
      },
    ],
  });

  return {
    sessionId: session.id,
  };
};
