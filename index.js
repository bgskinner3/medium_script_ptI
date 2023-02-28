const { produce_simple_exchange_paths } = require('./mapping_simple_paths');
const { get_all_defi_liquidty_pools } = require('./apis');

async function init() {
  try {
    const defi_array_of_objects = await get_all_defi_liquidty_pools(1);

    if (defi_array_of_objects) {
      const possible_profitable_paths = produce_simple_exchange_paths(x);
      console.log(possible_profitable_paths);
    }
  } catch (error) {
    console.error(error);
  }
}

init();
