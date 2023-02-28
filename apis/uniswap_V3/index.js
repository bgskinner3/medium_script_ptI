const { uniswapSubgraph_V3_Api } = require('./uniswap_V3_subgraph');
const {
  get_uniswap_transactions_by_the_hour_V3,
  get_uniswap_volume_by_the_hour_V3,
 
} = require('./uniswap_V3_queries');


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
        // const [reserve0, reserve1] =
        //   calculate_reserve_tokens_for_uniswap_V3(pairObject);
        // pairObject.reserve0 = reserve0;
        // pairObject.reserve1 = reserve1;
        pairObject.token0['price'] = pairObject.token0Price;
        pairObject.token1['price'] = pairObject.token1Price;
        pairObject['exchange'] = 'uniswapV3';
        pairObject.fee = pairObject.feeTier;
        if (Number(pairObject.feeTier) <= 3000 && Number(pairObject.tick) > 0) {
          res.push(pairObject);
        }
      }
    }

    if (Object.keys(V3_USD_volume_HourlyObject).length) {
      for (const pair of V3_USD_volume_HourlyObject.poolHourDatas) {
        const pairObject = pair.pool;
        // const [reserve0, reserve1] =
        //   calculate_reserve_tokens_for_uniswap_V3(pairObject);
        // pairObject.reserve0 = reserve0;
        // pairObject.reserve1 = reserve1;
        pairObject.token0['price'] = pairObject.token0Price;
        pairObject.token1['price'] = pairObject.token1Price;
        pairObject['exchange'] = 'uniswapV3';
        pairObject.fee = pairObject.feeTier;
        if (Number(pairObject.feeTier) <= 3000 && Number(pairObject.tick) > 0) {
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


module.exports = { build_uniswap_V3_USD_volume_and_transaction_object };