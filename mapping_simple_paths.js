/**
 * The desgin of this algo can be broken down into four stages.
 *
 * 1. building the the graaph/ adjacency list from the input object that was built by
 * merging all the exchange objects called from the subgraph.
 *
 * 2. forming the tree for the graph and getting the list of removed edges when finding the
 * paths between each coin.
 *
 * 3. finding each cycle connecting th eends of the removed edges.
 *
 *
 *
 * note. the more exchanges and tokens inputed here the higher percentage of longer trade
 * routes there are.
 *
 */

/**
 * here we destructure the object into three different mappings containing
 * information to determine pairs and inject relevant information for
 * later calculation
 * @param {*} exchangeObject
 * @param {*} pairUUID
 * @param {*} poolAddresses
 * @param {*} poolInfo
 * @returns
 */

function get_multiple_objects_for_mapping(
  exchangeObject,
  pairUUID = {},
  poolAddresses = {},
  poolInfo = {}
) {
  for (const pair of exchangeObject) {
    const key1 = `${pair.token0.id}-${pair.token1.id}`;
    const key2 = `${pair.token1.id}-${pair.token0.id}`;

    pairUUID[pair.token0.id]
      ? pairUUID[pair.token0.id].add(pair.token1.id)
      : (pairUUID[pair.token0.id] = new Set([pair.token1.id]));
    pairUUID[pair.token1.id]
      ? pairUUID[pair.token1.id].add(pair.token0.id)
      : (pairUUID[pair.token1.id] = new Set([pair.token0.id]));

    poolAddresses[key1]
      ? poolAddresses[key1].add(`${pair.id}`)
      : (poolAddresses[key1] = new Set([`${pair.id}`]));
    poolAddresses[key2]
      ? poolAddresses[key2].add(`${pair.id}`)
      : (poolAddresses[key2] = new Set([`${pair.id}`]));

   
    poolInfo[pair.id] = pair;
  }

  return [pairUUID, poolAddresses, poolInfo];
}

/**
 * The poolAddresses and pairIds are the collection of 1....n exchanges.
 * this is determined when calling the exported function. Here we create a graph and
 * adjency list were each token (named by thier UUID) is considered its own node.
 * @param {*} poolAddress
 * @param {*} pairSymbols
 * @returns
 */

function build_adjacency_list(poolAddress, pairSymbols) {
  const vertArr = [];
  for (const key in poolAddress) {
    poolAddress[key] = Array.from(poolAddress[key]);
  }

  for (let key in pairSymbols) {
    let verticeObj = {
      vertex: key,
      neighbors: Array.from(pairSymbols[key]),
    };
    vertArr.push(verticeObj);
  }

  let graph = {
    vertices: vertArr,
  };

  return { graph, poolAddress };
}

/**
 *
 * The tree is based as a Hash-map of token objects. It takes the graph and returns the
 * tree depcited
 *
 * const tree = {
 *    "Token1" => {"Token2"},
 *    "Token2" => {"Token1", "Token3", "Token4"},
 *    "Token3" => {"Token2"},
 *    "Token4" => {"Token2"}
 * }
 *
 *  A Map is used to store the tree and all the certices of the input graph are added
 * to the tree.
 * A set is maintianed to keep track of the visited edges while creating the tree.
 *
 *
 *
 * @param {
 * } graph
 * @returns
 */

function get_tree(graph) {
  const spannigTree = new Map();

  for (const coin of graph.vertices) {
    spannigTree.set(coin.vertex, new Set());
  }

  let visitedVertices = new Set();

  graph.vertices.forEach((node) => {
    node.neighbors.forEach((child) => {
      if (!visitedVertices.has(child)) {
        visitedVertices.add(child);
        spannigTree.get(node.vertex).add(child);
        spannigTree.get(child).add(node.vertex);
      }
    });
  });
  return spannigTree;
}

/**
 * We get the  cycles in the input graph with DFS on the Tree. 
 * 
 * Each removed edge form the graph is apart of a cycle. There exists a simple path in
 *  the input graph connecting one end of the removed edge to the other. 
 * Since the spanning tree won’t have any cycles, a simple path can be traced 
 * from any token to any other token. If we take the two ends of a removed edge 
 * and trace the simple path between both in the spanning tree, we get a cycle.
 * 
 * 
 * the end result is an array [0]....n, consisting of the token UUIDs
 * 
 * [
    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    '0x514910771af9ca656af840dff83e8264ecf986ca'
    ]
 * 
 * @param {*} graph 
 * @param {*} spannigTree 
 * @returns 
 */

