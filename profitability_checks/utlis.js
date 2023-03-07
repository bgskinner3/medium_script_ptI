function verfiy_token_path(path) {
  const [pool_1, pool_2, pool_3] = path;

  const pool_1_token_0 = pool_1.token0.id;
  const pool_1_token_1 = pool_1.token1.id;
  const pool_2_token_0 = pool_2.token0.id;
  const pool_2_token_1 = pool_2.token1.id;
  const pool_3_token_0 = pool_3.token0.id;
  const pool_3_token_1 = pool_3.token1.id;

  const pool_1_token_in =
    pool_1_token_0 === pool_3_token_0 || pool_1_token_0 === pool_3_token_1
      ? pool_1_token_0
      : pool_1_token_1;

  const pool_1_token_out =
    pool_1_token_in === pool_1_token_0 ? pool_1_token_1 : pool_1_token_0;

  const pool_2_token_in = pool_1_token_out;
  const pool_2_token_out =
    pool_2_token_in === pool_2_token_0 ? pool_2_token_1 : pool_2_token_0;

  const pool_3_token_in = pool_2_token_out;
  const pool_3_token_out = pool_1_token_in;

  pool_1.token_in = pool_1_token_in;
  pool_1.token_out = pool_1_token_out;
  pool_2.token_in = pool_2_token_in;
  pool_2.token_out = pool_2_token_out;
  pool_3.token_in = pool_3_token_in;
  pool_3.token_out = pool_3_token_out;
}

function uniswap_V3_swap_math(pool, amount) {
  const token_0 = pool.token_in === pool.token0.id;
  const q96 = 2 ** 96;
  const token_0_decimals = 10 ** Number(pool.token0.decimals);
  const token_1_decimals = 10 ** Number(pool.token1.decimals);
  const liquidty = Number(pool.liquidity);
  const current_sqrt_price = Number(pool.sqrtPrice);

  function calc_amount0(liq, pa, pb) {
    if (pa > pb) {
      [pa, pb] = [pb, pa];
    }
    return Number((liq * q96 * (pb - pa)) / pb / pa);
  }

  function calc_amount1(liq, pa, pb) {
    if (pa > pb) {
      [pa, pb] = [pb, pa];
    }
    return Number((liq * (pb - pa)) / q96);
  }

  if (token_0) {
    const amount_in = amount * token_0_decimals;
    const price_next =
      (liquidty * q96 * current_sqrt_price) /
      (liquidty * q96 + amount_in * current_sqrt_price);

    const output = calc_amount1(
      liquidty,
      price_next,
      Number(current_sqrt_price)
    );

    return output / token_1_decimals;

  } else {
    const amount_in = amount * token_1_decimals;

    const price_diff = (amount_in * q96) / liquidty;

    const price_next = price_diff + current_sqrt_price;

    const output = calc_amount0(
      liquidty,
      price_next,
      Number(current_sqrt_price)
    );
    return output / token_0_decimals;
  }
}


function uniswap_V2_sushiswap_swap_math(pool, amount) {
   const token_in_reserves =
     pool.token_in === pool.token0.id
       ? Number(pool.reserve0)
       : Number(pool.reserve1);

   const token_out_reserves =
     pool.token_out === pool.token0.id
       ? Number(pool.reserve0)
       : Number(pool.reserve1);

    const calculated_amount = Math.abs(
      (token_in_reserves * token_out_reserves) / (token_in_reserves + amount) -
        token_out_reserves
    );

    return calculated_amount;
}



module.exports = {
  verfiy_token_path,
  uniswap_V2_sushiswap_swap_math,
  uniswap_V3_swap_math,
};