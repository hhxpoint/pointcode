import type { Command } from '../../commands.js'

const buddy = {
  type: 'local-jsx',
  name: 'buddy',
  description: 'Show your companion pet',
  aliases: ['companion', 'friend', 'pet'],
  isEnabled: () => true,
  isHidden: false,
  load: () => import('./BuddyCard.js'),
} satisfies Command

export default buddy
