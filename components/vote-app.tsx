'use client'

import { useEffect, useState } from 'react'
import { Pencil, RotateCcw, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { JudgeHead } from '@/components/judge-head'
import { VoteCell } from '@/components/vote-cell'
import { EditPanel } from '@/components/edit-panel'
import {
  DEFAULT_CONFIG,
  ROUND_KEYS,
  ROUND_META,
  decodeConfig,
  emptyVotes,
  finalOutcome,
  judgeVerdict,
  roundWinner,
  sanitizeConfig,
  type RoundKey,
  type Side,
  type VoteConfig,
  type VoteState,
} from '@/lib/vote-config'

const STORAGE_KEY = 'debate-vote-config-v2'

export function VoteApp() {
  const [config, setConfig] = useState<VoteConfig>(DEFAULT_CONFIG)
  const [votes, setVotes] = useState<VoteState>(emptyVotes)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('c')
    if (param) {
      const decoded = decodeConfig(param)
      if (decoded) {
        setConfig(decoded)
        return
      }
    }
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) setConfig(sanitizeConfig(JSON.parse(saved)))
    } catch {
      /* ignore */
    }
  }, [])

  const castVote = (key: RoundKey, index: number, side: 'pro' | 'con') => {
    setVotes((v) => {
      const next = [...v[key]]
      next[index] = next[index] === side ? null : side // 再点一次取消
      return { ...v, [key]: next }
    })
  }

  const resetVotes = () => setVotes(emptyVotes())

  const saveConfig = (next: VoteConfig) => {
    setConfig(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
    setEditing(false)
  }

  const outcome = finalOutcome(votes, config.judges.length)

  return (
    <main
      className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background bg-cover bg-center px-3 py-3"
      style={{ backgroundImage: 'url(/bg.jpeg)' }}
    >
      <div className="flex w-full max-w-3xl flex-col gap-2.5 rounded-2xl border border-white/10 bg-background/72 p-3.5 shadow-2xl backdrop-blur-md sm:p-4">
        {/* 顶部 */}
        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-base font-black tracking-tight text-foreground sm:text-lg">{config.title}</h1>
            <div className="mt-0.5 flex items-center gap-2 text-xs font-bold">
              <span className="text-pro-foreground/90 rounded bg-pro px-1.5 py-0.5">{config.proName}</span>
              <span className="text-muted-foreground">VS</span>
              <span className="rounded bg-con px-1.5 py-0.5 text-con-foreground">{config.conName}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={resetVotes}
              className="flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              重置
            </button>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 rounded-lg bg-secondary px-2 py-1.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-muted"
            >
              <Pencil className="size-3.5" />
              编辑
            </button>
          </div>
        </header>

        {/* 评分矩阵 */}
        <div className="grid grid-cols-[3rem_repeat(4,1fr)_4.25rem] items-center gap-x-1 gap-y-1.5 rounded-xl border border-white/10 bg-card/60 p-2.5 sm:grid-cols-[3.5rem_repeat(4,1fr)_4.75rem] sm:gap-x-2">
          {/* 表头：评审照片 */}
          <div />
          {config.judges.map((j, i) => (
            <JudgeHead key={i} judge={j} />
          ))}
          <div className="text-center text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">
            结果
          </div>

          {/* 每个环节一行 */}
          {ROUND_KEYS.map((key) => {
            const r = roundWinner(votes[key])
            return (
              <div key={key} className="contents">
                <div className="flex flex-col">
                  <span className="text-sm font-black leading-tight text-foreground">{ROUND_META[key].label}</span>
                  <span className="text-[0.65rem] text-muted-foreground">第{ROUND_META[key].index}轮</span>
                </div>
                {config.judges.map((_, i) => (
                  <VoteCell
                    key={i}
                    value={votes[key][i]}
                    proLabel={`${config.judges[i].name} 投 ${config.proName}`}
                    conLabel={`${config.judges[i].name} 投 ${config.conName}`}
                    onVote={(side) => castVote(key, i, side)}
                  />
                ))}
                <RoundResult winner={r.winner} pro={r.pro} con={r.con} />
              </div>
            )
          })}

          {/* 分隔 */}
          <div className="col-span-full my-0.5 h-px bg-white/10" />

          {/* 归一票行：每位评审三票归一 */}
          <div className="flex flex-col">
            <span className="text-sm font-black leading-tight text-foreground">归一票</span>
            <span className="text-[0.65rem] text-muted-foreground">各评审三票归一</span>
          </div>
          {config.judges.map((_, i) => {
            const v = judgeVerdict(votes, i).verdict
            return <VerdictBadge key={i} verdict={v} />
          })}
          <div className="text-center text-[0.65rem] font-black text-muted-foreground">评审</div>
        </div>

        {/* 全场归一结果 */}
        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-card/60 px-3 py-2">
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-foreground/70" />
            <span className="text-sm font-black text-foreground">最终归属</span>
            <span className="text-[0.65rem] text-muted-foreground">评审多者胜</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-lg font-black">
            <span className="text-pro">{outcome.proJudges}</span>
            <span className="text-muted-foreground">:</span>
            <span className="text-con">{outcome.conJudges}</span>
          </div>
          <div className="min-w-[6.5rem] text-right">
            {outcome.winner === 'pending' ? (
              <span className="text-xs text-muted-foreground">进行中…</span>
            ) : outcome.winner === 'tie' ? (
              <span className="text-xs font-bold text-foreground">平局</span>
            ) : (
              <span
                className={cn(
                  'animate-pop-in inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-sm font-black',
                  outcome.winner === 'pro' ? 'bg-pro text-pro-foreground' : 'bg-con text-con-foreground',
                )}
              >
                <Trophy className="size-3.5" />
                {outcome.winner === 'pro' ? config.proName : config.conName}
              </span>
            )}
          </div>
        </div>
      </div>

      {editing && <EditPanel config={config} onSave={saveConfig} onClose={() => setEditing(false)} />}
    </main>
  )
}

function VerdictBadge({ verdict }: { verdict: Side | 'tie' | 'pending' }) {
  if (verdict === 'pending') {
    return <div className="text-center text-sm text-muted-foreground">—</div>
  }
  return (
    <div className="flex justify-center">
      <span
        className={cn(
          'animate-pop-in flex h-9 w-9 items-center justify-center rounded-lg text-base font-black',
          verdict === 'pro'
            ? 'bg-pro text-pro-foreground shadow-[0_0_16px_-2px_var(--pro)]'
            : verdict === 'con'
              ? 'bg-con text-con-foreground shadow-[0_0_16px_-2px_var(--con)]'
              : 'bg-muted text-foreground',
        )}
      >
        {verdict === 'pro' ? '正' : verdict === 'con' ? '反' : '平'}
      </span>
    </div>
  )
}

function RoundResult({ winner, pro, con }: { winner: ReturnType<typeof roundWinner>['winner']; pro: number; con: number }) {
  if (winner === 'pending') {
    return <div className="text-center text-xs text-muted-foreground">—</div>
  }
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="font-mono text-xs font-bold text-foreground">
        {pro}:{con}
      </span>
      <span
        className={cn(
          'animate-pop-in rounded px-1.5 py-0.5 text-[0.65rem] font-black',
          winner === 'pro'
            ? 'bg-pro text-pro-foreground'
            : winner === 'con'
              ? 'bg-con text-con-foreground'
              : 'bg-muted text-foreground',
        )}
      >
        {winner === 'pro' ? '正胜' : winner === 'con' ? '反胜' : '平'}
      </span>
    </div>
  )
}