function get_all_cycles(graph, spannigTree) {
  let cycles = [];
  let rejectedEdges = get_rejected(graph, spannigTree);

  rejectedEdges.forEach((edge) => {
    const ends = edge.split('-');
    const start = ends[0];
    const end = ends[1];

    const cycle = find_cycle(start, end, spannigTree);

    if (cycle && cycle.length <= 3) {
      cycles.push(cycle);
    }
  });
  return cycles;
}

/**
 * This is a recursive method that takes the start and end of the removed edge and
 * performs DFS traversal recursively on the spanning tree from start until it finds the end.
 *
 *
 * Whenever an end vertex is reache, the path taken to reach it is considered a cycle.
 * Form here the getCyclePath is used to backtack and return the cycle path.
 *
 *
 *
 * @param {*} start
 * @param {*} end
 * @param {*} spannigTree
 * @param {*} visited
 * @param {*} parents
 * @param {*} current_node
 * @param {*} parent_node
 * @returns
 */

function find_cycle(
  start,
  end,
  spannigTree,
  visited = new Set(),
  parents = new Map(),
  current_node = start,
  parent_node = ' '
) {
  let cycle = null;
  visited.add(current_node);
  parents.set(current_node, parent_node);
  const destinations = spannigTree.get(current_node);
  for (const destination of destinations) {
    if (destination === end) {
      cycle = get_cycle_path(start, end, current_node, parents);
      return cycle;
    }
    if (destination === parents.get(current_node)) {
      continue;
    }
    if (!visited.has(destination)) {
      cycle = find_cycle(
        start,
        end,
        spannigTree,
        visited,
        parents,
        destination,
        current_node
      );
      if (cycle) {
        return cycle;
      }
    }
  }

  return cycle;
}

/**
 * is used when a cycle path is found between tokenA and tokenB. It captures the cycle path by backtracking
 * the tree from the end token tot he start. The 'parents' map is used to get the reference of
 * the visted tokens.
 * @param {*} start
 * @param {*} end
 * @param {*} current
 * @param {*} parents
 * @returns
 */

function get_cycle_path(start, end, current, parents) {
  let cycle = [end];
  while (current != start) {
    cycle.push(current);
    current = parents.get(current);
  }
  cycle.push(start);
  return cycle;
}

/**
 * GetRejected is a set of edges where eacg edge is represented by a key. The same custom key
 * we build to determine the connection between tokens in finding pairs between exchanges.
 * That is we take the UUID of tokenA and the UUID of tokenB and seperate them with '-'.
 *
 * The get rejected is build by iterating through the graph and adding the keys if the edges
 * that are not present in the tree we build above.
 * @param {*} graph
 * @param {*} tree
 * @returns
 */

function get_rejected(graph, tree) {
  let rejectedEdges = new Set();

  graph.vertices.forEach((node) => {
    if (tree.has(node.vertex)) {
      node.neighbors.forEach((child) => {
        if (!tree.get(node.vertex).has(child)) {
          if (!rejectedEdges.has(child + '-' + node.vertex)) {
            rejectedEdges.add(node.vertex + '-' + child);
          }
        }
      });
    }
  });
  return rejectedEdges;
}

