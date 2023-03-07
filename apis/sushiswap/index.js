const { sushiswapSubgraph_Api } = require('./sushi_swap_subgraph');
const {
  get_sushi_swap_transactions_volume_by_the_hour,
  get_sushi_swap_usd_volume_by_the_hour,
  get_sushi_swap_last_swap_information,
  get_sushi_swap_most_profitable_loan_pools_for_path,
} = require('./sushi_swap_queries');

async function build_sushiswap_USD_volume_and_transaction_object(hour) {
  try {
    const sushiswap_USD_volume = get_sushi_swap_usd_volume_by_the_hour({
      setHours: hour,
    });

    const sushiswap_transactions =
      get_sushi_swap_transactions_volume_by_the_hour({
        setHours: hour,
      });
    const sushiswap_transactions_HourlyObject =
      (await sushiswapSubgraph_Api(sushiswap_transactions)) || {};
    const sushiswap_USD_volume_HourlyObject =
      (await sushiswapSubgraph_Api(sushiswap_USD_volume)) || {};

    const res = [];

    if (Object.keys(sushiswap_transactions_HourlyObject).length) {
      for (const pair of sushiswap_transactions_HourlyObject.pairHourDatas) {
        const pairObject = pair.pair;

        pairObject.token0['reserves'] = pairObject.reserve0;
        pairObject.token1['reserves'] = pairObject.reserve1;
        pairObject.token0['price'] = pairObject.token0Price;
        pairObject.token1['price'] = pairObject.token1Price;
        pairObject['exchange'] = 'sushiswap';
        pairObject.fee = '3000';
        res.push(pairObject);
      }
    }

    if (Object.keys(sushiswap_USD_volume_HourlyObject).length) {
      for (const pair of sushiswap_USD_volume_HourlyObject.pairHourDatas) {
        const pairObject = pair.pair;

        pairObject.token0['reserves'] = pairObject.reserve0;
        pairObject.token1['reserves'] = pairObject.reserve1;
        pairObject.token0['price'] = pairObject.token0Price;
        pairObject.token1['price'] = pairObject.token1Price;
        pairObject['exchange'] = 'sushiswap';
        pairObject.fee = '3000';
        res.push(pairObject);
      }
    }
    if (
      sushiswap_transactions_HourlyObject &&
      sushiswap_USD_volume_HourlyObject
    ) {
      return res;
    }
  } catch (error) {
    console.error('there was an error getting sushiswap liqudity pools', error);
  }
}


async function get_most_recent_swap_activity_sushiswap(address) {
  try {
    const pool_swap_query = get_sushi_swap_last_swap_information(address);
    const swap = await sushiswapSubgraph_Api(pool_swap_query);


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
      last_swap_information.pair.exchange = 'sushiswap';

      return last_swap_information.pair;
    }

  } catch (error) {
    console.error(error);
  }
}



async function find_most_profitable_loan_pool_sushi_swap(
  tokenId,
  pooladdress,
  poolAddress2,
  poolAddress3
) {
  try {
    const sushiSwap_loanPool_query_token_0 =
      get_sushi_swap_most_profitable_loan_pools_for_path({
        tokenID: tokenId,
        poolAddress: pooladdress,
        poolAddress2: poolAddress2,
        poolAddress3: poolAddress3,
        token_number: 'token0',
      });

    const sushiSwap_loanPool_query_token_1 =
      get_sushi_swap_most_profitable_loan_pools_for_path({
        tokenID: tokenId,
        poolAddress: pooladdress,
        poolAddress2: poolAddress2,
        poolAddress3: poolAddress3,
        token_number: 'token1',
      });

    const loan_pair_token_0 =
      (await sushiswapSubgraph_Api(sushiSwap_loanPool_query_token_0)) || {};

    if (Object.keys(loan_pair_token_0).length && loan_pair_token_0.pairs[0]) {
      return loan_pair_token_0.pairs[0].id;
    }

    const loan_pair_token_1 =
      (await sushiswapSubgraph_Api(sushiSwap_loanPool_query_token_1)) || {};

    if (Object.keys(loan_pair_token_1).length && loan_pair_token_1.pairs[0]) {
      return loan_pair_token_1.pairs[0].id;
    }
   
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  build_sushiswap_USD_volume_and_transaction_object,
  find_most_profitable_loan_pool_sushi_swap,
  get_most_recent_swap_activity_sushiswap,
};
