const express = require("express");
const paymentRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../model/payment");
const { membershipAmount } = require("../utils/constants");
const { addDays } = require("date-fns");

const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const User = require("../model/user");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { planType } = req.body;
    const { firstName, lastName, emailId } = req.user;

    console.log("💰 Creating payment order for:", {
      planType,
      userId: req.user._id,
      userEmail: emailId,
    });

    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[planType],
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType: planType,
      },
    });

    console.log("📋 Razorpay order created:", order);

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();
    console.log("💾 Payment saved to database:", savedPayment);

    res.json({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.log("💥 Payment creation error:", err);
    res.status(500).json({
      message: "Cannot create order: " + err.message,
    });
  }
});

paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    const webhookSignature = req.get("X-Razorpay-Signature");

    // Skip signature validation for debugging (REMOVE IN PRODUCTION)
    console.log("⚠️ SKIPPING WEBHOOK SIGNATURE VALIDATION FOR DEBUGGING");

    // Uncomment below for production
    const isWebHookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isWebHookValid) {
      console.log("❌ Webhook signature validation failed");
      return res.status(400).json({ message: "WebHook Invalid" });
    }

    console.log("✅ Proceeding with webhook processing");

    // Check if this is a payment captured event
    if (req.body.event !== "payment.captured") {
      console.log(`ℹ️ Ignoring event: ${req.body.event}`);
      return res.status(200).json({ message: "Event ignored" });
    }

    // update payment status.
    const paymentDetails = req.body.payload.payment.entity;
    console.log("💳 Payment details:", paymentDetails);

    const payment = await Payment.findOne({ orderId: paymentDetails.order_id });

    if (!payment) {
      console.log(
        "❌ Payment not found for order ID:",
        paymentDetails.order_id
      );
      return res.status(404).json({ message: "Payment not found" });
    }

    console.log("📄 Found payment:", payment);

    payment.status = paymentDetails.status;
    payment.paymentId = paymentDetails.id;
    await payment.save();

    console.log("💾 Payment status updated");

    const user = await User.findOne({ _id: payment.userId });

    if (!user) {
      console.log("❌ User not found for ID:", payment.userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("👤 Found user before update:", {
      id: user._id,
      isPremium: user.isPremium,
      planType: user.planType,
      planExpiry: user.planExpiry,
    });

    console.log("🔍 Payment notes:", payment.notes);

    user.isPremium = true;
    user.planType = "basic";
    user.planExpiry = addDays(new Date(), 30);

    console.log("👤 User data before save:", {
      id: user._id,
      isPremium: user.isPremium,
      planType: user.planType,
      planExpiry: user.planExpiry,
    });

    await user.save();

    console.log("✅ User updated successfully");

    // Verify the update
    const updatedUser = await User.findOne({ _id: payment.userId });
    console.log("🔍 User after update:", {
      id: updatedUser._id,
      isPremium: updatedUser.isPremium,
      planType: updatedUser.planType,
      planExpiry: updatedUser.planExpiry,
    });

    res.status(200).json({
      message: "Webhook processed successfully",
      user: {
        isPremium: updatedUser.isPremium,
        planType: updatedUser.planType,
        planExpiry: updatedUser.planExpiry,
      },
    });
  } catch (err) {
    console.log("💥 Webhook error:", err);
    res.status(500).json({
      message: "WebHook call failed: " + err.message,
    });
  }
});

paymentRouter.get("/premium/verify", userAuth, async (req, res) => {
  const user = req.user;
  console.log("🔍 Premium verification for user:", {
    id: user._id,
    isPremium: user.isPremium,
    planType: user.planType,
  });

  if (user.isPremium) {
    res.json({
      isPremium: true,
      planType: user.planType,
      planExpiry: user.planExpiry,
    });
  } else {
    res.json({ isPremium: false });
  }
});

module.exports = paymentRouter;
