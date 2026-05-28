const Razorpay = require("razorpay");

const crypto = require("crypto");

const { Resend } = require("resend");

const ejs = require("ejs");

const path = require("path");

// ================= RESEND INSTANCE =================

const resend = new Resend(process.env.RESEND_API_KEY);

// ================= RAZORPAY INSTANCE =================

const razorpay = new Razorpay({

  key_id: process.env.RAZORPAY_KEY_ID,

  key_secret: process.env.RAZORPAY_SECRET,

});

// ================= CREATE ORDER =================

exports.createOrder = async (req, res) => {

  try {

    const { amount } = req.body;

    const options = {

      amount: amount * 100,

      currency: "INR",

      receipt: "receipt_order",

    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json(order);

  } catch (error) {

    console.log("CREATE ORDER ERROR =>", error);

    return res.status(500).json({

      success: false,

      message: "Order creation failed",

    });

  }

};

// ================= VERIFY PAYMENT =================

exports.verifyPayment = async (req, res) => {

  try {

    const {

      razorpay_order_id,

      razorpay_payment_id,

      razorpay_signature,

    } = req.body;

    const generated_signature = crypto

      .createHmac("sha256", process.env.RAZORPAY_SECRET)

      .update(razorpay_order_id + "|" + razorpay_payment_id)

      .digest("hex");

    if (generated_signature === razorpay_signature) {

      return res.status(200).json({

        success: true,

        message: "Payment Verified Successfully",

      });

    } else {

      return res.status(400).json({

        success: false,

        message: "Payment Verification Failed",

      });

    }

  } catch (error) {

    console.log("VERIFY PAYMENT ERROR =>", error);

    return res.status(500).json({

      success: false,

      message: "Server Error",

    });

  }

};

// ================= SEND ORDER MAIL =================

exports.sendOrderMail = async (req, res) => {

  try {

    const {

      user,

      carts,

      totalQty,

      totalPrice,

    } = req.body;

    // ================= EJS TEMPLATE =================

    const templatePath = path.join(

      __dirname,

      "../views/ordertemplate.ejs"

    );

    const html = await ejs.renderFile(templatePath, {

      user,

      carts,

      totalQty,

      totalPrice,

    });

    // ================= SEND MAIL =================

    const response = await resend.emails.send({

      from: "onboarding@resend.dev",

      to: user.email,

      subject: "Order Confirmed 🎉",

      html: html,

    });

    console.log("MAIL SENT SUCCESSFULLY");

    console.log(response);

    return res.status(200).json({

      success: true,

      message: "Order Mail Sent Successfully",

    });

  } catch (error) {

    console.log("MAIL ERROR =>", error);

    return res.status(500).json({

      success: false,

      message: "Mail Sending Failed",

      error: error.message,

    });

  }

};

// ================= EXPORT =================

module.exports = {
  createOrder: exports.createOrder,
  verifyPayment: exports.verifyPayment,
  sendOrderMail: exports.sendOrderMail,
};