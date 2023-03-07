const { ethers } = require('ethers');
const {
  QUOTER_CONTRACT_ADDRESS,
  UNISWAP_V2_SUSHSISWAP_ABI,
  ROUTER_ADDRESS_OBJECT,
} = require('../constants');
const { verfiy_token_path } = require('./utlis');
const Quoter = require('@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json');
const INFURA_URL_VETTING_KEY = process.env.INFURA_URL_VETTING_KEY;
const provider = new ethers.providers.JsonRpcProvider(INFURA_URL_VETTING_KEY);

async function get_amount_out_from_uniswap_V3(liquidity_pool, amount) {
  try {
    const {
      token0,
      token1,
      token_in,
      token_out,
      fee,
    } = liquidity_pool;
   

    const token_in_decimals =
      token_in === token0.id ? token0.decimals : token1.decimals;
    const token_out_decimals =
      token_out === token0.id ? token0.decimals : token1.decimals;

    const uniswap_V3_quoter_contract = new ethers.Contract(
      QUOTER_CONTRACT_ADDRESS,
      Quoter.abi,
      provider
    );
    const amouunt_in_parsed_big_int = ethers.utils.parseUnits(
      amount,
      token_in_decimals
    );


    const quotedAmountOut =
      await uniswap_V3_quoter_contract.callStatic.quoteExactInputSingle(
        token_in, // input token
        token_out, // output token
        Number(fee),
        amouunt_in_parsed_big_int,
        0
      );

    const parsed_amounts_out = ethers.utils.formatUnits(
      quotedAmountOut,
      token_out_decimals
    );

    return parsed_amounts_out;
  } catch (error) {
    console.error(error);
  }
}

async function get_amount_out_from_uniswap_V2_and_sushiswap(
  liquidity_pool,
  amount
) {
  try {
    const {
      token0,
      token1,
      exchange,
      token_in,
      token_out,
    } = liquidity_pool;

  

    const token_in_decimals =
      token_in === token0.id ? token0.decimals : token1.decimals;
    const token_out_decimals =
      token_out === token1.id ? token1.decimals : token0.decimals;

    const poolContract = new ethers.Contract(
      ROUTER_ADDRESS_OBJECT[exchange],
      UNISWAP_V2_SUSHSISWAP_ABI,
      provider
    );

    const amouunt_in_parsed_big_int = ethers.utils.parseUnits(
      amount,
      token_in_decimals
    );

    const amount_out_from_trade = await poolContract.callStatic.getAmountsOut(
      amouunt_in_parsed_big_int,
      [token_in, token_out]
    );

    const parsed_amounts_out = ethers.utils.formatUnits(
      amount_out_from_trade[1],
      token_out_decimals
    );

    return parsed_amounts_out;
  } catch (error) {
    console.error(error);
  }
}

async function on_chain_check(path_object) {
  try {
    const { path, loan_pools, optimal_amount } = path_object;
    verfiy_token_path(path);

    const loan_pool = loan_pools[path[0].token_in];
 
    const borrow_token_usd_price =
      path[0].token_in === loan_pool.token0.id
        ? loan_pool.token_0_usd_price
        : loan_pool.token_1_usd_price;

    if (loan_pool) {
      const start_amount = optimal_amount;
      let input_amount = optimal_amount;

      for (const pool of path) {
        const token_in_decimals =
          pool.token_in === pool.token0.id
            ? pool.token0.decimals
            : pool.token1.decimals;

        input_amount = Number(input_amount).toFixed(token_in_decimals);

        if (pool.exchange === 'uniswapV3') {
        
          const amounts_out = await get_amount_out_from_uniswap_V3(
            pool,
            input_amount.toString()
          );
          input_amount = amounts_out;
       
        
        } else {
          const amounts_out =
            await get_amount_out_from_uniswap_V2_and_sushiswap(
              pool,
              input_amount.toString()
            );
          input_amount = amounts_out;
        }
      }
      const profit = (input_amount - start_amount) * borrow_token_usd_price;
   
      path_object.profit_usd_onchain_check = profit;
      path_object.ending_amount = input_amount - start_amount;
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = { on_chain_check };