/**
 * format_base_to_quote_tokens takes the path list, poolAddresses, and the pools information which is 
 * used to build an object of each tokens respected pool. 
 * 
 * using the path 
 * 
 * 
 * 
   [
    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    '0x514910771af9ca656af840dff83e8264ecf986ca'
    ]

    we build a key, path[0]-path[1], path[1]-path[2], path[2]-path[0]

    we use the key to get the pool holding the tokens and any other pool with the same tokens
    now that we have the pool UUID we use the UUID to get that pools infomation and build
    the object we want to return. 

    this consists of important information which we will need later for

    1. finding if the swap is profitable
    2. to use the decimals to get the right prices from ethers
    3. use the  pools UUID to listen for any new transactions



    the returned array consists of all the paths in nested arrays broken into objects....

*
[
  {
    from_To: 'USDC to USDT',
    tokenIn: {
      symbol: 'USDC',
      id: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      decimals: '6',
      derivedETH: '0.0007998961909495236324660388144395322',
      priceUSD: 0.9998389999706914
    },
    tokenOut: {
      symbol: 'USDT',
      id: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      decimals: '6',
      derivedETH: '0.0008006128835772466780126174147253052',
      priceUSD: 1.0007348377660163
    },
    price: '0.9995173086363039302583975466064934',
    exchange: 'uniswapV2',
    id: '0x3041cbd36888becc7bbcbc0045e3b1f144466f5f'
  },
  {
    from_To: 'USDT to WETH',
    tokenIn: {
      symbol: 'USDT',
      id: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      decimals: '6',
      derivedETH: '0.0008006128835772466780126174147253052',
      priceUSD: 1.0007348377660163
    },
    tokenOut: {
      symbol: 'WETH',
      id: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      decimals: '18',
      derivedETH: '1',
      priceUSD: 1249.960946537105
    },
    price: '1249.043102494010227400699204712864',
    exchange: 'uniswapV2',
    id: '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852'
  },
  {
    from_To: 'WETH to USDC',
    tokenIn: {
      symbol: 'WETH',
      id: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      decimals: '18',
      derivedETH: '1',
      priceUSD: 1249.960946537105
    },
    tokenOut: {
      symbol: 'USDC',
      id: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      decimals: '6',
      derivedETH: '0.0007998961909495236324660388144395322',
      priceUSD: 0.9998389999706914
    },
    price: '0.0007998961909495236324660388144395322',
    exchange: 'uniswapV2',
    id: '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc'
  }
]

USDC/WETH pool - > WETH/USDT pool -> USDT/USDC pool 


/**
 * some keys have multiple addresses attached, we pull off the various ordered
 * permutations from the collected address list
 [
     [
      0x1f9840a85d5af5bf1d1762f925bdaddc4201f984,
      0x1f9840a85d5af5bf1d1762f925bdaddc4201f984
     ],

     [
    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    '0x514910771af9ca656af840dff83e8264ecf986ca'
     ],

     [
    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    '0x514910771af9ca656af840dff83e8264ecf986ca',
    0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
    ],
 ],
 * 
 * @param {*} addresses
 * @param {*} loop
 * @param {*} result
 * @param {*} current
 * @returns
 */

function get_all_address_permutations(
  addresses,
  loop = 0,
  result = [],
  current = []
) {
  if (loop === addresses.length) {
    result.push(current);
  } else {
    addresses[loop].forEach((item) => {
      get_all_address_permutations(addresses, loop + 1, result, [
        ...current,
        item,
      ]);
    });
  }

  return result;
}

function build_base_to_quote_keys(cycle, poolAddress) {
  const [first_token_id, second_token_id, third_token_id] = cycle;
  const first_pool_key = `${first_token_id}-${second_token_id}`;
  const second_pool_key = `${second_token_id}-${third_token_id}`;
  const third_pool_key = `${third_token_id}-${first_token_id}`;

  const addresses = [
    poolAddress[first_pool_key],
    poolAddress[second_pool_key],
    poolAddress[third_pool_key],
  ];

  const all_paths_from_cycle = get_all_address_permutations(addresses);

  return all_paths_from_cycle;
}



function formatted_path_information(path, poolInfo) {
  const { keys, token_ids } = path;
  const path_information_ordered = [];

  for (const addresses of keys) {
    const [pool_id_1, pool_id_2, pool_id_3] = addresses;

    const swap_1 = poolInfo[pool_id_1];

    const swap_2 = poolInfo[pool_id_2];

    const swap_3 = poolInfo[pool_id_3];

    const formatted = {
      path: [swap_1, swap_2, swap_3],
      token_ids: token_ids,
      pool_addresses: [swap_1.id, swap_2.id, swap_3.id],
    };

    path_information_ordered.push(formatted);
  }
  return path_information_ordered;
}

function produce_simple_exchange_paths(exchangeObject) {
  const path_keys_and_ids = [];
  const simple_paths = [];

  const [pairUUID, poolAddresses, poolInfo] =
    get_multiple_objects_for_mapping(exchangeObject);
  const { graph, poolAddress } = build_adjacency_list(poolAddresses, pairUUID);
  const tree = get_tree(graph);
  const cycles = get_all_cycles(graph, tree);

  for (const cycle of cycles) {
    const keys = build_base_to_quote_keys(cycle, poolAddress);

    path_keys_and_ids.push({ keys: keys, token_ids: cycle });
  }

  for (const path of path_keys_and_ids) {
    const path_with_liqudity_pool_info = formatted_path_information(
      path,
      poolInfo
    );
    simple_paths.push(...path_with_liqudity_pool_info);
  }

  return simple_paths;
}

module.exports = {
  produce_simple_exchange_paths,
};


