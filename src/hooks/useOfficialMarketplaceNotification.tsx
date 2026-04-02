import * as React from 'react';
import type { Notification } from '../context/notifications.js';
import { Text } from '../ink.js';
import { logForDebugging } from '../utils/debug.js';
import { checkAndInstallOfficialMarketplace } from '../utils/plugins/officialMarketplaceStartupCheck.js';
import { useStartupNotification } from './notifs/useStartupNotification.js';

/**
 * Hook that handles official marketplace auto-installation and shows
 * notifications for success/failure in the bottom right of the REPL.
 */
export function useOfficialMarketplaceNotification() {
  useStartupNotification(_temp);
}
async function _temp() {
  if (process.env.CLAUDE_CODE_USE_OPENAI === '1') {
    return [];
  }
  const result = await checkAndInstallOfficialMarketplace();
  const notifs = [];
  if (result.configSaveFailed) {
    logForDebugging("Showing marketplace config save failure notification");
    notifs.push({
      key: "marketplace-config-save-failed",
      jsx: <Text color="error">Failed to save plugin registry retry info · Check local config permissions</Text>,
      priority: "immediate",
      timeoutMs: 10000
    });
  }
  if (result.installed) {
    logForDebugging("Showing marketplace installation success notification");
    notifs.push({
      key: "marketplace-installed",
      jsx: <Text color="success">✓ Official plugin registry installed · /plugin to see available plugins</Text>,
      priority: "immediate",
      timeoutMs: 7000
    });
  } else {
    if (result.skipped && result.reason === "unknown") {
      logForDebugging("Showing marketplace installation failure notification");
      // Keep retry silent to avoid startup noise.
    }
  }
  return notifs;
}
