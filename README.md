# Meme Factory Subgraph

[Meme Factory](https://memefactory.io/) subgraph for [The Graph](https://thegraph.com).

## Getting started

Like other subgraphs, the Meme Factory subgraph is built with

```sh
# Once (installs dependencies)
yarn

# Each time you want to build
yarn build-ipfs [--verbosity debug]
```

However, in order to index the subgraph, [graph-node](https://github.com/graphprotocol/graph-node) needs to run against
a Ganache testnet rather than a real Ethereum node. This is because
the Meme Factory contracts have not been deployed to a public
Ethereum network yet and we need some test data and events to
index.

### Running the testnet

In order to bring up the Ganache testnet, run the following two
commands:

```sh
# Once
tar xf ganache-db.tar.bz2

# Each time
yarn testnet
```

This will run Ganache on `http://localhost:8546`, allowing to run
graph-node as follows:

```sh
graph-node                             \
  ...                                  \
  --ethereum-rpc http://localhost:8546 \
  --subgraph IPFS_HASH
```

## TODO

1. Complete the `ParamChangeRegistry` mapping
2. Identify if there are other contracts/events we should watch
3. Identify missing features
4. Share and discuss schema and the subgraph in general with the District0x team

### Missing features already identified

- GraphQL interfaces
- `BigInt` math (required for adding votes for and votes against in challenges)
- Aggregation / counting
