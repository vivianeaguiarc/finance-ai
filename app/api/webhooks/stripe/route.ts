
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const POST = async (request: Request) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ received: true });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ received: true });
  }

  const payload = await request.text();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-10-28.acacia",
  });

  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const clerkUserId =
        session.metadata?.clerk_user_id;

      if (!clerkUserId) {
        return NextResponse.json({ received: true });
      }

      await clerkClient().users.updateUser(clerkUserId, {
        privateMetadata: {
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
        },
        publicMetadata: {
          subscriptionPlan: "premium",
        },
      });

      break;
    }
    case "customer.subscription.deleted": {
        // Remover plano premium do usuário
        const subscription = await stripe.subscriptions.retrieve(
          event.data.object.id,
        );
        const clerkUserId = subscription.metadata.clerk_user_id;
        if (!clerkUserId) {
          return NextResponse.error();
        }
        await clerkClient().users.updateUser(clerkUserId, {
          privateMetadata: {
            stripeCustomerId: null,
            stripeSubscriptionId: null,
          },
          publicMetadata: {
            subscriptionPlan: null,
          },
        });
      }
  }

  return NextResponse.json({ received: true });
};
