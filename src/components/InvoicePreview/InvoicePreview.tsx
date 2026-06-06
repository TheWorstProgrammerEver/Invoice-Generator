import { formatMoney } from '../../domain/invoice'
import type { InvoiceDraft, InvoiceTotals } from '../../types'
import { InvoiceLineRows } from './InvoiceLineRows'
import styles from './InvoicePreview.module.scss'

type InvoicePreviewProps = {
  draft: InvoiceDraft
  totals: InvoiceTotals
}

export const InvoicePreview = ({ draft, totals }: InvoicePreviewProps) => (
  <section className={styles.preview} aria-labelledby="preview-title">
    <header className={styles.header}>
      <div>
        <p className={styles.kicker}>Tax Invoice</p>
        <h2 id="preview-title">{draft.invoiceNumber || 'Untitled invoice'}</h2>
      </div>

      <dl className={styles.dates}>
        <div>
          <dt>Issued</dt>
          <dd>{draft.dateIssued || '-'}</dd>
        </div>
        <div>
          <dt>Due</dt>
          <dd>{draft.dateDue || '-'}</dd>
        </div>
      </dl>
    </header>

    <div className={styles.parties}>
      <address>{draft.sellerDetails}</address>
      <div>
        <strong>To</strong>
        <address>{draft.customerDetails}</address>
      </div>
    </div>

    <div className={styles.tableWrap}>
      <table>
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Description / Tax</th>
            <th scope="col">Rate</th>
            <th scope="col">Qty</th>
            <th scope="col">Amount</th>
          </tr>
        </thead>
        <tbody>
          {totals.lines.map((line, index) => (
            <InvoiceLineRows
              currency={draft.currency}
              line={line}
              lineNumber={index + 1}
              key={line.id}
            />
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan={4}>Subtotal</th>
            <td>{formatMoney(totals.subtotal, draft.currency)}</td>
          </tr>
          {totals.taxTotals.map((taxTotal) => (
            <tr key={taxTotal.id}>
              <th scope="row" colSpan={4}>{taxTotal.name} Total</th>
              <td>{formatMoney(taxTotal.amount, draft.currency)}</td>
            </tr>
          ))}
          <tr>
            <th scope="row" colSpan={4}>Tax Total</th>
            <td>{formatMoney(totals.totalTax, draft.currency)}</td>
          </tr>
          <tr className={styles.totalRow}>
            <th scope="row" colSpan={4}>Total</th>
            <td>{formatMoney(totals.total, draft.currency)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    {draft.notes.trim() ? (
      <section className={styles.noteBlock} aria-label="Notes">
        <h3>Notes</h3>
        <p>{draft.notes}</p>
      </section>
    ) : null}

    <section className={styles.noteBlock} aria-label="Payment Instructions">
      <h3>Payment Instructions</h3>
      <p>{draft.paymentInstructions}</p>
    </section>
  </section>
)
