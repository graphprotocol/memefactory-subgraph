/// <reference path="./node_modules/assemblyscript/std/assembly.d.ts" />
/// <reference path="./node_modules/the-graph-wasm/index.d.ts" />
/// <reference path="./dist/Meme.types.ts" />
/// <reference path="./dist/MemeRegistry.types.ts" />

/** Contract Helpers */
class RegistryEntryHelpers {
  static parseRegistryEntry(regEntry: loadRegistryEntry__Result): Entity {
      let entity = new Entity()
      entity.setU256('regEntry_version', regEntry.value0)
      entity.setU32('regEntry_status', regEntry.value1)
      entity.setAddress('regEntry_creator', regEntry.value2)
      entity.setU256('regEntry_deposit', regEntry.value3)
      entity.setU256('regEntry_challengePeriodEnd', regEntry.value4)
      return entity
  }

  static parseRegistryEntryChallenge(regEntryChallenge: loadRegistryEntryChallenge__Result): Entity {
    let entity = new Entity()
    entity.setAddress('challenge_challenger', regEntryChallenge.value1)
    entity.setU256('challenge_rewardPool', regEntryChallenge.value2)
    entity.setBytes('challenge_metaHash', regEntryChallenge.value3)
    entity.setU256('challenge_commitPeriodEnd', regEntryChallenge.value4)
    entity.setU256('challenge_revealPeriodEnd', regEntryChallenge.value5)
    entity.setU256('challenge_votesFor', regEntryChallenge.value6)
    entity.setU256('challenge_votesAgainst', regEntryChallenge.value7)
    entity.setU256('challenge_claimedRewardOn', regEntryChallenge.value8)
    return entity
  }
}

class MemeHelpers {
  static parseMeme(meme: loadMeme__Result): Entity {
    let entity = new Entity()

    entity.setBytes('meme_metaHash', meme.value0)
    entity.setU256('meme_totalSupply', meme.value1)
    entity.setU256('meme_totalMinted', meme.value2)
    entity.setU256('meme_tokenIdStart', meme.value3)

    return entity
  }
}

class ParamChangeHelpers {
  static parseParamChange(loadParamChange_Result): Entity {
    let entity = new Entity()

    entity.setAddress('paramChange_db', paramChange.value0)
    entity.setString('paramChange_key', paramChange.value1)
    entity.setU32('paramChange_valueType', paramChange.value2)
    entity.setU256('paramChange_value', paramChange.value3)
    entity.setU256('paramChange_appliedOn', paramChange.value4)

    return entity
  }
}

/** Utils */
class EntityUtils {
  static extend(target: Entity, sources: Array<Entity>): Entity {
    for (let i = 0; i < sources.length; i++) {
      let entries = sources[i].entries
      for (let j = 0; j < entries.length; j++) {
        target.set(entries[j].key, entries[j].value)
      }
    }
    return target
  }
}

