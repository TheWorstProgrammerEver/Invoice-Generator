import type { InvoiceDraft } from '../../types'
import styles from './InvoiceDetailsForm.module.scss'

type InvoiceDetailsFormProps = {
  draft: InvoiceDraft
  updateField: <Key extends keyof InvoiceDraft>(field: Key, value: InvoiceDraft[Key]) => void
}

export const InvoiceDetailsForm = ({ draft, updateField }: InvoiceDetailsFormProps) => (
  <section className={styles.section} aria-labelledby="invoice-details-title">
    <h2 id="invoice-details-title">Details</h2>

    <div className={styles.twoColumn}>
      <label>
        My Details
        <textarea
          rows={5}
          value={draft.sellerDetails}
          onChange={(event) => updateField('sellerDetails', event.target.value)}
        />
      </label>

      <label>
        Customer Details
        <textarea
          rows={5}
          value={draft.customerDetails}
          onChange={(event) => updateField('customerDetails', event.target.value)}
        />
      </label>
    </div>

    <div className={styles.invoiceGrid}>
      <label>
        Invoice Number
        <input
          value={draft.invoiceNumber}
          onChange={(event) => updateField('invoiceNumber', event.target.value)}
        />
      </label>

      <label>
        Currency
        <input
          value={draft.currency}
          maxLength={8}
          onChange={(event) => updateField('currency', event.target.value)}
        />
      </label>

      <label>
        Date Issued
        <input
          type="date"
          value={draft.dateIssued}
          onChange={(event) => updateField('dateIssued', event.target.value)}
        />
      </label>

      <label>
        Date Due
        <input
          type="date"
          value={draft.dateDue}
          onChange={(event) => updateField('dateDue', event.target.value)}
        />
      </label>
    </div>

    <label>
      Notes
      <textarea
        rows={3}
        value={draft.notes}
        onChange={(event) => updateField('notes', event.target.value)}
      />
    </label>

    <label>
      Payment Instructions
      <textarea
        rows={4}
        value={draft.paymentInstructions}
        onChange={(event) => updateField('paymentInstructions', event.target.value)}
      />
    </label>
  </section>
)
