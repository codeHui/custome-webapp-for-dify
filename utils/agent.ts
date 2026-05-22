import { AGENT_CONFIGS, DEFAULT_AGENT, SELECTED_AGENT_STORAGE_KEY } from '@/config'
import type { AgentConfig } from '@/types/app'

export const getAgentByAppId = (appId?: string | null): AgentConfig | undefined => {
  if (!appId) { return undefined }

  return AGENT_CONFIGS.find(agent => agent.appId === appId)
}

export const getStoredSelectedAgentAppId = () => {
  const fallbackAppId = DEFAULT_AGENT?.appId || ''

  if (typeof window === 'undefined') { return fallbackAppId }

  const storedAppId = globalThis.localStorage?.getItem(SELECTED_AGENT_STORAGE_KEY) || ''
  return getAgentByAppId(storedAppId)?.appId || fallbackAppId
}

export const setStoredSelectedAgentAppId = (appId: string) => {
  if (typeof window === 'undefined') { return }

  if (!getAgentByAppId(appId)) {
    globalThis.localStorage?.removeItem(SELECTED_AGENT_STORAGE_KEY)
    return
  }

  globalThis.localStorage?.setItem(SELECTED_AGENT_STORAGE_KEY, appId)
}

export const getSelectedAgent = (appId?: string | null) => {
  return getAgentByAppId(appId) || DEFAULT_AGENT
}
