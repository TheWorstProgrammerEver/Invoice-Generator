import { useEffect, useRef } from 'react'
import styles from './ShareInvoiceControl.module.scss'

type ShareInvoiceControlProps = {
  closeShareDialog: () => void
  isShareDialogOpen: boolean
  shareInvoice: () => void
  shareStatus: 'copied' | 'idle' | 'ready'
  shareUrl: string
}

const statusText = {
  copied: 'Copied draft URL to clipboard',
  idle: '',
  ready: 'Copy the draft URL below'
}

export const ShareInvoiceControl = ({
  closeShareDialog,
  isShareDialogOpen,
  shareInvoice,
  shareStatus,
  shareUrl
}: ShareInvoiceControlProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) {
      return
    }

    if (isShareDialogOpen && !dialog.open) {
      dialog.showModal()
    }

    if (!isShareDialogOpen && dialog.open) {
      dialog.close()
    }
  }, [isShareDialogOpen])

  return (
    <div className={styles.control}>
      <button type="button" onClick={shareInvoice}>
        Share Draft
      </button>

      <dialog
        className={styles.dialog}
        ref={dialogRef}
        aria-labelledby="share-dialog-title"
        onCancel={closeShareDialog}
        onClose={closeShareDialog}
      >
        <header>
          <h2 id="share-dialog-title">Share Draft</h2>
          <button type="button" onClick={closeShareDialog} aria-label="Close share dialog">
            Close
          </button>
        </header>

        <p>{statusText[shareStatus] || 'Generate a shareable draft URL.'}</p>

        <label className={styles.urlField} htmlFor="share-url">
          Draft URL
          <input
            id="share-url"
            readOnly
            value={shareUrl}
            onFocus={(event) => event.target.select()}
          />
        </label>

        <footer>
          <button type="button" onClick={shareInvoice}>
            Copy Draft URL
          </button>
          <button type="button" onClick={closeShareDialog}>
            Done
          </button>
        </footer>
      </dialog>
    </div>
  )
}
