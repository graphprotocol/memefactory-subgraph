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

1. Identify if there are other contracts/events we should watch
1. Identify how to handle remaining types and fields (see questions in GraphQL schema)

## Missing features already identified

- GraphQL interfaces
- `BigInt` math (required for adding votes for and votes against in challenges)
- Aggregation / counting

## Reference

This subgraph manifest is based on the following MemeFactory resources:

* [Contracts](https://github.com/district0x/memefactory/tree/master/resources/public/contracts/src)
* [GraphQL schema](https://github.com/district0x/memefactory/blob/master/src/memefactory/shared/graphql_schema.cljs)
* [Syncer with event processing](https://github.com/district0x/memefactory/blob/master/src/memefactory/server/syncer.cljs)

## Useful GraphQL queries

```graphql
{
  users {
    id
    user_address
  }
  memes {
    id
    regEntry_address
    regEntry_status
    regEntry_version
    regEntry_creator {
      id
      user_address
    }
    regEntry_deposit
    regEntry_createdOn
    regEntry_challengePeriodEnd
    challenge_comment
    challenge_votesFor
    challenge_createdOn
    challenge_challenger {
      id
      user_address
    }
    challenge_rewardPool
    challenge_votesTotal
    challenge_votesAgainst
    challenge_commitPeriodEnd
    challenge_claimedRewardOn
    challenge_revealPeriodEnd
  }
  memeVotes {
    id
    vote_option
    vote_amount
    vote_createdOn
    vote_secretHash
    vote_revealedOn
    vote_claimedRewardOn
    vote_meme {
      id
      challenge_votes {
        id
      }
    }
  }
  paramChanges {
    id
    regEntry_address
    regEntry_status
    regEntry_version
    regEntry_creator {
      id
      user_address
    }
    regEntry_deposit
    regEntry_createdOn
    regEntry_challengePeriodEnd
    challenge_comment
    challenge_votesFor
    challenge_createdOn
    challenge_challenger {
      id
      user_address
    }
    challenge_rewardPool
    challenge_votesTotal
    challenge_votesAgainst
    challenge_commitPeriodEnd
    challenge_claimedRewardOn
    challenge_revealPeriodEnd
  }
  users {
    id
    user_address
  }
}
```