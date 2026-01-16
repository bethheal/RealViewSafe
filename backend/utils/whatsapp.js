export const whatsappLink = (phone, message) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
