/// <reference path="./node_modules/assemblyscript/std/assembly.d.ts" />
/// <reference path="./node_modules/the-graph-wasm/index.d.ts" />
/// <reference path="./dist/Meme.types.ts" />
/// <reference path="./dist/MemeRegistry.types.ts" />

export function handleRegistryEntryEvent(event: EthereumEvent): void {
  // Extract event arguments
  let registryEntryAddress = event.params[0].value.toAddress()
  let eventType = event.params[1].value.toString()

  if (eventType === 'constructed') {
    // Create an instance of the 'Meme' contract
    let memeContract = new Meme(registryEntryAddress, event.blockHash)

    // Obtain registry entry and meme data from the contract
    let registryEntryData = memeContract.loadRegistryEntry()
    let registryEntryChallengeData = memeContract.loadRegistryEntryChallenge()
    let memeData = memeContract.loadMeme()

    // Create an entity to push into the database
    let meme = new Entity()
    meme.setAddress('regEntry_address', registryEntryAddress)
    meme.setU256('regEntry_version', registryEntryData.value0)
    meme.setU32('regEntry_status', registryEntryData.value1)
    meme.setAddress('regEntry_creator', registryEntryData.value2)
    meme.setU256('regEntry_deposit', registryEntryData.value3)
    meme.setU256('regEntry_challengePeriodEnd', registryEntryData.value4)

    meme.setAddress('challenge_challenger', registryEntryChallengeData.value1)
    meme.setU256('challenge_rewardPool', registryEntryChallengeData.value2)
    meme.setBytes('challenge_metaHash', registryEntryChallengeData.value3)
    meme.setU256('challenge_commitPeriodEnd', registryEntryChallengeData.value4)
    meme.setU256('challenge_revealPeriodEnd', registryEntryChallengeData.value5)
    meme.setU256('challenge_votesFor', registryEntryChallengeData.value6)
    meme.setU256('challenge_votesAgainst', registryEntryChallengeData.value7)
    meme.setU256('challenge_claimedRewardOn', registryEntryChallengeData.value8)

    meme.setU256('regEntry_createdOn', event.params[3].value.toU256())

    database.create('Meme', registryEntryAddress.toString(), meme)

  } else if (eventType === 'challengeCreated') {
    let memeContract = new Meme(registryEntryAddress, event.blockHash)

    let registryEntryData = memeContract.loadRegistryEntry()
    let registryEntryChallengeData = memeContract.loadRegistryEntryChallenge()
    let memeData = memeContract.loadMeme()

    let meme = new Entity()
    meme.setAddress('regEntry_address', registryEntryAddress)
    meme.setU256('regEntry_version', registryEntryData.value0)
    meme.setU32('regEntry_status', registryEntryData.value1)
    meme.setAddress('regEntry_creator', registryEntryData.value2)
    meme.setU256('regEntry_deposit', registryEntryData.value3)
    meme.setU256('regEntry_challengePeriodEnd', registryEntryData.value4)

    meme.setAddress('challenge_challenger', registryEntryChallengeData.value1)
    meme.setU256('challenge_rewardPool', registryEntryChallengeData.value2)
    meme.setBytes('challenge_metaHash', registryEntryChallengeData.value3)
    meme.setU256('challenge_commitPeriodEnd', registryEntryChallengeData.value4)
    meme.setU256('challenge_revealPeriodEnd', registryEntryChallengeData.value5)
    meme.setU256('challenge_votesFor', registryEntryChallengeData.value6)
    meme.setU256('challenge_votesAgainst', registryEntryChallengeData.value7)
    meme.setU256('challenge_claimedRewardOn', registryEntryChallengeData.value8)

    meme.setU256('challenge_createdOn', event.params[3].value.toU256())

    database.update('Meme', registryEntryAddress.toString(), meme)
    
  } else if (eventType === 'voteCommitted') {
    return
  } else if (eventType === 'voteRevealed') {
    return
  } else if (eventType === 'challengeRewardClaimed') {
    return
  } else if (eventType === 'depositTransferred') {
    return
  } else if (eventType === 'minted') {
    return
  } else if (eventType === 'changeApplied') {
    return
  }
}
