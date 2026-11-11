const CARD_BRANDS = {
  visa: { name: 'Visa', cvcLength: 3, groups: [4, 4, 4, 4], length: 16, test: /^4/ },
  mastercard: { name: 'Mastercard', cvcLength: 3, groups: [4, 4, 4, 4], length: 16, test: /^(5[1-5]|2(22[1-9]|2[3-9]\d|[3-6]\d\d|7[01]\d|720))/ },
  amex: { name: 'American Express', cvcLength: 4, groups: [4, 6, 5], length: 15, test: /^3[47]/ },
  discover: { name: 'Discover', cvcLength: 3, groups: [4, 4, 4, 4], length: 16, test: /^(6011|65|64[4-9])/ },
  diners: { name: 'Diners Club', cvcLength: 3, groups: [4, 6, 4], length: 14, test: /^(30[0-5]|36|38|39)/ },
  jcb: { name: 'JCB', cvcLength: 3, groups: [4, 4, 4, 4], length: 16, test: /^35(2[89]|[3-8])/ },
  unionpay: { name: 'UnionPay', cvcLength: 3, groups: [4, 4, 4, 4], length: 16, test: /^62/ },
  maestro: { name: 'Maestro', cvcLength: 3, groups: [4, 4, 4, 4], length: 16, test: /^(50|5[6-9]|6[0-9])/ }
};

const UNKNOWN_BRAND = { name: '', cvcLength: 3, groups: [4, 4, 4, 4], length: 16 };

function detectCardBrand(digits) {
  const key = Object.keys(CARD_BRANDS).find((brand) => CARD_BRANDS[brand].test.test(digits));
  return key || 'unknown';
}

function getBrandInfo(brand) {
  return CARD_BRANDS[brand] || UNKNOWN_BRAND;
}

function groupDigits(digits, groups) {
  const parts = [];
  let start = 0;
  groups.forEach((size) => {
    if (start < digits.length) parts.push(digits.slice(start, start + size));
    start += size;
  });
  return parts.join(' ');
}

function formatCardNumber(rawValue) {
  const digits = rawValue.replace(/\D/g, '');
  const brand = getBrandInfo(detectCardBrand(digits));
  return groupDigits(digits.slice(0, brand.length), brand.groups);
}

function isLuhnValid(digits) {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let digit = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return digits.length > 0 && sum % 10 === 0;
}

function formatExpiry(rawValue) {
  const digits = rawValue.replace(/\D/g, '').slice(0, 4);
  if (digits.length === 0) return '';
  let month = digits.slice(0, 2);
  if (digits.length === 1 && Number(digits) > 1) return `0${digits}/`;
  if (month.length === 2 && Number(month) > 12) month = '12';
  return digits.length > 2 ? `${month}/${digits.slice(2)}` : month;
}

function isExpiryValid(value) {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}
