const {
  build_uniswap_V3_USD_volume_and_transaction_object,
} = require('./uniswap_V3');
const {
  build_uniswap_V2_USD_volume_and_transaction_object,
} = require('./uniswap_V2');
const {
  build_sushiswap_USD_volume_and_transaction_object,
} = require('./sushiswap');


async function get_all_defi_liquidty_pools(time) {
  try {
    const uniswap_v3 = await build_uniswap_V3_USD_volume_and_transaction_object(
      time
    );
   

    const uniswap_v2 = await build_uniswap_V2_USD_volume_and_transaction_object(
      time
    );

    const sushiswap = await build_sushiswap_USD_volume_and_transaction_object(
      time
    );
    console.log(sushiswap);
    if(uniswap_v3 && uniswap_v2 && sushiswap) {
      return [...uniswap_v3, ...uniswap_v2, ...sushiswap];
    }
  } catch (error) {
    console.error(error);
  }
}


module.exports = { get_all_defi_liquidty_pools };