import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from '../../ink.js'
import { companionUserId, getCompanion, roll } from '../../buddy/companion.js'
import { renderSprite, spriteFrameCount } from '../../buddy/sprites.js'
import {
  RARITIES,
  RARITY_COLORS,
  RARITY_STARS,
  SPECIES,
  STAT_NAMES,
  type Rarity,
  type Species,
} from '../../buddy/types.js'

interface BuddyCardProps {
  onDone: (result?: string) => void
}

export function BuddyCard({ onDone }: BuddyCardProps): React.JSX.Element {
  const [companion, setCompanion] = useState<any>(null)
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    try {
      const existing = getCompanion()
      if (existing) {
        setCompanion(existing)
        return
      }
      const { bones } = roll(companionUserId())
      setCompanion({
        ...bones,
        name: 'Unhatched Buddy',
        personality: buildFallbackPersonality(bones.species, bones.rarity),
      })
    } catch {
      setCompanion(null)
    }
  }, [])

  // Animate sprite
  useEffect(() => {
    if (!companion) return
    const timer = setInterval(() => {
      setFrame(f => (f + 1) % 3)
    }, 500)
    return () => clearInterval(timer)
  }, [companion])

  useInput((input, key) => {
    if (key.escape || input === 'q') {
      onDone()
    }
  })

  if (!companion) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="yellow">Loading companion...</Text>
      </Box>
    )
  }

  const rarity = companion.rarity as Rarity
  const species = companion.species as Species
  const rarityColor = RARITY_COLORS[rarity] ?? 'inactive'
  const rarityStars = RARITY_STARS[rarity] ?? '★'
  const lines = renderSprite(companion, frame % Math.max(1, spriteFrameCount(species)))
  const personality = wrapText(companion.personality ?? '', 48)

  return (
    <Box flexDirection="column" padding={1}>
      <Box borderStyle="round" borderColor={rarityColor} paddingX={2} paddingY={1} flexDirection="column">
        <Box justifyContent="space-between">
          <Text bold color={rarityColor}>{rarityStars} {rarity.toUpperCase()}</Text>
          <Text bold color={rarityColor}>{species.toUpperCase()}</Text>
        </Box>

        <Box marginTop={1} flexDirection="column">
          {lines.map((line, idx) => (
            <Text key={idx} color={rarityColor}>{line}</Text>
          ))}
        </Box>

        <Box marginTop={1}>
          <Text bold>{companion.name || 'Unnamed Buddy'}</Text>
        </Box>

        {personality.length > 0 && (
          <Box marginTop={1} flexDirection="column">
            {personality.map((line, idx) => (
              <Text key={idx} dimColor italic>{idx === 0 ? `"${line}` : line}{idx === personality.length - 1 ? '"' : ''}</Text>
            ))}
          </Box>
        )}

        {companion.stats && (
          <Box marginTop={1} flexDirection="column">
            {STAT_NAMES.map(name => (
              <Box key={name}>
                <Text>{name.padEnd(10)} </Text>
                <Text color={rarityColor}>{renderStatBar(companion.stats[name] ?? 0)}</Text>
                <Text> {String(companion.stats[name] ?? 0).padStart(3)}</Text>
              </Box>
            ))}
          </Box>
        )}

        <Box marginTop={1} flexDirection="column">
          <Text bold>Rarity</Text>
          {RARITIES.map(r => (
            <Box key={r}>
              <Text color={RARITY_COLORS[r]}>
                {RARITY_STARS[r]} {r}
              </Text>
            </Box>
          ))}
        </Box>

        <Box marginTop={1} flexDirection="column">
          <Text bold>Species ({SPECIES.length})</Text>
          <Text dimColor>{SPECIES.join(', ')}</Text>
        </Box>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>Press q or Esc to close</Text>
      </Box>
    </Box>
  )
}

function wrapText(text: string, width: number): string[] {
  if (!text.trim()) return []
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (next.length > width && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

function renderStatBar(value: number): string {
  const clamped = Math.max(0, Math.min(100, Math.floor(value)))
  const blocks = Math.round(clamped / 10)
  return `${'█'.repeat(blocks)}${'░'.repeat(10 - blocks)}`
}

function buildFallbackPersonality(species: Species, rarity: Rarity): string {
  return `A ${rarity} ${species} companion with sharp instincts and a mischievous debug style. It spots suspicious code fast, then stares at your stack trace like it already knew the answer.`
}
