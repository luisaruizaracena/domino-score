import { Modal, btn } from './Modal'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  danger?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({ open, title, message, confirmLabel, danger, onConfirm, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="mb-5 text-sm text-muted">{message}</p>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={onClose} className={btn.secondary} data-autofocus>
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm()
            onClose()
          }}
          className={danger ? btn.danger : btn.primary}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
