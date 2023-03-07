const { uniswapSubgraph_V2_Api } = require('./uniswap_V2_subgraph');

const {
  get_uniswap_transactions_volume_by_the_hour_V2,
  get_uniswap_usd_volume_by_the_hour_V2,
  get_most_profitable_loan_pools_for_path_V2,
  get_uniswap_last_swap_information_V2,
} = require('./uniswap_V2_queries');

async function build_uniswap_V2_USD_volume_and_transaction_object(hour) {
  try {
    const V2Query_transactions = get_uniswap_transactions_volume_by_the_hour_V2(
      {
        setHours: hour,
      }
    );
    const V2Query_USD_volume = get_uniswap_usd_volume_by_the_hour_V2({
      setHours: hour,
    });
    const V2_transactions_HourlyObject =
      (await uniswapSubgraph_V2_Api(V2Query_transactions)) || {};
    const V2_USD_volume_HourlyObject =
      (await uniswapSubgraph_V2_Api(V2Query_USD_volume)) || {};

    const res = [];

    if (Object.keys(V2_transactions_HourlyObject).length) {
      for (const pair of V2_transactions_HourlyObject.pairHourDatas) {
        const pairObject = pair.pair;

        pairObject.token0['reserves'] = pairObject.reserve0;
        pairObject.token1['reserves'] = pairObject.reserve1;
        pairObject.token0['price'] = pairObject.token0Price;
        pairObject.token1['price'] = pairObject.token1Price;
        pairObject['exchange'] = 'uniswapV2';
        pairObject.fee = '3000';
        res.push(pairObject);
      }
    }

    if (Object.keys(V2_USD_volume_HourlyObject).length) {
      for (const pair of V2_USD_volume_HourlyObject.pairHourDatas) {
        const pairObject = pair.pair;

        pairObject.token0['reserves'] = pairObject.reserve0;
        pairObject.token1['reserves'] = pairObject.reserve1;
        pairObject.token0['price'] = pairObject.token0Price;
        pairObject.token1['price'] = pairObject.token1Price;
        pairObject['exchange'] = 'uniswapV2';
        pairObject.fee = '3000';

        res.push(pairObject);
      }
    }

    if (V2_transactions_HourlyObject && V2_USD_volume_HourlyObject) {
      return res;
    }
  } catch (error) {
    console.error(
      'there was an error getting uniswap V2 USD volume and transaction array',
      error
    );
  }
}

async function get_most_recent_swap_activity_uniswapV2(address) {
  try {
    const pool_swap_query = get_uniswap_last_swap_information_V2(address);
    const swap = await uniswapSubgraph_V2_Api(pool_swap_query);

    if (swap) {
      const last_swap_information = swap.swaps[0];

      const token_0_amount =
        last_swap_information.amount0In !== '0'
          ? Number(last_swap_information.amount0In)
          : Number(last_swap_information.amount0Out);

      const token_1_amount =
        last_swap_information.amount1In !== '0'
          ? Number(last_swap_information.amount1In)
          : Number(last_swap_information.amount1Out);

      last_swap_information.pair.token1Price = token_1_amount / token_0_amount;
      last_swap_information.pair.token0Price = token_0_amount / token_1_amount;
      last_swap_information.pair.token_0_usd_price =
        Number(last_swap_information.amountUSD) / Math.abs(token_0_amount);

      last_swap_information.pair.token_1_usd_price =
        Number(last_swap_information.amountUSD) / Math.abs(token_1_amount);
      last_swap_information.pair.feeTier = '3000';
      last_swap_information.pair.exchange = 'uniswapV2';

      return last_swap_information.pair;
    }
  } catch (error) {
    console.error(error);
  }
}

async function find_most_profitable_loan_pool_V2(
  tokenId,
  poolAddress1,
  poolAddress2,
  poolAddress3
) {
  try {
    const uniswap_loanPool_query_token0__V2 =
      get_most_profitable_loan_pools_for_path_V2({
        tokenID: tokenId,
        poolAddress: poolAddress1,
        poolAddress2: poolAddress2,
        poolAddress3: poolAddress3,
        token_number: 'token0',
      });

    const uniswap_loanPool_query_token1__V2 =
      get_most_profitable_loan_pools_for_path_V2({
        tokenID: tokenId,
        poolAddress: poolAddress1,
        poolAddress2: poolAddress2,
        poolAddress3: poolAddress3,
        token_number: 'token1',
      });

    const loan_pairs_token0 =
      (await uniswapSubgraph_V2_Api(uniswap_loanPool_query_token0__V2)) || {};

    if (Object.keys(loan_pairs_token0).length && loan_pairs_token0.pairs[0]) {
      return loan_pairs_token0.pairs[0].id;
    }
    const loan_pairs_token1 =
      (await uniswapSubgraph_V2_Api(uniswap_loanPool_query_token1__V2)) || {};

    if (Object.keys(loan_pairs_token1).length && loan_pairs_token1.pairs[0]) {
      return loan_pairs_token1.pairs[0].id;
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  build_uniswap_V2_USD_volume_and_transaction_object,
  find_most_profitable_loan_pool_V2,
  get_most_recent_swap_activity_uniswapV2,
};
