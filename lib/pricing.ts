export const FREE_SHIPPING_THRESHOLD_CENTS = 7500;
export const STANDARD_US_SHIPPING_ESTIMATE_CENTS = 475;

export function qualifiesForFreeShipping(subtotalCents: number) {
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS;
}
