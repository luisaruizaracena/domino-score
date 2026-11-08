import { useEffect, useState } from 'react'
import type { Team, TeamIndex } from '../lib/game'
import { Modal, btn } from './Modal'
import { TeamFields, cleanTeam } from './TeamFields'

interface Props {
  index: TeamIndex | null
  teams: [Team, Team]
  onClose: () => void
  onSave: (i: TeamIndex, t: Team) => void
}

export function TeamEditDialog({ index, teams, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<Team | null>(null)
  useEffect(() => {
    if (index !== null) setDraft(teams[index])
  }, [index, teams])

  return (
    <Modal open={index !== null} onClose={onClose} title="Editar pareja">
      {index !== null && draft && (
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            onSave(index, cleanTeam(draft, index))
            onClose()
          }}
        >
          <TeamFields index={index} team={draft} onChange={setDraft} autoFocus />
          <button type="submit" className={btn.primary}>
            Guardar
          </button>
        </form>
      )}
    </Modal>
  )
}
