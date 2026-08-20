'use client'

import { User } from 'lucide-react'
import type { Judge } from '@/lib/vote-config'

/** 评审列头：圆形照片 + 名字 */
export function JudgeHead({ judge }: { judge: Judge }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="size-12 overflow-hidden rounded-full border-2 border-white/20 bg-muted shadow-lg sm:size-14">
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
            <User className="size-6" />
          </div>
        )}
      </div>
      <span className="max-w-[5.5rem] truncate text-center text-xs font-bold text-foreground">{judge.name}</span>
    </div>
  )
}
