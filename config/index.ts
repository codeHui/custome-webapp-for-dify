import type { AgentConfig, AppInfo } from '@/types/app'

const normalizeConfigValue = (value?: string) => value?.trim() || ''

const parseAgentConfigs = (): AgentConfig[] => {
  const rawAgentConfigs = process.env.NEXT_PUBLIC_AGENT_CONFIGS?.trim()

  if (rawAgentConfigs) {
    try {
      const parsedConfigs = JSON.parse(rawAgentConfigs)

      if (Array.isArray(parsedConfigs)) {
        return parsedConfigs
          .map((item, index) => {
            const appId = normalizeConfigValue(item?.appId)
            const apiKey = normalizeConfigValue(item?.apiKey)

            return {
              id: normalizeConfigValue(item?.id) || appId || `agent-${index + 1}`,
              name: normalizeConfigValue(item?.name) || `Agent ${index + 1}`,
              appId,
              apiKey,
            }
          })
          .filter(item => item.appId && item.apiKey)
      }
    }
    catch (error) {
      console.error('Failed to parse NEXT_PUBLIC_AGENT_CONFIGS:', error)
    }
  }

  const singleAppId = normalizeConfigValue(process.env.NEXT_PUBLIC_APP_ID)
  const singleApiKey = normalizeConfigValue(process.env.NEXT_PUBLIC_APP_KEY)

  if (!singleAppId || !singleApiKey) { return [] }

  return [{
    id: singleAppId,
    name: 'Agent 1',
    appId: singleAppId,
    apiKey: singleApiKey,
  }]
}

export const AGENT_CONFIGS = parseAgentConfigs()
export const DEFAULT_AGENT = AGENT_CONFIGS[0]
export const APP_ID = DEFAULT_AGENT?.appId || ''
export const API_KEY = DEFAULT_AGENT?.apiKey || ''
export const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`
export const APP_INFO: AppInfo = {
  title: 'Chat APP',
  description: '',
  copyright: '',
  privacy_policy: '',
  default_language: 'en',
  disable_session_same_site: false, // set it to true if you want to embed the chatbot in an iframe
}

export const isShowPrompt = false
export const promptTemplate = 'I want you to act as a javascript console.'

export const API_PREFIX = '/api'
export const AGENT_ID_HEADER_NAME = 'x-dify-app-id'
export const SELECTED_AGENT_STORAGE_KEY = 'selectedAgentAppId'

export const LOCALE_COOKIE_NAME = 'locale'

export const DEFAULT_VALUE_MAX_LEN = 48
