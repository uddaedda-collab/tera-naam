import { BOY_ARCHETYPES } from './data/boysArchetypes'
import { GIRL_ARCHETYPES } from './data/girlsArchetypes'
import { COMPATIBILITY } from './data/compatibility'
import {
  SECRET_MEANINGS_BOY,
  SECRET_MEANINGS_GIRL,
  FUTURE_PREDICTIONS_BOY,
  FUTURE_PREDICTIONS_GIRL,
  LUCKY_COLORS,
  BOLLYWOOD_BOYS,
  BOLLYWOOD_GIRLS,
  DM_HABITS_BOY,
  DM_HABITS_GIRL,
} from './data/jokes'

function hashName(name) {
  return name.toLowerCase().split('').reduce((a, c, i) => a + c.charCodeAt(0) * (i + 1), 0)
}

function pickFromArray(arr, hash) {
  return arr[hash % arr.length]
}

function determineArchetype(name, gender) {
  const clean = name.toLowerCase().trim()
  const len = clean.length
  const vowels = (clean.match(/[aeiou]/g) || []).length
  const consonants = len - vowels
  const hash = hashName(name)

  const archetypes = gender === 'boy'
    ? Object.keys(BOY_ARCHETYPES)
    : Object.keys(GIRL_ARCHETYPES)

  const factor = hash + len * 7 + vowels * 13 + consonants * 5
  return archetypes[factor % archetypes.length]
}

function getLuckyNumber(name) {
  return (hashName(name) % 9) + 1
}

function getLuckyColor(name) {
  return LUCKY_COLORS[hashName(name) % LUCKY_COLORS.length]
}

function getMatchPercent(name) {
  return 78 + (hashName(name) % 22)
}

function getRedFlagMeter(name) {
  return 55 + (hashName(name) % 45)
}

function getDatingScore(name) {
  return 40 + (hashName(name) % 60)
}

function getRizzScore(name) {
  return 30 + (hashName(name) % 70)
}

export function analyzeName(rawName, gender = 'boy') {
  const name = rawName.trim()
  if (!name) return null

  const archetypeKey = determineArchetype(name, gender)
  const archMap = gender === 'boy' ? BOY_ARCHETYPES : GIRL_ARCHETYPES
  const arch = archMap[archetypeKey]
  const hash = hashName(name)

  const secretMeanings = gender === 'boy' ? SECRET_MEANINGS_BOY : SECRET_MEANINGS_GIRL
  const futurePredictions = gender === 'boy' ? FUTURE_PREDICTIONS_BOY : FUTURE_PREDICTIONS_GIRL
  const bollywoodChars = gender === 'boy' ? BOLLYWOOD_BOYS : BOLLYWOOD_GIRLS
  const dmHabits = gender === 'boy' ? DM_HABITS_BOY : DM_HABITS_GIRL

  const compatibilityKeys = COMPATIBILITY[archetypeKey] || []
  const compatibility = compatibilityKeys.map((key) => {
    const archData = BOY_ARCHETYPES[key] || GIRL_ARCHETYPES[key]
    return {
      type: key,
      title: archData?.title || '',
      emoji: archData?.emoji || '',
    }
  })

  return {
    name,
    gender,
    archetype: archetypeKey,
    title: arch.title,
    emoji: arch.emoji,
    color: arch.color,
    traits: arch.traits,
    superpower: arch.superpower,
    weakness: arch.weakness,
    dating: arch.dating,
    redFlag: arch.redFlag,
    futureMatch: gender === 'boy' ? arch.futureGf : arch.futureBf,
    bollywoodMatch: arch.bollywoodMatch,
    biggestL: arch.biggestL,

    luckyNumber: getLuckyNumber(name),
    luckyColor: getLuckyColor(name),
    bollywoodVibe: pickFromArray(bollywoodChars, hash),
    secretMeaning: pickFromArray(secretMeanings, hash),
    futurePrediction: pickFromArray(futurePredictions, hash * 3),
    dmHabit: pickFromArray(dmHabits, hash * 7),
    matchPercent: getMatchPercent(name),
    redFlagMeter: getRedFlagMeter(name),
    datingScore: getDatingScore(name),
    rizzScore: getRizzScore(name),

    compatibility,
  }
}
