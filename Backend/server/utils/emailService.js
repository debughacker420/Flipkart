const nodemailer = require('nodemailer')

// ════════════════════════════════════════
// TRANSPORTER SETUP
// ════════════════════════════════════════

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Verify transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service error:', error.message)
  } else {
    console.log('✅ Email service ready')
  }
})

// ════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function getDeliveryDate(orderDate) {
  const date = new Date(orderDate)
  date.setDate(date.getDate() + 5)
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}

function calculateMRP(items) {
  return items.reduce((sum, item) =>
    sum + (item.price * item.quantity), 0)
}

function calculateSavings(items, totalAmount) {
  const mrp = calculateMRP(items)
  return Math.max(0, mrp - totalAmount)
}

// ════════════════════════════════════════
// HTML EMAIL TEMPLATE FUNCTION
// ════════════════════════════════════════

function generateOrderEmailHTML(order) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width">
  <title>Order Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#F1F3F6;font-family:Arial,sans-serif;">

  <!-- WRAPPER -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F3F6;padding:20px 0;">
  <tr><td align="center">

  <!-- EMAIL CONTAINER 600px -->
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

    <!-- ① HEADER — Flipkart Blue -->
    <tr>
      <td style="background:#2874F0;padding:16px 24px;border-radius:4px 4px 0 0;">
        <table width="100%">
          <tr>
            <td>
              <span style="color:#fff;font-size:24px;font-weight:bold;font-style:italic;">Flipkart</span>
              <span style="color:#F9A825;font-size:11px;display:block;margin-top:2px;">★ Explore Plus</span>
            </td>
            <td align="right">
              <span style="color:#fff;font-size:13px;">Order Confirmation</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ② SUCCESS BANNER — Green -->
    <tr>
      <td style="background:#388E3C;padding:20px 24px;text-align:center;">
        <div style="color:#fff;font-size:28px;margin-bottom:6px;">✓</div>
        <div style="color:#fff;font-size:18px;font-weight:bold;">Order Placed Successfully!</div>
        <div style="color:#c8e6c9;font-size:13px;margin-top:4px;">Thank you for shopping with Flipkart</div>
      </td>
    </tr>

    <!-- ③ ORDER INFO BAR -->
    <tr>
      <td style="background:#fff;padding:16px 24px;border-bottom:1px solid #E0E0E0;">
        <table width="100%">
          <tr>
            <td style="font-size:12px;color:#878787;">
              ORDER ID
              <div style="color:#212121;font-size:13px;font-weight:bold;margin-top:4px;">#${order.id.slice(-8).toUpperCase()}</div>
            </td>
            <td style="font-size:12px;color:#878787;">
              ORDER DATE
              <div style="color:#212121;font-size:13px;font-weight:bold;margin-top:4px;">${formatDate(order.created_at)}</div>
            </td>
            <td style="font-size:12px;color:#878787;">
              PAYMENT
              <div style="color:#212121;font-size:13px;font-weight:bold;margin-top:4px;">${order.payment_method}</div>
            </td>
            <td style="font-size:12px;color:#878787;">
              ESTIMATED DELIVERY
              <div style="color:#388E3C;font-size:13px;font-weight:bold;margin-top:4px;">${getDeliveryDate(order.created_at)}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ④ ITEMS ORDERED -->
    <tr>
      <td style="background:#fff;padding:0 24px 16px;">
        <div style="font-size:14px;font-weight:bold;color:#212121;padding:16px 0 12px;border-bottom:1px solid #E0E0E0;">Items Ordered</div>

        ${order.items.map(item => `
        <table width="100%" style="padding:12px 0;border-bottom:1px solid #F5F5F5;">
          <tr>
            <td width="70" valign="top">
              <img src="${item.image}" width="60" height="60" style="object-fit:contain;border:1px solid #E0E0E0;padding:4px;border-radius:2px;" alt="${item.name}"/>
            </td>
            <td valign="top" style="padding-left:12px;">
              <div style="font-size:13px;color:#212121;font-weight:500;line-height:1.4;">${item.name}</div>
              <div style="font-size:12px;color:#878787;margin-top:4px;">Qty: ${item.quantity}</div>
              <div style="font-size:13px;color:#212121;font-weight:bold;margin-top:4px;">₹${item.price.toLocaleString('en-IN')} per item</div>
            </td>
            <td align="right" valign="top" style="font-size:14px;font-weight:bold;color:#212121;white-space:nowrap;">₹${item.total.toLocaleString('en-IN')}</td>
          </tr>
        </table>
        `).join('')}
      </td>
    </tr>

    <!-- ⑤ PRICE SUMMARY -->
    <tr>
      <td style="background:#fff;padding:0 24px 16px;border-top:1px solid #E0E0E0;">
        <div style="font-size:12px;font-weight:bold;color:#878787;letter-spacing:1px;padding:16px 0 12px;border-bottom:1px solid #E0E0E0;">PRICE DETAILS</div>
        <table width="100%" style="margin-top:12px;">
          <tr>
            <td style="font-size:13px;color:#212121;padding:4px 0;">Price (${order.items.length} items)</td>
            <td align="right" style="font-size:13px;color:#212121;">₹${calculateMRP(order.items).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#212121;padding:4px 0;">Discount</td>
            <td align="right" style="font-size:13px;color:#388E3C;">-₹${calculateSavings(order.items, order.total_amount).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#212121;padding:4px 0;">Delivery Charges</td>
            <td align="right" style="font-size:13px;color:#388E3C;">FREE</td>
          </tr>
          <tr>
            <td colspan="2">
              <div style="border-top:1px dashed #E0E0E0;margin:8px 0;"></div>
            </td>
          </tr>
          <tr>
            <td style="font-size:15px;font-weight:bold;color:#212121;padding:4px 0;">Total Amount</td>
            <td align="right" style="font-size:15px;font-weight:bold;color:#212121;">₹${order.total_amount.toLocaleString('en-IN')}</td>
          </tr>
        </table>
        <div style="background:#E8F5E9;padding:10px 12px;border-radius:2px;margin-top:12px;font-size:13px;color:#388E3C;">🎉 You will save ₹${calculateSavings(order.items, order.total_amount).toLocaleString('en-IN')} on this order</div>
      </td>
    </tr>

    <!-- ⑥ DELIVERY ADDRESS -->
    <tr>
      <td style="background:#fff;margin-top:8px;padding:16px 24px;border-top:8px solid #F1F3F6;">
        <div style="font-size:14px;font-weight:bold;color:#212121;margin-bottom:12px;">Delivery Address</div>
        <div style="font-size:13px;color:#212121;font-weight:bold;">
          ${order.address.full_name}
          <span style="background:#E8F5E9;color:#388E3C;font-size:11px;font-weight:bold;padding:2px 6px;border-radius:2px;margin-left:8px;">${order.address.type}</span>
        </div>
        <div style="font-size:13px;color:#878787;margin-top:6px;line-height:1.6;">
          ${order.address.address1}${order.address.address2 ? ', ' + order.address.address2 : ''}<br/>
          ${order.address.city}, ${order.address.state} — ${order.address.pincode}<br/>
          📞 ${order.address.phone}
        </div>
      </td>
    </tr>

    <!-- ⑦ TRACK ORDER BUTTON -->
    <tr>
      <td style="background:#fff;padding:16px 24px 24px;text-align:center;border-top:1px solid #E0E0E0;">
        <a href="${process.env.FRONTEND_URL}/orders/${order.id}" style="background:#FB641B;color:#fff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 40px;border-radius:2px;display:inline-block;">VIEW ORDER DETAILS</a>
      </td>
    </tr>

    <!-- ⑧ FOOTER -->
    <tr>
      <td style="background:#172337;padding:20px 24px;border-radius:0 0 4px 4px;text-align:center;">
        <div style="color:#fff;font-size:20px;font-weight:bold;font-style:italic;margin-bottom:8px;">Flipkart</div>
        <div style="color:#9e9e9e;font-size:12px;line-height:1.6;">
          This is an automated email. Please do not reply.<br/>
          © 2024 Flipkart Clone. All rights reserved.
        </div>
      </td>
    </tr>

  </table>
  </td></tr>
  </table>
</body>
</html>`
}

// ════════════════════════════════════════
// SEND EMAIL FUNCTION (main export)
// ════════════════════════════════════════

async function sendOrderConfirmationEmail(toEmail, toName, order) {
  const html = generateOrderEmailHTML(order)

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: `${toName} <${toEmail}>`,
    subject: `Order Confirmed! #${order.id.slice(-8).toUpperCase()} — Your Flipkart order is placed`,
    html: html,
    text: `
      Order Confirmed!
      Order ID: #${order.id.slice(-8).toUpperCase()}
      Total: ₹${order.total_amount}
      Items: ${order.items.length}
      Delivery: ${getDeliveryDate(order.created_at)}
    `.trim()
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('📧 Order email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (err) {
    console.error('❌ Email failed:', err.message)
    return { success: false, error: err.message }
  }
}

module.exports = { sendOrderConfirmationEmail }
