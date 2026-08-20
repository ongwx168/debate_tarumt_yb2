'use client'

import { useState } from 'react'
import { Check, Copy, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { encodeConfig, sanitizeConfig, type VoteConfig } from '@/lib/vote-config'

interface EditPanelProps {
  config: VoteConfig
  onSave: (config: VoteConfig) => void
  onClose: () => void
}

export function EditPanel({ config, onSave, onClose }: EditPanelProps) {
  const [draft, setDraft] = useState<VoteConfig>(() => sanitizeConfig(config))
  const [copied, setCopied] = useState(false)

  const update = (patch: Partial<VoteConfig>) => setDraft((d) => ({ ...d, ...patch }))

  const setJudge = (i: number, patch: Partial<VoteConfig['judges'][number]>) => {
    const judges = draft.judges.map((j, idx) => (idx === i ? { ...j, ...patch } : j))
    update({ judges })
  }

  const handleSave = () => onSave(sanitizeConfig(draft))

  const copyEmbedLink = async () => {
    const clean = sanitizeConfig(draft)
    const url = `${window.location.origin}${window.location.pathname}?c=${encodeConfig(clean)}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('复制以下链接用于 Canva 嵌入：', url)
    }
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/85 p-4 backdrop-blur-sm">
      <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-lg font-black text-card-foreground">编辑投票内容</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="关闭"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          {/* 标题与双方名称 */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold text-muted-foreground">标题</span>
              <input
                value={draft.title}
                onChange={(e) => update({ title: e.target.value })}
                className="rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold text-pro">正方名称</span>
              <input
                value={draft.proName}
                onChange={(e) => update({ proName: e.target.value })}
                className="rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-pro"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold text-con">反方名称</span>
              <input
                value={draft.conName}
                onChange={(e) => update({ conName: e.target.value })}
                className="rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-con"
              />
            </label>
          </div>

          {/* 评审名称 + 照片 */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">四位评审（名字与照片链接）</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {draft.judges.map((judge, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-border p-2.5">
                  <div className="size-12 shrink-0 overflow-hidden rounded-full border-2 border-white/20 bg-muted">
                    {judge.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={judge.photo || '/placeholder.svg'}
                        alt={judge.name}
                        crossOrigin="anonymous"
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <User className="size-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <input
                      value={judge.name}
                      onChange={(e) => setJudge(i, { name: e.target.value })}
                      placeholder={`评审 ${i + 1} 名字`}
                      className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-ring"
                    />
                    <input
                      value={judge.photo}
                      onChange={(e) => setJudge(i, { photo: e.target.value })}
                      placeholder="照片链接 https://…"
                      className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              提示：把照片先上传到图床或 Canva，拿到公开图片链接后粘贴到上面即可显示。
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3">
          <Button type="button" variant="secondary" onClick={copyEmbedLink} className="gap-2">
            {copied ? <Check className="size-4 text-pro" /> : <Copy className="size-4" />}
            {copied ? '已复制嵌入链接' : '复制 Canva 嵌入链接'}
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              取消
            </Button>
            <Button type="button" onClick={handleSave} className="bg-primary font-bold text-primary-foreground hover:bg-primary/90">
              保存
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
