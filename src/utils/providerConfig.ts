import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..', '..');
const CONFIG_PATH = join(PROJECT_ROOT, 'config', 'provider.json');

export interface ProviderConfig {
  provider: string;
  model: string;
  baseUrl: string;
  apiKey: string;
}

const DEFAULT_PROVIDERS: Record<string, { baseUrl: string; models: string[] }> = {
  'deepseek': {
    baseUrl: 'https://api.deepseek.com',
    models: ['deepseek-chat', 'deepseek-reasoner']
  },
  'dashscope': {
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: ['qwen-plus', 'qwen-turbo', 'qwen-max', 'qwen-long']
  },
  'zhipu': {
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: ['glm-4', 'glm-4-flash', 'glm-4v']
  },
  'mimo': {
    baseUrl: 'https://api.xiaomimimo.com/v1',
    models: ['mimo-v2-pro', 'mimo-v2-flash']
  },
  'ollama': {
    baseUrl: 'http://localhost:11434/v1',
    models: ['qwen2.5:7b', 'llama3.2:3b', 'codellama:7b']
  },
  'openai': {
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo']
  },
  'custom': {
    baseUrl: '',
    models: []
  }
};

export function getAvailableProviders(): string[] {
  return Object.keys(DEFAULT_PROVIDERS);
}

export function getProviderInfo(provider: string) {
  return DEFAULT_PROVIDERS[provider] || DEFAULT_PROVIDERS['custom'];
}

export function getProviderConfig(): ProviderConfig {
  // Check environment variables first
  const envBaseUrl = process.env.OPENAI_BASE_URL || process.env.POINTCODE_BASE_URL;
  const envApiKey = process.env.OPENAI_API_KEY || process.env.POINTCODE_API_KEY;
  const envModel = process.env.OPENAI_MODEL || process.env.POINTCODE_MODEL;

  if (envBaseUrl) {
    return {
      provider: 'custom',
      model: envModel || 'default',
      baseUrl: envBaseUrl,
      apiKey: envApiKey || ''
    };
  }

  // Check config file
  if (existsSync(CONFIG_PATH)) {
    try {
      const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
      return config;
    } catch {
      // Invalid config, return default
    }
  }

  // Default empty config
  return {
    provider: '',
    model: '',
    baseUrl: '',
    apiKey: ''
  };
}

export function saveProviderConfig(config: ProviderConfig): void {
  const configDir = join(PROJECT_ROOT, 'config');
  if (!existsSync(configDir)) {
    require('fs').mkdirSync(configDir, { recursive: true });
  }
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

export function isProviderConfigured(): boolean {
  const config = getProviderConfig();
  return !!(config.baseUrl && config.model);
}

export function formatProviderList(): string {
  const lines: string[] = [];
  const providers = getAvailableProviders();
  
  for (const provider of providers) {
    const info = getProviderInfo(provider);
    lines.push(`  ${provider}: ${info.baseUrl}`);
    if (info.models.length > 0) {
      lines.push(`    Models: ${info.models.join(', ')}`);
    }
  }
  
  return lines.join('\n');
}
