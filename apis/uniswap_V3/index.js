const { uniswapSubgraph_V3_Api } = require('./uniswap_V3_subgraph');
const {
  get_uniswap_transactions_by_the_hour_V3,
  get_uniswap_volume_by_the_hour_V3,
  get_uniswap_last_swap_information_V3,
  get_most_profitable_loan_pools_for_path_V3,
} = require('./uniswap_V3_queries');
const {
  calculate_reserve_tokens_for_uniswap_V3,
} = require('../../uniswap_v3_math');

async function build_uniswap_V3_USD_volume_and_transaction_object(hour) {
  try {
    const V3_Query_transactions = get_uniswap_volume_by_the_hour_V3({
      setHours: hour,
    });
    const V3_Query_USD_volume = get_uniswap_transactions_by_the_hour_V3({
      setHours: hour,
    });

    const V3_transactions_HourlyObject =
      (await uniswapSubgraph_V3_Api(V3_Query_transactions)) || {};
    const V3_USD_volume_HourlyObject =
      (await uniswapSubgraph_V3_Api(V3_Query_USD_volume)) || {};

    const res = [];

    if (Object.keys(V3_transactions_HourlyObject).length) {
      for (const pair of V3_transactions_HourlyObject.poolHourDatas) {
        const pairObject = pair.pool;
        
        if (
          Number(pairObject.feeTier) <= 3000 &&
          Number(pairObject.tick) > 0 &&
          Number(pairObject.liquidity) > 0
        ) {
          const [reserve0, reserve1] =
            calculate_reserve_tokens_for_uniswap_V3(pairObject);
          pairObject.reserve0 = reserve0;
          pairObject.reserve1 = reserve1;
          pairObject.token0['price'] = pairObject.token0Price;
          pairObject.token1['price'] = pairObject.token1Price;
          pairObject['exchange'] = 'uniswapV3';
          pairObject.fee = pairObject.feeTier;
          res.push(pairObject);
        }
      }
    }

    if (Object.keys(V3_USD_volume_HourlyObject).length) {
      for (const pair of V3_USD_volume_HourlyObject.poolHourDatas) {
        const pairObject = pair.pool;
        
        if (
          Number(pairObject.feeTier) <= 3000 &&
          Number(pairObject.tick) > 0 &&
          Number(pairObject.liquidity) > 0
        ) {
          const [reserve0, reserve1] =
            calculate_reserve_tokens_for_uniswap_V3(pairObject);
          pairObject.reserve0 = reserve0;
          pairObject.reserve1 = reserve1;
          pairObject.token0['price'] = pairObject.token0Price;
          pairObject.token1['price'] = pairObject.token1Price;
          pairObject['exchange'] = 'uniswapV3';
          pairObject.fee = pairObject.feeTier;
          res.push(pairObject);
        }
      }
    }
    if (V3_USD_volume_HourlyObject && V3_transactions_HourlyObject) {
      return res;
    }
  } catch (error) {
    console.error(error);
  }
}


async function get_uniswap_v3_last_swap_information(address) {
  try {

    const V3_swap_pool_query = get_uniswap_last_swap_information_V3(address);
    const swap = await uniswapSubgraph_V3_Api(V3_swap_pool_query);

    if (swap) {
      const last_swap_information = swap.swaps[0];

      last_swap_information.pool.token1Price =
        Math.abs(last_swap_information.amount1) /
        Math.abs(last_swap_information.amount0);


      last_swap_information.pool.token0Price =
        Math.abs(last_swap_information.amount0) /
        Math.abs(last_swap_information.amount1);

      last_swap_information.pool.token_0_usd_price =
        Number(last_swap_information.amountUSD) /
        Math.abs(last_swap_information.amount0);

      last_swap_information.pool.token_1_usd_price =
        Number(last_swap_information.amountUSD) /
        Math.abs(last_swap_information.amount1);

      last_swap_information.pool.exchange = 'uniswapV3'

      return last_swap_information.pool
    }
  } catch (error) {
    console.error(error);
  }
}

async function find_most_profitable_loan_pool_V3(
  tokenID,
  poolAddress1,
  poolAddress2,
  poolAddress3
) {
  try {
    const V3_inital_loan_pool_query =
      get_most_profitable_loan_pools_for_path_V3({
        tokenID: tokenID,
        poolAddress1: poolAddress1,
        poolAddress2: poolAddress2,
        poolAddress3: poolAddress3,
      });
    const { token: pools } =
      (await uniswapSubgraph_V3_Api(V3_inital_loan_pool_query)) || {};

    if (pools && pools.whitelistPools.length !== 0) {
      return pools.whitelistPools[0].id;
    }
  } catch (error) {
    console.error(error);
  }
}



module.exports = {
  build_uniswap_V3_USD_volume_and_transaction_object,
  get_uniswap_v3_last_swap_information,
  find_most_profitable_loan_pool_V3,
};
