const axios = require('axios');

async function uniswapSubgraph_V2_Api(query) {
  try {

    const url = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2';
    const { data } = await axios.post(url, query);

    return data.data;
  } catch (error) {
    console.error('there was an issue with calling uniswap_v2 subGraph', error);
  }
}

module.exports = {
  uniswapSubgraph_V2_Api,
};
