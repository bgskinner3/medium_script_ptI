const {
  FEE_TEIR_PERCENTAGE_OBJECT,
  MIN_USD_VALUE_FOR_OPTIMAL_INPUT_RANGE,
  MAX_USD_VALUE_FOR_OPTIMAL_INPUT_RANGE,
  STEP_BETWEEN_RANGE,
} = require('../constants');
const {
  verfiy_token_path,
  uniswap_V2_sushiswap_swap_math,
  uniswap_V3_swap_math,
} = require('./utlis');

/**
 * we generate an array of possible input token amoutns using the loan pools valutaion in usd
 * @param {*} borrow_token_usd_price
 * @returns
 */

function generate_optimal_token_input_amounts(borrow_token_usd_price) {
  const token_input_amounts = [];
  for (
    let i = MIN_USD_VALUE_FOR_OPTIMAL_INPUT_RANGE;
    i <= MAX_USD_VALUE_FOR_OPTIMAL_INPUT_RANGE;
    i += STEP_BETWEEN_RANGE
  ) {
    const amount_in = i / borrow_token_usd_price;
    token_input_amounts.push([amount_in, i]);
  }

  return token_input_amounts;
}

function get_all_path_permutations(path) {
  function find_permutations(path_array, temp) {
    let current;

    if (!path_array.length) {
      permutations.push(temp);
    }
    for (let i = 0; i < path_array.length; i++) {
      current = path_array.splice(i, 1)[0];
      find_permutations(path_array, temp.concat(current));
      path_array.splice(i, 0, current);
    }
  }

  let permutations = [];

  find_permutations(path, []);
  return permutations;
}
function calculate_new_token_amount(pool, input_amount, calcuations) {
  const token_out_reserves =
    pool.token_out === pool.token0.id
      ? Number(pool.reserve0)
      : Number(pool.reserve1);

  if (pool.exchange === 'uniswapV3') {
    //calculate token amount out with uniswap v3
    input_amount = uniswap_V3_swap_math(pool, input_amount);
  } else {
    //calculate token amount out with uniswap v2 and sushiswap
    input_amount = uniswap_V2_sushiswap_swap_math(pool, input_amount);
  }
  calcuations.enough_liquidity = input_amount < token_out_reserves;

  return input_amount;
}

function calculate_permutation_and_find_optimal_input_token_amount(
  permutation_path,
  loan_pools
) {
  try {
    verfiy_token_path(permutation_path);

    const loan_pool = loan_pools[permutation_path[0].token_in];

    const calcuations = {
      optimal_amount: 0,
      profit: 0,
      usd_input_amount: 0,
      starting_amount: 0,
      path: permutation_path,
      enough_liquidity: true,
    };
    if (loan_pool) {
      const borrow_token_usd_price =
        permutation_path[0].token_in === loan_pool.token0.id
          ? loan_pool.token_0_usd_price
          : loan_pool.token_1_usd_price;

      const loan_fee = 1 - FEE_TEIR_PERCENTAGE_OBJECT[loan_pool.feeTier];

      const amounts = generate_optimal_token_input_amounts(
        borrow_token_usd_price
      );
      for (const [starting_amount, usd_input_amount] of amounts) {
        calcuations.enough_liquidity = true;
        let input_amount = starting_amount * loan_fee;
        const [pool_1, pool_2, pool_3] = permutation_path;

        input_amount = calculate_new_token_amount(
          pool_1,
          input_amount,
          calcuations
        );

        input_amount = calculate_new_token_amount(
          pool_2,
          input_amount,
          calcuations
        );
        input_amount = calculate_new_token_amount(
          pool_3,
          input_amount,
          calcuations
        );
        const profit =
          (input_amount - starting_amount) * borrow_token_usd_price;
        if (!calcuations.enough_liquidity) {
          return;
        }
        if (calcuations.profit === 0) {
          calcuations.profit = profit;
          calcuations.optimal_amount = starting_amount;
          calcuations.usd_input_amount = usd_input_amount;
          calcuations.starting_amount = starting_amount;
        }

        if (calcuations.profit < profit) {
          calcuations.profit = profit;
          calcuations.optimal_amount = starting_amount;
          calcuations.usd_input_amount = usd_input_amount;
          calcuations.starting_amount = starting_amount;
          calcuations.ending_amount = input_amount - starting_amount;
        } else if (calcuations.profit > profit) {
          return calcuations;
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
}
function find_most_optimal_permutation(
  all_calculated_permutations,
  path_object
) {
  let most_profitable_permutation = all_calculated_permutations.shift();

  for (const curreent of all_calculated_permutations) {
    if (most_profitable_permutation.profit < curreent.profit) {
      most_profitable_permutation = curreent;
    }
  }
  path_object.path = most_profitable_permutation.path;
  path_object.profit_usd = most_profitable_permutation.profit;
  path_object.optimal_amount = most_profitable_permutation.optimal_amount;
  path_object.usd_input_amount = most_profitable_permutation.usd_input_amount;
  path_object.starting_amount = most_profitable_permutation.starting_amount;
  path_object.ending_amount = most_profitable_permutation.ending_amount;
}

function off_chain_check(path_object) {
  const { path, loan_pools } = path_object;
  const all_calculated_perms = [];
  const all_path_permutations = get_all_path_permutations(path);

  for (const permutation of all_path_permutations) {
    const calculated_values =
      calculate_permutation_and_find_optimal_input_token_amount(
        permutation,
        loan_pools
      );

    if (calculated_values) {
      all_calculated_perms.push(calculated_values);
    }
  }
  if (all_calculated_perms.length) {
    find_most_optimal_permutation(all_calculated_perms, path_object);
  } else {
    path_object.enough_liquidity = false;
  }
}

module.exports = { off_chain_check };
