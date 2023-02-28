const { uniswapSubgraph_V2_Api } = require('./uniswap_V2_subgraph');

const {
  get_uniswap_transactions_volume_by_the_hour_V2,
  get_uniswap_usd_volume_by_the_hour_V2,
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



module.exports = { build_uniswap_V2_USD_volume_and_transaction_object };