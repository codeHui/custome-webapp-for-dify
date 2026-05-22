import type { NextRequest } from 'next/server'
import { ChatClient } from 'dify-client'
import { v4 } from 'uuid'
import { AGENT_CONFIGS, AGENT_ID_HEADER_NAME, API_URL, APP_INFO, DEFAULT_AGENT } from '@/config'

const createChatClient = (apiKey: string) => new ChatClient(apiKey, API_URL || undefined)
const clientMap = new Map<string, ReturnType<typeof createChatClient>>()

export const getAgentConfig = (request: NextRequest) => {
  const requestedAppId = request.headers.get(AGENT_ID_HEADER_NAME)
  return AGENT_CONFIGS.find(agent => agent.appId === requestedAppId) || DEFAULT_AGENT
}

export const getClient = (request: NextRequest) => {
  const agentConfig = getAgentConfig(request)

  if (!agentConfig) {
    return new ChatClient('', API_URL || undefined)
  }

  const cachedClient = clientMap.get(agentConfig.appId)

  if (cachedClient) { return cachedClient }

  const nextClient = createChatClient(agentConfig.apiKey)
  clientMap.set(agentConfig.appId, nextClient)
  return nextClient
}

export const getInfo = (request: NextRequest) => {
  const agentConfig = getAgentConfig(request)
  const sessionId = request.cookies.get('session_id')?.value || v4()
  const user = `user_${agentConfig?.appId || 'default'}:${sessionId}`
  return {
    agentConfig,
    sessionId,
    user,
  }
}

export const setSession = (sessionId: string) => {
  if (APP_INFO.disable_session_same_site) { return { 'Set-Cookie': `session_id=${sessionId}; SameSite=None; Secure` } }

  return { 'Set-Cookie': `session_id=${sessionId}` }
}
