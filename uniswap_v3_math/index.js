const getReserves_uniswap_V3 = require('./get_liquidity');

const calculate_reserve_tokens_for_uniswap_V3 = (swap) => {
  const decimals = [swap.token0.decimals, swap.token1.decimals];
  const liquidity = swap.liquidity;
  const sqrtPrice = swap.sqrtPrice;
  const tick = Math.abs(swap.tick).toString();

  if (tick !== '0') {
    const [token_reserve_0, token_reserve_1] =
      getReserves_uniswap_V3.getAmountsForCurrentLiquidity(
        decimals,
        liquidity, // Current liquidity value of the pool
        sqrtPrice, // Current sqrt price value of the pool
        tick // current tick spacing
      );

    return [token_reserve_0, token_reserve_1];
  } else {
    return [0, 0];
  }
};

module.exports = {
  calculate_reserve_tokens_for_uniswap_V3,
};
