/** Contract Helpers */
class Helpers {
  static registryEntry(regEntry: ParamChange__loadRegistryEntryResult): Entity {
    let entity = new Entity()
    entity.setU256('regEntry_version', regEntry.value0)
    entity.setU32('regEntry_status', regEntry.value1)
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
    entity.setU32('paramChange_valueType', paramChange.value2)
    entity.setU256('paramChange_value', paramChange.value3)
    entity.setU256('paramChange_appliedOn', paramChange.value4)

    return entity
  }
}

export function handleParamRegistryEntryEvent(event: RegistryEntryEvent): void {
  // Extract event arguments
  let registryEntryAddress = event.params.registryEntry
  let eventType = event.params.eventType.toString()

  if (eventType == 'constructed') {
    //let paramChangeContract = ParamChange.bind(registryEntryAddress, event.blockHash)
    //let paramChangeData = paramChangeContract.loadParamChange()
    //let registryEntryData = paramChangeContract.loadRegistryEntry()
    //let registryEntryChallengeData = paramChangeContract.loadRegistryEntryChallenge()
    //let paramChange = Helpers.registryEntry(registryEntryData).merge([
    //  Helpers.registryEntryChallenge(registryEntryChallengeData),
    //  Helpers.paramChange(paramChangeData),
    //])
    //paramChange.setString('id', registryEntryAddress.toString())
    //paramChange.setAddress('regEntry_address', registryEntryAddress)
    //paramChange.setU256('regEntry_createdOn', event.timestamp)
    //database.create('ParamChange', registryEntryAddress.toString(), paramChange)
  } else if (eventType == 'challengeCreated') {
    //let paramChangeContract = ParamChange.bind(registryEntryAddress, event.blockHash)
    //let registryEntryData = paramChangeContract.loadRegistryEntry()
    //let registryEntryChallengeData = paramChangeContract.loadRegistryEntryChallenge()
    //let paramChangeData = paramChangeContract.loadParamChange()
    //let paramChange = Helpers.registryEntry(registryEntryData).merge([
    //  Helpers.registryEntryChallenge(registryEntryChallengeData),
    //  Helpers.paramChange(paramChangeData),
    //])
    //paramChange.setAddress('regEntry_address', registryEntryAddress)
    //paramChange.setU256('challenge_createdOn', timestamp)
    //database.create('ParamChange', registryEntryAddress.toString(), paramChange)
  } else if (eventType == 'voteCommitted') {
  } else if (eventType == 'depositTransferred') {
    return
  } else if (eventType == 'minted') {
    return
  } else if (eventType == 'changeApplied') {
    return
  }
}
