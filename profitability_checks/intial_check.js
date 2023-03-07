const {
  verfiy_token_path,
  uniswap_V2_sushiswap_swap_math,
  uniswap_V3_swap_math,
} = require('./utlis');

const { PRICE_PERCENTAGE_DIFFERENCE_THRESHOLD } = require('../constants');

function find_most_profitable_permutation(path) {
  function find_permutations(path_array, temp) {
    let current;
    if (!path_array.length) {
      const calculated_path_and_difference =
        calculate_percentage_difference_of_path(temp);

      all_permutations_for_order =
        all_permutations_for_order.price_percentage_difference <
        calculated_path_and_difference.price_percentage_difference
          ? calculated_path_and_difference
          : all_permutations_for_order;
    }
    for (let i = 0; i < path_array.length; i++) {
      current = path_array.splice(i, 1)[0];
      find_permutations(path_array, temp.concat(current));
      path_array.splice(i, 0, current);
    }
  }

  let all_permutations_for_order = {
    price_percentage_difference: 0,
  };
  find_permutations(path, []);

  return all_permutations_for_order;
}

function calculate_percentage_difference_of_path(path) {
  verfiy_token_path(path);

  let arbitrary_amount = 1;

  for (const liqudity_pool of path) {
    

    if (liqudity_pool.exchange === 'uniswapV3') {
      //calculate token amount out with uniswap v3
      arbitrary_amount = uniswap_V3_swap_math(liqudity_pool, arbitrary_amount);
    } else {
      //calculate token amount out with uniswap v2 and sushiswap
      arbitrary_amount = uniswap_V2_sushiswap_swap_math(
        liqudity_pool,
        arbitrary_amount
      );

     
    }
  }
  const starting_price = 1;
  const current_price = arbitrary_amount;

  const absoluteDifference = current_price - starting_price;

  const average = (current_price + starting_price) / 2;

  const price_percentage_difference = (absoluteDifference / average) * 100;
  return {
    price_percentage_difference: price_percentage_difference,
    path: path,
  };
}

function check_all_structured_paths(paths) {
  const inital_check_profitable_paths = [];

  for (const { path, token_ids, pool_addresses } of paths) {
    const most_profitable_permutation = find_most_profitable_permutation(path);

    if (
      most_profitable_permutation.price_percentage_difference >
      PRICE_PERCENTAGE_DIFFERENCE_THRESHOLD
    ) {
      most_profitable_permutation.token_ids = token_ids;

      most_profitable_permutation.pool_addresses = pool_addresses;

      inital_check_profitable_paths.push(most_profitable_permutation);
    }
  }
  return inital_check_profitable_paths;
}

module.exports = { check_all_structured_paths };
