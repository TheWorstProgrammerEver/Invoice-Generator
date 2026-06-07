import { InvoicePreview } from '../../components/InvoicePreview/InvoicePreview'
import { useSandboxViewModel } from './useSandboxViewModel'
import styles from './SandboxScreen.module.scss'

export const SandboxScreen = () => {
  const viewModel = useSandboxViewModel()

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <p>Developer Sandbox</p>
        <h1>Invoice Payload Sandbox</h1>
      </header>

      <div className={styles.workspace}>
        <section className={styles.panel} aria-labelledby="sandbox-input-title">
          <h2 id="sandbox-input-title">Input JSON</h2>
          <label className={styles.jsonField}>
            Invoice payload
            <textarea
              value={viewModel.jsonInput}
              onChange={(event) => viewModel.setJsonInput(event.target.value)}
              spellCheck={false}
            />
          </label>
          {viewModel.error ? (
            <p className={styles.alert} role="alert">{viewModel.error}</p>
          ) : (
            <p className={styles.status}>Payload loaded.</p>
          )}
        </section>

        <section className={styles.panel} aria-labelledby="sandbox-links-title">
          <h2 id="sandbox-links-title">Generated URLs</h2>
          <label>
            Edit
            <input readOnly value={viewModel.editUrl} />
          </label>
          <label>
            Preview
            <input readOnly value={viewModel.previewUrl} />
          </label>
          <label>
            Print
            <input readOnly value={viewModel.printUrl} />
          </label>
        </section>

        <div className={styles.previewPane}>
          <InvoicePreview draft={viewModel.draft} totals={viewModel.totals} />
        </div>
      </div>
    </main>
  )
}
