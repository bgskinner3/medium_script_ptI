/* eslint-disable no-unused-vars */
const { produce_simple_exchange_paths } = require('./mapping_simple_paths');
const { get_all_defi_liquidty_pools } = require('./apis');
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
      TIME_FRAME_FOR_SUBGRAPH_ONE_HOUR
    );

    if (defi_array_of_objects) {
      const possible_profitable_paths = produce_simple_exchange_paths(
        defi_array_of_objects
      );
      console.log(possible_profitable_paths[0]);
    }
  } catch (error) {
    console.error(error);
  }
}

init();
