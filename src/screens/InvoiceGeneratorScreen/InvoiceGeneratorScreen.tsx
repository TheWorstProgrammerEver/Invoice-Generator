import { InvoiceDetailsForm } from '../../components/InvoiceDetailsForm/InvoiceDetailsForm'
import { InvoicePreview } from '../../components/InvoicePreview/InvoicePreview'
import { LineItemsEditor } from '../../components/LineItemsEditor/LineItemsEditor'
import { TaxTypesEditor } from '../../components/TaxTypesEditor/TaxTypesEditor'
import { useInvoiceGeneratorViewModel } from './useInvoiceGeneratorViewModel'
import styles from './InvoiceGeneratorScreen.module.scss'

export const InvoiceGeneratorScreen = () => {
  const viewModel = useInvoiceGeneratorViewModel()

  return (
    <main className={styles.screen}>
      <header className={styles.header} data-print-hidden="true">
        <div>
          <p>{viewModel.environment}</p>
          <h1>{viewModel.appName}</h1>
        </div>
        <button className={styles.printButton} type="button" onClick={viewModel.printInvoice}>
          Export to PDF
        </button>
      </header>

      <div className={styles.workspace}>
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

        <InvoicePreview draft={viewModel.draft} totals={viewModel.totals} />
      </div>
    </main>
  )
}
