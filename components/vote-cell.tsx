'use client'

import { cn } from '@/lib/utils'
import type { Vote } from '@/lib/vote-config'

interface VoteCellProps {
  value: Vote
  proLabel: string
  conLabel: string
  onVote: (side: 'pro' | 'con') => void
}

/** 单个评审在单个环节的投票：左紫=正方，右粉=反方，小按钮，可再点取消 */
export function VoteCell({ value, proLabel, conLabel, onVote }: VoteCellProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        type="button"
        aria-label={proLabel}
        aria-pressed={value === 'pro'}
        onClick={() => onVote('pro')}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg text-base font-black transition-all duration-150',
          value === 'pro'
            ? 'scale-105 bg-pro text-pro-foreground shadow-[0_0_16px_-2px_var(--pro)]'
            : 'bg-pro-soft text-foreground/60 hover:text-foreground',
        )}
      >
        正
      </button>
      <button
        type="button"
        aria-label={conLabel}
        aria-pressed={value === 'con'}
        onClick={() => onVote('con')}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg text-base font-black transition-all duration-150',
          value === 'con'
            ? 'scale-105 bg-con text-con-foreground shadow-[0_0_16px_-2px_var(--con)]'
            : 'bg-con-soft text-foreground/60 hover:text-foreground',
        )}
      >
        反
      </button>
    </div>
  )
}
