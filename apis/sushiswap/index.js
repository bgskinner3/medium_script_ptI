const { sushiswapSubgraph_Api } = require('./sushi_swap_subgraph');
const {
  get_sushi_swap_transactions_volume_by_the_hour,
  get_sushi_swap_usd_volume_by_the_hour,
 
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


module.exports = { build_sushiswap_USD_volume_and_transaction_object };