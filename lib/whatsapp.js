export function formatWhatsAppMessage(orderDetails, cartItems, total) {
  let message = `*New Order - VegaMart* %0A%0A`;
  
  message += `*Customer Details:* %0A`;
  message += `Name: ${orderDetails.name} %0A`;
  message += `Phone: ${orderDetails.phone} %0A`;
  message += `Address: ${orderDetails.address} %0A%0A`;
  
  message += `*Items:* %0A`;
  cartItems.forEach(item => {
    message += `- ${item.name} (${item.quantity}): ₹${item.price * item.quantity} %0A`;
  });
  
  message += `%0A*Total: ₹${total}* %0A`;
  message += `Payment Method: ${orderDetails.paymentMethod} %0A`;
  
  return message;
}

export function openWhatsApp(message) {
  // Use environment variable for shop phone number, default to placeholder
  const shopPhoneNumber = process.env.NEXT_PUBLIC_SHOP_PHONE || "919876543210"; 
  const url = `https://wa.me/${shopPhoneNumber}?text=${message}`;
  window.open(url, '_blank');
}
