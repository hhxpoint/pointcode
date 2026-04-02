import type { Command } from '../../commands.js'
import { shouldInferenceConfigCommandBeImmediate } from '../../utils/immediateCommand.js'

export default {
  type: 'local',
  name: 'provider',
  description:
    '\u67e5\u770b\u548c\u5207\u6362 AI \u670d\u52a1\u5546 / Manage AI providers',
  argumentHint: '[list|set <provider_id>|key <provider_id> <api_key>]',
  supportsNonInteractive: true,
  get immediate() {
    return shouldInferenceConfigCommandBeImmediate()
  },
  load: () => import('./provider.js'),
} satisfies Command
