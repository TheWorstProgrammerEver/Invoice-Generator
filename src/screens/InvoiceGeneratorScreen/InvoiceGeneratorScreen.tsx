import { InvoiceDetailsForm } from '../../components/InvoiceDetailsForm/InvoiceDetailsForm'
import { InvoicePreview } from '../../components/InvoicePreview/InvoicePreview'
import { LineItemsEditor } from '../../components/LineItemsEditor/LineItemsEditor'
import { ShareInvoiceControl } from '../../components/ShareInvoiceControl/ShareInvoiceControl'
import { TaxTypesEditor } from '../../components/TaxTypesEditor/TaxTypesEditor'
import { useInvoiceGeneratorViewModel } from './useInvoiceGeneratorViewModel'
import styles from './InvoiceGeneratorScreen.module.scss'

export const InvoiceGeneratorScreen = () => {
  const viewModel = useInvoiceGeneratorViewModel()
  const screenClassName = viewModel.isDocumentMode
    ? `${styles.screen} ${styles.documentScreen}`
    : styles.screen
  const workspaceClassName = viewModel.isDocumentMode
    ? `${styles.workspace} ${styles.documentWorkspace}`
    : styles.workspace

  return (
    <main className={screenClassName} data-launch-mode={viewModel.launchMode}>
      {!viewModel.isDocumentMode ? (
        <header className={styles.header} data-print-hidden="true">
          <div className={styles.titleBlock}>
            <p>{viewModel.environment}</p>
            <h1>{viewModel.appName}</h1>
          </div>
          <div className={styles.actions}>
            <ShareInvoiceControl
              closeShareDialog={viewModel.closeShareDialog}
              isShareDialogOpen={viewModel.isShareDialogOpen}
              shareInvoice={viewModel.shareInvoice}
              shareStatus={viewModel.shareStatus}
              shareUrl={viewModel.shareUrl}
            />
            <button className={styles.printButton} type="button" onClick={viewModel.printInvoice}>
              Export PDF
            </button>
          </div>
        </header>
      ) : null}

      {viewModel.hasInvoiceUrlError ? (
        <div className={styles.alert} role="alert">
          This invoice link could not be loaded. Showing a blank draft instead.
        </div>
      ) : null}

      <div className={workspaceClassName}>
        {!viewModel.isDocumentMode ? (
          <form
            className={styles.editor}
            data-print-hidden="true"
            onSubmit={(event) => event.preventDefault()}
          >
            <InvoiceDetailsForm draft={viewModel.draft} updateField={viewModel.updateField} />
            <TaxTypesEditor
              taxTypes={viewModel.draft.taxTypes}
              addTaxType={viewModel.addTaxType}
              updateTaxType={viewModel.updateTaxType}
              removeTaxType={viewModel.removeTaxType}
            />
            <LineItemsEditor
              lineItems={viewModel.draft.lineItems}
              taxTypes={viewModel.draft.taxTypes}
              addLineItem={viewModel.addLineItem}
              updateLineItem={viewModel.updateLineItem}
              removeLineItem={viewModel.removeLineItem}
            />
          </form>
        ) : null}

        <aside className={styles.previewPane}>
          <InvoicePreview draft={viewModel.draft} totals={viewModel.totals} />
        </aside>
      </div>
    </main>
  )
}
