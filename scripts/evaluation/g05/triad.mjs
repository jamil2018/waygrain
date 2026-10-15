import { conditions } from './protocol.mjs';
// Fixed matched arms, isolated work: a failed worker never cancels its peers.
export async function runTriad(order, work) {
  if (
    order.length !== 3 ||
    new Set(order).size !== 3 ||
    order.some((c) => !conditions.includes(c))
  )
    throw new Error('invalid_triad');
  let active = 0,
    maximum = 0;
  const results = await Promise.allSettled(
    order.map(async (condition) => {
      active++;
      maximum = Math.max(maximum, active);
      try {
        return await work(condition);
      } finally {
        active--;
      }
    }),
  );
  return { results, maximum };
}
