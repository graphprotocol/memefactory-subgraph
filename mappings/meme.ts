/** Contract Helpers */
class Helpers {
  static registryEntry(regEntry: Meme__loadRegistryEntryResult): Entity {
    let entity = new Entity()
    entity.setU256('regEntry_version', regEntry.value0)
    entity.setInt('regEntry_status', regEntry.value1)
    entity.setString('regEntry_creator', regEntry.value2.toHex())
    entity.setU256('regEntry_deposit', regEntry.value3)
    entity.setU256('regEntry_challengePeriodEnd', regEntry.value4)
    return entity
  }

  static registryEntryChallenge(
    regEntryChallenge: Meme__loadRegistryEntryChallengeResult
  ): Entity {
    let votesFor = regEntryChallenge.value6
    let votesAgainst = regEntryChallenge.value7
    let rewardPool = regEntryChallenge.value2

    let entity = new Entity()
    entity.setString('challenge_challenger', regEntryChallenge.value1.toHex())
    entity.setU256('challenge_rewardPool', rewardPool)
    entity.setBytes('challenge_metaHash', regEntryChallenge.value3)
    entity.setU256('challenge_commitPeriodEnd', regEntryChallenge.value4)
    entity.setU256('challenge_revealPeriodEnd', regEntryChallenge.value5)
    entity.setU256('challenge_votesFor', votesFor)
    entity.setU256('challenge_votesAgainst', votesAgainst)
    // TODO: entity.setU256('challenge_votesTotal', votesFor + votesAgainst)
    entity.setU256('challenge_claimedRewardOn', regEntryChallenge.value8)
    return entity
  }

  static meme(meme: Meme__loadMemeResult): Entity {
    let entity = new Entity()
    entity.setBytes('meme_metaHash', meme.value0)
    entity.setU256('meme_totalSupply', meme.value1)
    entity.setU256('meme_totalMinted', meme.value2)
    entity.setU256('meme_tokenIdStart', meme.value3)
    return entity
  }
}

export function handleMemeRegistryEntryEvent(event: RegistryEntryEvent): void {
  // Extract event arguments
  let registryEntryAddress = event.params.registryEntry
  let eventType = event.params.eventType.toString()

  // Create an instance of the 'Meme' contract
  let memeContract = Meme.bind(registryEntryAddress, event.blockHash)

  // Obtain registry entry and meme data from the contract
  let memeData = memeContract.loadMeme()
  let entryData = memeContract.loadRegistryEntry()
  let challengeData = memeContract.loadRegistryEntryChallenge()

  if (eventType == 'constructed') {
    // Create the meme creator
    let creatorAddress = entryData.value2
    let creator = new Entity()
    creator.setString('id', creatorAddress.toHex())
    creator.setString('user_address', creatorAddress.toHex())
    store.set('User', creatorAddress.toHex(), creator)

    // Create the new meme
    let meme = Helpers.registryEntry(entryData).merge([
      Helpers.registryEntryChallenge(challengeData),
      Helpers.meme(memeData),
    ])
    meme.setString('id', registryEntryAddress.toHex())
    meme.setAddress('regEntry_address', registryEntryAddress)
    meme.setU256('regEntry_createdOn', event.params.timestamp)
    store.set('Meme', registryEntryAddress.toHex(), meme)
  } else if (eventType == 'challengeCreated') {
    // Create challenger
    let challenger = new Entity()
    let challengerAddress = challengeData.value1
    challenger.setString('id', challengerAddress.toHex())
    challenger.setAddress('user_address', challengerAddress)
    store.set('User', challengerAddress.toHex(), challenger)

    // Update meme
    let meme = Helpers.registryEntry(entryData).merge([
      Helpers.registryEntryChallenge(challengeData),
      Helpers.meme(memeData),
    ])
    meme.setAddress('regEntry_address', registryEntryAddress)
    meme.setU256('challenge_createdOn', event.params.timestamp)
    store.set('Meme', registryEntryAddress.toHex(), meme)
  } else if (eventType == 'voteCommitted') {
    // Obtain voter address
    let eventData = event.params.data
    let voterAddress = eventData[0].toAddress()

    // Create the voter
    let voter = new Entity()
    voter.setString('id', voterAddress.toHex())
    voter.setAddress('user_address', voterAddress)
    store.set('User', voterAddress.toHex(), voter)

    // Create the vote
    let voteData = memeContract.loadVote(voterAddress)
    let voteId = registryEntryAddress.toHex() + '-' + voterAddress.toHex()
    let vote = new Entity()
    vote.setString('id', voteId)
    vote.setString('vote_voter', voterAddress.toHex())
    vote.setAddress('regEntry_address', registryEntryAddress)
    vote.setString('vote_secretHash', voteData.value0.toHex())
    vote.setInt('vote_option', voteData.value1)
    vote.setU256('vote_amount', voteData.value2)
    vote.setU256('vote_revealedOn', voteData.value3)
    vote.setU256('vote_claimedRewardOn', voteData.value4)
    vote.setU256('vote_createdOn', event.params.timestamp)
    store.set('Vote', voteId, vote)
  } else if (eventType == 'voteRevealed') {
    // Obtain the voter address
    let eventData = event.params.data
    let voterAddress = eventData[0].toAddress()

    // Update the vote
    let voteData = memeContract.loadVote(voterAddress)
    let voteId = registryEntryAddress.toHex() + '-' + voterAddress.toHex()
    let vote = new Entity()
    vote.setAddress('vote_voter', voterAddress)
    vote.setInt('vote_option', voteData.value1)
    vote.setU256('vote_revealedOn', voteData.value3)
    store.set('Vote', voteId, vote)

    // Update the meme
    let meme = Helpers.registryEntryChallenge(challengeData)
    store.set('Meme', registryEntryAddress.toHex(), meme)
  } else if (eventType == 'challengeRewardClaimed') {
    // Update the meme
    let meme = Helpers.registryEntryChallenge(challengeData)
    store.set('Meme', registryEntryAddress.toHex(), meme)
  } else if (eventType == 'depositTransferred') {
    // Update the meme
    let meme = Helpers.registryEntry(entryData)
    store.set('Meme', registryEntryAddress.toHex(), meme)
  } else if (eventType == 'minted') {
    // Update the meme
    let meme = Helpers.registryEntry(entryData).merge([
      Helpers.registryEntryChallenge(challengeData),
      Helpers.meme(memeData),
    ])
    store.set('Meme', registryEntryAddress.toHex(), meme)
  }
}
