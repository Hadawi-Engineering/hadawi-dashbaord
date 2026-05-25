/**
 * Normalizes a phone number for WhatsApp wa.me links (digits only, country code).
 */
export function formatPhoneForWhatsApp(phone: string): string | null {
  if (!phone?.trim()) return null;

  let digits = phone.replace(/\D/g, '');
  if (!digits) return null;

  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  if (digits.startsWith('0')) {
    digits = `966${digits.slice(1)}`;
  } else if (digits.length === 9 && digits.startsWith('5')) {
    digits = `966${digits}`;
  } else if (digits.length === 10 && digits.startsWith('05')) {
    digits = `966${digits.slice(1)}`;
  }

  if (digits.length < 10) return null;

  return digits;
}

export function getWhatsAppUrl(phone: string, message?: string): string | null {
  const formatted = formatPhoneForWhatsApp(phone);
  if (!formatted) return null;

  const base = `https://wa.me/${formatted}`;
  if (message?.trim()) {
    return `${base}?text=${encodeURIComponent(message)}`;
  }
  return base;
}
