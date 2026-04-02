import { c as _c } from "react-compiler-runtime";
import React, { useEffect, useState } from 'react';
import { Spinner } from '../components/Spinner.js';
import { useTimeout } from '../hooks/useTimeout.js';
import { Box, Text } from '../ink.js';
import { getProviderConfig } from './providerConfig.js';

export interface PreflightCheckResult {
  success: boolean;
  error?: string;
  sslHint?: string;
}

async function checkProviderEndpoint(): Promise<PreflightCheckResult> {
  try {
    const config = getProviderConfig();
    
    // If no provider configured, skip check and allow through
    if (!config.baseUrl) {
      return { success: true };
    }

    // Try to reach the provider's models endpoint
    const response = await fetch(`${config.baseUrl}/models`, {
      method: 'GET',
      headers: config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {},
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      return { success: true };
    }

    return {
      success: false,
      error: `Provider returned status ${response.status}`
    };
  } catch (error) {
    // Don't fail on connection errors - let the user configure later
    return { success: true };
  }
}

interface PreflightStepProps {
  onSuccess: () => void;
}

export function PreflightStep(t0) {
  const $ = _c(12);
  const {
    onSuccess
  } = t0;
  const [result, setResult] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const showSpinner = useTimeout(500) && isChecking;
  let t1;
  let t2;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = () => {
      const run = async function run() {
        const checkResult = await checkProviderEndpoint();
        setResult(checkResult);
        setIsChecking(false);
      };
      run();
    };
    t2 = [];
    $[0] = t1;
    $[1] = t2;
  } else {
    t1 = $[0];
    t2 = $[1];
  }
  useEffect(t1, t2);
  let t3;
  let t4;
  if ($[2] !== onSuccess || $[3] !== result) {
    t3 = () => {
      // Always proceed - skip preflight for PointCode
      onSuccess();
    };
    t4 = [onSuccess];
    $[2] = onSuccess;
    $[3] = result;
    $[4] = t3;
    $[5] = t4;
  } else {
    t3 = $[4];
    t4 = $[5];
  }
  useEffect(t3, t4);
  let t5;
  if ($[6] !== isChecking || $[7] !== showSpinner) {
    t5 = isChecking && showSpinner ? <Box paddingLeft={1}><Spinner /><Text>Initializing PointCode...</Text></Box> : null;
    $[6] = isChecking;
    $[7] = showSpinner;
    $[9] = t5;
  } else {
    t5 = $[9];
  }
  let t6;
  if ($[10] !== t5) {
    t6 = <Box flexDirection="column" gap={1} paddingLeft={1}>{t5}</Box>;
    $[10] = t5;
    $[11] = t6;
  } else {
    t6 = $[11];
  }
  return t6;
}
