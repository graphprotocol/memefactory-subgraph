/** Contract Helpers */
class Helpers {
  static registryEntry(regEntry: Meme__loadRegistryEntryResult): Entity {
    let entity = new Entity()
    entity.setU32('regEntry_version', Token.fromU256(regEntry.value0).toU32())
    entity.setU32('regEntry_status', regEntry.value1)
    entity.setAddress('regEntry_creator', regEntry.value2)
    entity.setU32('regEntry_deposit', Token.fromU256(regEntry.value3).toU32())
    entity.setU256('regEntry_challengePeriodEnd', regEntry.value4)
    return entity
  }

  static registryEntryChallenge(
    regEntryChallenge: Meme__loadRegistryEntryChallengeResult
  ): Entity {
    let entity = new Entity()
    entity.setString('challenge_challenger', regEntryChallenge.value1.toHex())
    entity.setU32(
      'challenge_rewardPool',
      Token.fromU256(regEntryChallenge.value2).toU32()
    )
    entity.setBytes('challenge_metaHash', regEntryChallenge.value3)
    entity.setU256('challenge_commitPeriodEnd', regEntryChallenge.value4)
    entity.setU256('challenge_revealPeriodEnd', regEntryChallenge.value5)
    entity.setU32('challenge_votesFor', Token.fromU256(regEntryChallenge.value6).toU32())
    entity.setU32(
      'challenge_votesAgainst',
      Token.fromU256(regEntryChallenge.value7).toU32()
    )
    entity.setU256('challenge_claimedRewardOn', regEntryChallenge.value8)
    return entity
  }

  static meme(meme: Meme__loadMemeResult): Entity {
    let entity = new Entity()
    entity.setBytes('meme_metaHash', meme.value0)
    entity.setU32('meme_totalSupply', Token.fromU256(meme.value1).toU32())
    entity.setU32('meme_totalMinted', Token.fromU256(meme.value2).toU32())
    entity.setU32('meme_tokenIdStart', Token.fromU256(meme.value3).toU32())
    return entity
  }
}

export function handleMemeRegistryEntryEvent(event: RegistryEntryEvent): void {
  // Extract event arguments
  let registryEntryAddress = event.registryEntry
  let eventType = event.eventType.toString()

  // Create an instance of the 'Meme' contract
  let memeContract = Meme.bind(registryEntryAddress, event.blockHash)

  // Obtain registry entry and meme data from the contract
  let memeData = memeContract.loadMeme()
  let entryData = memeContract.loadRegistryEntry()
  let challengeData = memeContract.loadRegistryEntryChallenge()

  if (eventType == 'constructed') {
    // Create the meme creator
    let creatorAddress = memeContract.creator()
    let creator = new Entity()
    creator.setString('id', creatorAddress.toHex())
    creator.setString('user_address', creatorAddress.toHex())
    database.create('User', creatorAddress.toHex(), creator)

    // Create the new meme
    let meme = Helpers.registryEntry(entryData).merge([
      Helpers.registryEntryChallenge(challengeData),
      Helpers.meme(memeData),
    ])
    meme.setString('id', registryEntryAddress.toHex())
    meme.setAddress('regEntry_address', registryEntryAddress)
    meme.setU256('regEntry_createdOn', event.timestamp)
    meme.setString('regEntry_creator', creatorAddress.toHex())
    database.create('Meme', registryEntryAddress.toHex(), meme)
  } else if (eventType == 'challengeCreated') {
    // Create challenger
    let challenger = new Entity()
    let challengerAddress = challengeData.value1
    challenger.setAddress('user_address', challengerAddress)
    database.create('User', challengerAddress.toHex(), challenger)

    // Update meme
    let meme = Helpers.registryEntry(entryData).merge([
      Helpers.registryEntryChallenge(challengeData),
      Helpers.meme(memeData),
    ])
    meme.setAddress('regEntry_address', registryEntryAddress)
    meme.setU256('challenge_createdOn', event.timestamp)
    database.update('Meme', registryEntryAddress.toHex(), meme)
  } else if (eventType == 'voteCommitted') {
    // Obtain voter address
    let eventData = event.data
    let voterAddress = eventData[0].toAddress()

    // Create the voter
    let voter = new Entity()
    voter.setAddress('user_address', voterAddress)
    database.create('User', voterAddress.toHex(), voter)

    // Create the vote
    let voteData = memeContract.loadVote(voterAddress)
    let voteId = registryEntryAddress.toHex() + '-' + voterAddress.toHex()
    let vote = new Entity()
    vote.setString('vote_voter', voterAddress.toHex())
    vote.setAddress('regEntry_address', registryEntryAddress)
    vote.setString('vote_secretHash', voteData.value0.toHex())
    vote.setU32('vote_option', voteData.value1)
    vote.setU256('vote_amount', voteData.value2)
    vote.setU256('vote_revealedOn', voteData.value3)
    vote.setU256('vote_claimedRewardOn', voteData.value4)
    vote.setU256('vote_createdOn', event.timestamp)
    database.create('Vote', voteId, vote)
  } else if (eventType == 'voteRevealed') {
    // Obtain the voter address
    let eventData = event.data
    let voterAddress = eventData[0].toAddress()

    // Update the vote
    let voteData = memeContract.loadVote(voterAddress)
    let voteId = registryEntryAddress.toHex() + '-' + voterAddress.toHex()
    let vote = new Entity()
    vote.setAddress('vote_voter', voterAddress)
    vote.setU32('vote_option', voteData.value1)
    vote.setU256('vote_revealedOn', voteData.value3)
    database.update('Vote', voteId, vote)

    // Update the meme
    let meme = Helpers.registryEntryChallenge(challengeData)
    database.update('Meme', registryEntryAddress.toHex(), meme)
  } else if (eventType == 'challengeRewardClaimed') {
    // Update the meme
    let meme = Helpers.registryEntryChallenge(challengeData)
    database.update('Meme', registryEntryAddress.toHex(), meme)
  } else if (eventType == 'depositTransferred') {
    return
  } else if (eventType == 'minted') {
    return
  } else if (eventType == 'changeApplied') {
    return
  }
}
