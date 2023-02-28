/**
 * The following two functions create a query to be passed into uniswaps_V3 subgraph api to collect
 * all pools from a given time to the present.
 * The first query calls for the transaction volume in decdending order.
 * The second query calls for volume caluated in USD in decdending order.
 *
 * the last function makes a call for a single pool.
 */

function get_uniswap_transactions_by_the_hour_V3({ setHours: time }) {
  let curr = new Date();
  curr.setHours(curr.getHours() - time);
  const hour = Math.floor(curr.getTime() / 1000);
  const queryStr = `{
    poolHourDatas(first: 1000, orderBy: txCount, orderDirection: desc, where: {periodStartUnix_gte: ${hour}, tick_not: 0, liquidity_gt: 0 }){
      pool{
        id
        feeTier
        token0Price
        token1Price
        liquidity
        tick
        sqrtPrice
  
        token0{
          symbol
          decimals
          id
          derivedETH
        }
        token1{
          symbol
          decimals
          id
          derivedETH
         }
      }
     }
   }`;

  const queryObj = {
    query: queryStr,
  };
  return queryObj;
}

function get_uniswap_volume_by_the_hour_V3({ setHours: time }) {
  let curr = new Date();
  curr.setHours(curr.getHours() - time);
  const hour = Math.floor(curr.getTime() / 1000);
  const queryStr = `{
    poolHourDatas(first: 1000, orderBy: volumeUSD, orderDirection: desc, where: {periodStartUnix_gte: ${hour}, tick_not: 0, liquidity_gt: 0}){
      pool{
        id
        feeTier
        token0Price
        token1Price
        liquidity
        tick
        sqrtPrice
        token0{
          symbol
          decimals
          id
          derivedETH
        }
        token1{
          symbol
          decimals
          id
          derivedETH
         }
      }
     }
   }`;

  const queryObj = {
    query: queryStr,
  };
  return queryObj;
}

module.exports = {
  get_uniswap_volume_by_the_hour_V3,
  get_uniswap_transactions_by_the_hour_V3,
};