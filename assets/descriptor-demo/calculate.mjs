// Synthetic fixture only. Decimal input is converted to integers before rounding.
export function calculate(quantity, unitPrice) {
  const q = String(quantity),
    price = String(unitPrice);
  if (
    !/^(0|[1-9]\d{0,4})$/.test(q) ||
    Number(q) > 10000 ||
    !/^(0|[1-9]\d{0,6})(\.\d{1,4})?$/.test(price) ||
    Number(price) > 1000000
  )
    throw new Error(
      'Use a whole quantity 0–10000 and price 0–1000000 with up to four decimal places.',
    );
  const [whole, fraction = ''] = price.split('.');
  const scaled = BigInt(whole) * 10000n + BigInt(fraction.padEnd(4, '0'));
  const discounted = Number(q) >= 10;
  const cents =
    (BigInt(q) * scaled * (discounted ? 90n : 100n) + 5000n) / 10000n;
  return {
    total: `${cents / 100n}.${String(cents % 100n).padStart(2, '0')}`,
    discounted,
  };
}
