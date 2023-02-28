/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

const { produce_simple_exchange_paths } = require('./mapping_simple_paths');
const { get_all_defi_liquidty_pools } = require('./apis');

async function init() {
  try {
    const x = await get_all_defi_liquidty_pools(1);

    if (x) {
      const y = produce_simple_exchange_paths(x);
      console.log(y);
    }
  } catch (error) {
    console.error(error);
  }
}

init();
