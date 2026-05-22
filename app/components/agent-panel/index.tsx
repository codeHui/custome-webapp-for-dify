'use client'
import type { FC } from 'react'
import React from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import type { AgentConfig } from '@/types/app'

export interface IAgentPanelProps {
  agents: AgentConfig[]
  currentAgentAppId: string
  collapsed: boolean
  onToggleCollapsed: () => void
  onSelectAgent: (appId: string) => void
}

const getAgentInitials = (name: string) => {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('') || 'AI'
}

const AgentPanel: FC<IAgentPanelProps> = ({
  agents,
  currentAgentAppId,
  collapsed,
  onToggleCollapsed,
  onSelectAgent,
}) => {
  const { t } = useTranslation()

  return (
    <div
      className={[
        'shrink-0 flex flex-col overflow-hidden border-r border-slate-800/70 bg-slate-950 text-slate-100 transition-all duration-200',
        collapsed ? 'w-[76px]' : 'w-[248px]',
        'tablet:h-[calc(100vh_-_3rem)] mobile:h-screen',
      ].join(' ')}
    >
      <div className='flex h-12 items-center justify-between border-b border-white/10 px-3'>
        {!collapsed && (
          <div className='flex items-center gap-2 overflow-hidden'>
            <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300'>
              <CpuChipIcon className='h-4 w-4' />
            </div>
            <div className='truncate text-sm font-semibold tracking-[0.02em]'>{t('app.chat.agents')}</div>
          </div>
        )}
        <button
          type='button'
          title={collapsed ? t('app.chat.showAgents') : t('app.chat.hideAgents')}
          onClick={onToggleCollapsed}
          className='flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white'
        >
          {collapsed ? <ChevronRightIcon className='h-4 w-4' /> : <ChevronLeftIcon className='h-4 w-4' />}
        </button>
      </div>

      <div className='flex-1 space-y-2 overflow-y-auto px-2 py-3'>
        {agents.map((agent) => {
          const isCurrent = agent.appId === currentAgentAppId

          return (
            <button
              type='button'
              key={agent.appId}
              title={agent.name}
              onClick={() => onSelectAgent(agent.appId)}
              className={[
                'group flex w-full items-center gap-3 rounded-2xl border px-2.5 py-2.5 text-left transition',
                collapsed ? 'justify-center px-0' : '',
                isCurrent
                  ? 'border-cyan-400/50 bg-cyan-400/12 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.15)]'
                  : 'border-white/8 bg-white/[0.03] text-slate-300 hover:border-white/15 hover:bg-white/[0.06] hover:text-white',
              ].join(' ')}
            >
              <div
                className={[
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-semibold tracking-[0.08em]',
                  isCurrent ? 'bg-cyan-300 text-slate-950' : 'bg-white/10 text-slate-200 group-hover:bg-white/15',
                ].join(' ')}
              >
                {getAgentInitials(agent.name)}
              </div>

              {!collapsed && (
                <div className='min-w-0 flex-1'>
                  <div className='truncate text-sm font-medium'>{agent.name}</div>
                  <div className='truncate text-[11px] text-slate-400'>{agent.appId}</div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default React.memo(AgentPanel)
