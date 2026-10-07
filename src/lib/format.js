export function formatPrice(price, currency = "USD") {
  if (price === null || price === undefined) return "Negotiable";
  const symbol = currency === "USD" ? "$" : "ZWG ";
  return `${symbol}${Number(price).toLocaleString()}`;
}

export function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

// Converts a Zimbabwean number like 0771234567 to 263771234567 for WhatsApp links
export function toWhatsAppNumber(phone) {
  if (!phone) return "";
  let digits = phone.replace(/[^\d]/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = "263" + digits.slice(1);
  return digits;
}