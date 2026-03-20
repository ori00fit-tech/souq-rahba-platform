export interface OrderNotificationItem {
  name: string;
  quantity: number;
}

export interface OrderNotificationData {
  order_number: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_city: string;
  total_mad: number;
  items: OrderNotificationItem[];
  seller_name: string;
  seller_phone?: string | null;
}

export function buildSellerOrderWhatsAppMessage(order: OrderNotificationData) {
  const itemsSummary = order.items
    .map((item) => `- ${item.name} × ${item.quantity}`)
    .join("\n");

  return [
    "🔔 *طلب جديد على RAHBA*",
    "",
    `رقم الطلب: ${order.order_number}`,
    `المشتري: ${order.buyer_name}`,
    `الهاتف: ${order.buyer_phone}`,
    `المدينة: ${order.buyer_city}`,
    `الإجمالي: ${order.total_mad} MAD`,
    "",
    "*المنتجات:*",
    itemsSummary || "- منتج",
    "",
    "يرجى التواصل مع الزبون لتأكيد الطلب."
  ].join("\n");
}

export function buildBuyerOrderWhatsAppMessage(order: OrderNotificationData) {
  return [
    "✅ *تم استلام طلبك بنجاح*",
    "",
    `مرحباً ${order.buyer_name}،`,
    `رقم طلبك هو: ${order.order_number}`,
    `المبلغ الإجمالي: ${order.total_mad} MAD`,
    `البائع: ${order.seller_name}`,
    "",
    "سيتم التواصل معك قريباً لتأكيد التوصيل.",
    "شكراً لثقتك في منصة رهبة."
  ].join("\n");
}

export async function notifyNewOrder(order: OrderNotificationData) {
  try {
    const sellerMsg = buildSellerOrderWhatsAppMessage(order);
    const buyerMsg = buildBuyerOrderWhatsAppMessage(order);

    console.log("---------- WHATSAPP NOTIFICATION ----------");
    console.log("TO SELLER:");
    console.log(sellerMsg);
    console.log("-------------------------------------------");
    console.log("TO BUYER:");
    console.log(buyerMsg);
    console.log("-------------------------------------------");

    return true;
  } catch (error) {
    console.error("Failed to process notifications:", error);
    return false;
  }
}
