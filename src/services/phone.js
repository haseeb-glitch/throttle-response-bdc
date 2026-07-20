function normalizePhone(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1);
  if (digits.length === 10) return digits;
  return digits || null;
}

function formatE164(phone) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  if (normalized.length === 10) return `+1${normalized}`;
  return `+${normalized}`;
}

module.exports = { normalizePhone, formatE164 };
