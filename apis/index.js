const {
  build_uniswap_V3_USD_volume_and_transaction_object,
  get_uniswap_v3_last_swap_information,
  find_most_profitable_loan_pool_V3,
} = require('./uniswap_V3');
const {
  build_uniswap_V2_USD_volume_and_transaction_object,
  find_most_profitable_loan_pool_V2,
  get_most_recent_swap_activity_uniswapV2,
} = require('./uniswap_V2');
const {
  build_sushiswap_USD_volume_and_transaction_object,
  find_most_profitable_loan_pool_sushi_swap,
  get_most_recent_swap_activity_sushiswap,
} = require('./sushiswap');

/**
 we merge each subgraph array into a single array so that we can traverse over all
 the DEXS at the same time 
 */

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

    if (uniswap_v3 && uniswap_v2 && sushiswap) {
      return [...uniswap_v3, ...uniswap_v2, ...sushiswap];
    }
  } catch (error) {
    console.error(error);
  }
}

async function get_loan_pool_for_token(tokenId, poolAddresses) {
  try {
    const [poolAddress1, poolAddress2, poolAddress3] = poolAddresses;

    const uniswap_v3_loan_pool_id = await find_most_profitable_loan_pool_V3(
      tokenId,
      poolAddress1,
      poolAddress2,
      poolAddress3
    );

    if (uniswap_v3_loan_pool_id) {
      return await get_uniswap_v3_last_swap_information(
        uniswap_v3_loan_pool_id
      );
    }

    const uniswap_v2_loan_pool_id = await find_most_profitable_loan_pool_V2(
      tokenId,
      poolAddress1,
      poolAddress2,
      poolAddress3
    );
    if(uniswap_v2_loan_pool_id){
      return await get_most_recent_swap_activity_uniswapV2(
        uniswap_v2_loan_pool_id
      );
    }
    const sushi_swap_loan_pool_id =
      await find_most_profitable_loan_pool_sushi_swap(
        tokenId,
        poolAddress1,
        poolAddress2,
        poolAddress3
      );

    if(sushi_swap_loan_pool_id) {
      return await get_most_recent_swap_activity_sushiswap(
        sushi_swap_loan_pool_id
      );
    }


  } catch (error) {
    console.error(error);
  }
}

async function determine_loan_pools_of_path(tokenIds, poolAddresses) {
  try {
    const loan_addresses = {}
    for (const tokenId of tokenIds) {
      const loan_pool = await get_loan_pool_for_token(tokenId, poolAddresses);

      if (loan_pool) {
      
        loan_addresses[tokenId] = loan_pool
      }
    }
    return loan_addresses;
  } catch (error) {
    console.error(error);
  }
}




module.exports = {
  get_all_defi_liquidty_pools,
  determine_loan_pools_of_path,
};
