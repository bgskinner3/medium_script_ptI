/* eslint-disable no-unused-vars */
const { produce_simple_exchange_paths } = require('./mapping_simple_paths');
const {
  get_all_defi_liquidty_pools,
  determine_loan_pools_of_path,
} = require('./apis');
const {
  profitablity_checks,
  check_all_structured_paths,
} = require('./profitability_checks');
const {
  TIME_FRAME_FOR_SUBGRAPH_ONE_HOUR,
  TIME_FRAME_FOR_SUBGRAPH_FOUR_HOURS,
  TIME_FRAME_FOR_SUBGRAPH_SIX_HOURS,
} = require('./constants');

async function init() {
  try {
    /**
     * we look for liqudity pools with the highest USD volume and transaction volume from one hour ago.
     * we can apply different hours from our constants file => 4 HOURS OR 6 HOURS
     */
    const defi_array_of_objects = await get_all_defi_liquidty_pools(
      //--pick a time frame --//
    );
    const path_and_loan_pools = [];

    if (defi_array_of_objects) {
      const possible_profitable_paths = produce_simple_exchange_paths(
        defi_array_of_objects
      );

      /**
       * find the price percentage difference and thin the herd of mapped paths
       */
      const proftiable_opportunities_intial_check = check_all_structured_paths(
        possible_profitable_paths
      );
      /**
       * find the loan pools associated to our path
       */
      for (const {
        path,
        token_ids,
        pool_addresses,
      } of proftiable_opportunities_intial_check) {
        const loan_pools = await determine_loan_pools_of_path(
          token_ids,
          pool_addresses
        );
     
        path_and_loan_pools.push({ path: path, loan_pools: loan_pools });
       
      }
      console.log(path_and_loan_pools.length);
      await profitablity_checks(path_and_loan_pools);
    }
  } catch (error) {
    console.error(error);
  }
}

init();
