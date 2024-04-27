import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/libs/prismadb";
import { get } from "lodash";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No Singature" });
  }

  const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
    typescript: true,
    apiVersion: "2024-04-10",
  });

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    return NextResponse.json({ error: err });
  }

  let customerDetails;
  let customerEmail;

  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntentSucceeded = event.data.object;
      customerDetails = await stripe.customers.retrieve(
        paymentIntentSucceeded?.customer as string
      );
      customerEmail = get(customerDetails, "email", "");
      await prisma.user.update({
        where: {
          email: customerEmail,
        },
        data: {
          activeSubscription: true,
        },
      });
      break;
    case "customer.subscription.updated":
      const customerSubscriptionUpdated = event.data.object;
      customerDetails = await stripe.customers.retrieve(
        customerSubscriptionUpdated?.customer as string
      );
      customerEmail = get(customerDetails, "email", "");
      if (customerSubscriptionUpdated.cancel_at === null) {
        const user = await prisma.user.findUnique({
          where: { email: customerEmail },
        });
        const updatedQuantity =
          get(customerSubscriptionUpdated, "quantity", 0) ===
          get(customerDetails, "metadata.subscribedTokenQuantity", 0)
            ? get(customerSubscriptionUpdated, "quantity", 0) +
              (user?.token || 0)
            : get(customerSubscriptionUpdated, "quantity", 0) -
              get(customerDetails, "metadata.subscribedTokenQuantity", 0) +
              (user?.token || 0);
        await prisma.user.update({
          where: {
            email: customerEmail,
          },
          data: {
            token: updatedQuantity,
          },
        });
        await stripe.customers.update(customerDetails.id, {
          metadata: {
            subscribedTokenQuantity: get(
              customerSubscriptionUpdated,
              "quantity",
              0
            ),
          },
        });
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ activate: true });
}
