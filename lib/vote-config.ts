export type Side = 'pro' | 'con'
export type Vote = Side | null

export const ROUND_KEYS = ['impression', 'score', 'final'] as const
export type RoundKey = (typeof ROUND_KEYS)[number]

export const ROUND_META: Record<RoundKey, { label: string; index: string }> = {
  impression: { label: '印象票', index: '一' },
  score: { label: '分数票', index: '二' },
  final: { label: '决选票', index: '三' },
}

export interface Judge {
  name: string
  photo: string // 图片 URL，可为空
}

export interface VoteConfig {
  title: string
  proName: string
  conName: string
  judges: Judge[] // 长度 4
}

export const DEFAULT_CONFIG: VoteConfig = {
  title: '辩论赛评审投票',
  proName: '正方',
  conName: '反方',
  judges: [
    { name: '评审一', photo: '' },
    { name: '评审二', photo: '' },
    { name: '评审三', photo: '' },
    { name: '评审四', photo: '' },
  ],
}

export type VoteState = Record<RoundKey, Vote[]>

export function emptyVotes(): VoteState {
  return {
    impression: [null, null, null, null],
    score: [null, null, null, null],
    final: [null, null, null, null],
  }
}

export function sanitizeConfig(input: Partial<VoteConfig> | null | undefined): VoteConfig {
  const base = DEFAULT_CONFIG
  if (!input) return structuredCloneSafe(base)
  const judges = Array.from({ length: 4 }, (_, i) => ({
    name: input.judges?.[i]?.name?.toString().trim() || base.judges[i].name,
    photo: input.judges?.[i]?.photo?.toString().trim() || '',
  }))
  return {
    title: input.title?.toString().trim() || base.title,
    proName: input.proName?.toString().trim() || base.proName,
    conName: input.conName?.toString().trim() || base.conName,
    judges,
  }
}

function structuredCloneSafe(cfg: VoteConfig): VoteConfig {
  return JSON.parse(JSON.stringify(cfg))
}

/** 计算某环节的胜方（有效票多数决，空票不计） */
export function roundWinner(sides: Vote[]): { winner: Side | 'tie' | 'pending'; pro: number; con: number } {
  const pro = sides.filter((s) => s === 'pro').length
  const con = sides.filter((s) => s === 'con').length
  if (pro === 0 && con === 0) return { winner: 'pending', pro, con }
  if (pro > con) return { winner: 'pro', pro, con }
  if (con > pro) return { winner: 'con', pro, con }
  return { winner: 'tie', pro, con }
}

/** 单个评审的归一票：把该评审在三个环节的投票按多数决合成一票 */
export function judgeVerdict(votes: VoteState, judgeIndex: number): { verdict: Side | 'tie' | 'pending'; pro: number; con: number } {
  let pro = 0
  let con = 0
  for (const key of ROUND_KEYS) {
    const v = votes[key][judgeIndex]
    if (v === 'pro') pro++
    else if (v === 'con') con++
  }
  if (pro === 0 && con === 0) return { verdict: 'pending', pro, con }
  if (pro > con) return { verdict: 'pro', pro, con }
  if (con > pro) return { verdict: 'con', pro, con }
  return { verdict: 'tie', pro, con }
}

/** 全场归一：统计四位评审各自的归一票，谁的评审多谁胜 */
export function finalOutcome(votes: VoteState, judgeCount: number): {
  winner: Side | 'tie' | 'pending'
  proJudges: number
  conJudges: number
  decided: number
} {
  let proJudges = 0
  let conJudges = 0
  let decided = 0
  for (let i = 0; i < judgeCount; i++) {
    const v = judgeVerdict(votes, i).verdict
    if (v === 'pro') {
      proJudges++
      decided++
    } else if (v === 'con') {
      conJudges++
      decided++
    } else if (v === 'tie') {
      decided++
    }
  }
  const winner: Side | 'tie' | 'pending' =
    proJudges > conJudges ? 'pro' : conJudges > proJudges ? 'con' : decided === 0 ? 'pending' : 'tie'
  return { winner, proJudges, conJudges, decided }
}

/* ---------- URL-safe 编码，用于 Canva 嵌入 ---------- */

export function encodeConfig(config: VoteConfig): string {
  const json = JSON.stringify(config)
  const bytes = new TextEncoder().encode(json)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeConfig(param: string): VoteConfig | null {
  try {
    const b64 = param.replace(/-/g, '+').replace(/_/g, '/')
    const binary = atob(b64)
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    const json = new TextDecoder().decode(bytes)
    return sanitizeConfig(JSON.parse(json))
  } catch {
    return null
  }
}
