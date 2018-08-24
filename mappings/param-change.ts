/** Contract Helpers */
class Helpers {
  static registryEntry(regEntry: ParamChange__loadRegistryEntryResult): Entity {
    let entity = new Entity()
    entity.setU256('regEntry_version', regEntry.value0)
    // entity.set('regEntry_status', regEntry.value1)
    entity.setAddress('regEntry_creator', regEntry.value2)
    entity.setU256('regEntry_deposit', regEntry.value3)
    entity.setU256('regEntry_challengePeriodEnd', regEntry.value4)
    return entity
  }

  static registryEntryChallenge(
    regEntryChallenge: ParamChange__loadRegistryEntryChallengeResult
  ): Entity {
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

  static paramChange(paramChange: ParamChange__loadParamChangeResult): Entity {
    let entity = new Entity()

    entity.setAddress('paramChange_db', paramChange.value0)
    entity.setString('paramChange_key', paramChange.value1)
    // entity.setU32('paramChange_valueType', paramChange.value2)
    entity.setU256('paramChange_value', paramChange.value3)
    entity.setU256('paramChange_appliedOn', paramChange.value4)

    return entity
  }
}

export function handleParamRegistryEntryEvent(event: RegistryEntryEvent): void {
  // Extract event arguments
  let registryEntryAddress = event.params.registryEntry
  let eventType = event.params.eventType.toString()

  // Create an instance of the 'ParamChange' contract
  let paramChangeContract = ParamChange.bind(registryEntryAddress, event.blockHash)

  // Obtain registry entry and paramChange data from the contract
  let paramChangeData = paramChangeContract.loadParamChange()
  let entryData = paramChangeContract.loadRegistryEntry()
  let challengeData = paramChangeContract.loadRegistryEntryChallenge()

  if (eventType == 'constructed') {
    // Create the paramChange creator
    let creatorAddress = entryData.value2
    let creator = new Entity()
    creator.setString('id', creatorAddress.toHex())
    creator.setString('user_address', creatorAddress.toHex())
    store.set('User', creatorAddress.toHex(), creator)

    // Create the new paramChange
    let paramChange = Helpers.registryEntry(entryData).merge([
      Helpers.registryEntryChallenge(challengeData),
      Helpers.paramChange(paramChangeData),
    ])
    paramChange.setString('id', registryEntryAddress.toHex())
    paramChange.setAddress('regEntry_address', registryEntryAddress)
    paramChange.setU256('regEntry_createdOn', event.params.timestamp)
    store.set('ParamChange', registryEntryAddress.toHex(), paramChange)
  } else if (eventType == 'challengeCreated') {
    // Create challenger
    let challenger = new Entity()
    let challengerAddress = challengeData.value1
    challenger.setString('id', challengerAddress.toHex())
    challenger.setAddress('user_address', challengerAddress)
    store.set('User', challengerAddress.toHex(), challenger)

    // Update paramChange
    let paramChange = Helpers.registryEntry(entryData).merge([
      Helpers.registryEntryChallenge(challengeData),
      Helpers.paramChange(paramChangeData),
    ])
    paramChange.setAddress('regEntry_address', registryEntryAddress)
    paramChange.setU256('challenge_createdOn', event.params.timestamp)
    store.set('ParamChange', registryEntryAddress.toHex(), paramChange)
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
    let voteData = paramChangeContract.loadVote(voterAddress)
    let voteId = registryEntryAddress.toHex() + '-' + voterAddress.toHex()
    let vote = new Entity()
    vote.setString('id', voteId)
    vote.setString('vote_voter', voterAddress.toHex())
    vote.setAddress('regEntry_address', registryEntryAddress)
    vote.setBytes('vote_secretHash', voteData.value0)
    // vote.setString('vote_option', Helpers.voteOption(voteData.value1))
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
    let voteData = paramChangeContract.loadVote(voterAddress)
    let voteId = registryEntryAddress.toHex() + '-' + voterAddress.toHex()
    let vote = new Entity()
    vote.setAddress('vote_voter', voterAddress)
    // vote.setString('vote_option', Helpers.voteOption(voteData.value1))
    vote.setU256('vote_revealedOn', voteData.value3)
    store.set('Vote', voteId, vote)

    // Update the paramChange
    let paramChange = Helpers.registryEntryChallenge(challengeData)
    store.set('ParamChange', registryEntryAddress.toHex(), paramChange)
  } else if (eventType == 'challengeRewardClaimed') {
    // Update the paramChange
    let paramChange = Helpers.registryEntryChallenge(challengeData)
    store.set('ParamChange', registryEntryAddress.toHex(), paramChange)
  } else if (eventType == 'depositTransferred') {
    // Update the paramChange
    let paramChange = Helpers.registryEntry(entryData)
    store.set('ParamChange', registryEntryAddress.toHex(), paramChange)
  } else if (eventType == 'minted') {
    // Update the paramChange
    let paramChange = Helpers.registryEntry(entryData).merge([
      Helpers.registryEntryChallenge(challengeData),
      Helpers.paramChange(paramChangeData),
    ])
    store.set('ParamChange', registryEntryAddress.toHex(), paramChange)
  }
}
