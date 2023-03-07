const JSBI = require('jsbi');
const Decimal = require('decimal.js');

const consts = (module.exports = {});




/** @const {number} RESOLUTION fixed point resolution  */
consts.RESOLUTION = JSBI.BigInt(96);

// constants used internally but not expected to be used externally
consts.NEGATIVE_ONE = JSBI.BigInt(-1);
consts.ZERO = JSBI.BigInt(0);
consts.ONE = JSBI.BigInt(1);
consts.TWO = JSBI.BigInt(2);

// used in liquidity amount math
consts.Q32 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(32));
consts.Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));
consts.Q192 = JSBI.exponentiate(consts.Q96, JSBI.BigInt(2));

consts.MaxUint256 = JSBI.BigInt(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
);

/**
 * The minimum tick that can be used on any pool.
 */
consts.MIN_TICK = -887272;
/**
 * The maximum tick that can be used on any pool.
 */
consts.MAX_TICK = -consts.MIN_TICK;

/**
 * The sqrt ratio corresponding to the minimum tick that could be used on any pool.
 */
consts.MIN_SQRT_RATIO = JSBI.BigInt('4295128739');
/**
 * The sqrt ratio corresponding to the maximum tick that could be used on any pool.
 */
consts.MAX_SQRT_RATIO = JSBI.BigInt(
  '1461446703485210103287273052203988822378723970342'
);

/**
 * @enum {number} Rounding constants of Decimal package.
 * @see https://mikemcl.github.io/decimal.js/#modes
 */
consts.Rounding = {
  ROUND_UP: Decimal.ROUND_UP,
  ROUND_DOWN: Decimal.ROUND_DOWN,
  ROUND_CEIL: Decimal.ROUND_CEIL,
  ROUND_FLOOR: Decimal.ROUND_FLOOR,
  ROUND_HALF_UP: Decimal.ROUND_HALF_UP,
  ROUND_HALF_DOWN: Decimal.ROUND_HALF_DOWN,
  ROUND_HALF_EVEN: Decimal.ROUND_HALF_EVEN,
  ROUND_HALF_CEIL: Decimal.ROUND_HALF_CEIL,
  ROUND_HALF_FLOO: Decimal.ROUND_HALF_FLOO,
};