export function handleMemeRegistryEntryEvent(event: EthereumEvent): void {
  // Extract event arguments
  let registryEntryAddress = event.params[0].value.toAddress()
  let eventType = event.params[1].value.toString()
  let timestamp = event.params[3].value.toU256()
  let eventData = event.params[4].value.toArray()

  if (eventType === 'constructed') {
    // Create an instance of the 'Meme' contract
    let memeContract = new Meme(registryEntryAddress, event.blockHash)

    // Obtain registry entry and meme data from the contract
    let registryEntryData = memeContract.loadRegistryEntry()
    let registryEntryChallengeData = memeContract.loadRegistryEntryChallenge()
    let memeData = memeContract.loadMeme()

    // Create an entity to push into the database
    let meme = EntityUtils.extend(
      RegistryEntryHelpers.parseRegistryEntry(registryEntryData),
      [
        RegistryEntryHelpers.parseRegistryEntryChallenge(registryEntryChallengeData),
        MemeHelpers.parseMeme(memeData)
      ]
    )



    meme.setAddress('regEntry_address', registryEntryAddress)
    meme.setU256('regEntry_createdOn', timestamp)

    database.create('Meme', registryEntryAddress.toString(), meme)

  } else if (eventType === 'challengeCreated') {
    let memeContract = new Meme(registryEntryAddress, event.blockHash)

    let registryEntryData = memeContract.loadRegistryEntry()
    let registryEntryChallengeData = memeContract.loadRegistryEntryChallenge()
    let memeData = memeContract.loadMeme()

    let meme = EntityUtils.extend(
      RegistryEntryHelpers.parseRegistryEntry(registryEntryData),
      [
        RegistryEntryHelpers.parseRegistryEntryChallenge(registryEntryChallengeData),
        MemeHelpers.parseMeme(memeData)
      ]
    )

    meme.setAddress('regEntry_address', registryEntryAddress)
    meme.setU256('challenge_createdOn', timestamp)

    database.update('Meme', registryEntryAddress.toString(), meme)

  } else if (eventType === 'voteCommitted') {
    let voterAddress = eventData[0].toAddress()
    let memeContract = new Meme(registryEntryAddress, event.blockHash)
    let voteData = memeContract.loadVote(voterAddress)
    let vote = new Entity()
    let voteId = registryEntryAddress.toString() + '-' + voterAddress.toString()

    vote.setAddress('vote_voter', voterAddress)
    vote.setAddress('regEntry_address', registryEntryAddress)

    vote.setBytes32('vote_secretHash', voteData.value0)
    vote.setU32('vote_option', voteData.value1)
    vote.setU256('vote_amount', voteData.value2)
    vote.setU256('vote_revealedOn', voteData.value3)
    vote.setU256('vote_claimedRewardOn', voteData.value4)

    vote.setU256('vote_createdOn', timestamp)

    database.create('Vote', voteId, vote)
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

export function handleParamRegistryEntryEvent(event: EthereumEvent): void {
  // Extract event arguments
  let registryEntryAddress = event.params[0].value.toAddress()
  let eventType = event.params[1].value.toString()
  let timestamp = event.params[3].value.toU256()
  let eventData = event.params[4].value.toArray()

  if (eventType === 'constructed') {
    let paramChangeContract = new ParamChange(registryEntryAddress, event.blockHash)
    let registryEntryData = paramChangeContract.loadRegistryEntry()
    let registryEntryChallengeData = paramChangeContract.loadRegistryEntryChallenge()
    let paramChangeData = paramChangeContract.loadParamChange()

    let paramChange = EntityUtils.extend(
      RegistryEntryHelpers.parseRegistryEntry(registryEntryData),
      [
        RegistryEntryHelpers.parseRegistryEntryChallenge(registryEntryChallengeData),
        ParamChangeHelpers.parseParamChange(paramChangeData)
      ]
    )

    paramChange.setAddress('regEntry_address', registryEntryAddress)
    paramChange.setU256('regEntry_createdOn', timestamp)

    database.create('ParamChange', registryEntryAddress.toString(), paramChange)
  } else if (eventType === 'challengeCreated') {
    let paramChangeContract = new ParamChange(registryEntryAddress, event.blockHash)
    let registryEntryData = paramChangeContract.loadRegistryEntry()
    let registryEntryChallengeData = paramChangeContract.loadRegistryEntryChallenge()
    let paramChangeData = paramChangeContract.loadParamChange()

    let paramChange = EntityUtils.extend(
      RegistryEntryHelpers.parseRegistryEntry(registryEntryData),
      [
        RegistryEntryHelpers.parseRegistryEntryChallenge(registryEntryChallengeData),
        ParamChangeHelpers.parseParamChange(paramChangeData)
      ]
    )

    paramChange.setAddress('regEntry_address', registryEntryAddress)
    paramChange.setU256('challenge_createdOn', timestamp)

    database.create('ParamChange', registryEntryAddress.toString(), paramChange)
  } else if (eventType === 'voteCommitted') {
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
