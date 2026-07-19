import React, { useState } from 'react'
import { SupikiModel } from './SupikiModel'
import type { SupikiState } from './SupikiProcess/types'
import { createInitialSupiki, useSupikiMovement } from './SupikiProcess/useSupikiMovement'
import { useSupikiVoice } from './SupikiProcess/useSupikiVoice'

export const Supiki: React.FC = () => {
  const [initialSupikis] = useState<SupikiState[]>(() => {
    if (typeof window === 'undefined') return []
    return [createInitialSupiki()]
  })

  if (typeof window === 'undefined') return null

  return <SupikiContent initialSupikis={initialSupikis} />
}

interface SupikiContentProps {
  initialSupikis: SupikiState[]
}

const SupikiContent: React.FC<SupikiContentProps> = ({ initialSupikis }) => {
  const { supikis, addSupiki } = useSupikiMovement(initialSupikis)
  const { playVoice } = useSupikiVoice()

  const handleSupikiClick = (e: React.MouseEvent<HTMLDivElement>) => {
    playVoice(true)

    const rect = e.currentTarget.getBoundingClientRect()

    addSupiki(rect.left, rect.top)
  }

  return (
    <>
      {supikis.map((supiki) => (
        <SupikiModel key={supiki.id} supiki={supiki} onClick={handleSupikiClick} />
      ))}
    </>
  )
}
