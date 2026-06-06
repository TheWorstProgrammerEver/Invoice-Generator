import { formatMoney, formatTaxRate, toMoneyNumber } from '../../domain/invoice'
import type { InvoiceLineTotal } from '../../types'
import styles from './InvoicePreview.module.scss'

type InvoiceLineRowsProps = {
  currency: string
  line: InvoiceLineTotal
  lineNumber: number
}

export const InvoiceLineRows = ({ currency, line, lineNumber }: InvoiceLineRowsProps) => (
  <>
    <tr className={styles.lineRow}>
      <th className={styles.itemNumber} scope="row">{lineNumber}</th>
      <td className={styles.description}>{line.description || '-'}</td>
      <td>{formatMoney(toMoneyNumber(line.rate), currency)}</td>
      <td>{line.quantity || '0'}</td>
      <td>{formatMoney(line.total, currency)}</td>
    </tr>

    {line.taxes.map((tax) => (
      <tr className={styles.taxRow} key={`${line.id}-${tax.id}`}>
        <td />
        <th className={styles.taxName} scope="row">
          <span className={styles.taxPrefix} aria-hidden="true">-</span>
          {tax.name}
        </th>
        <td>{formatTaxRate(tax.rate)}</td>
        <td />
        <td>{formatMoney(tax.taxAmount, currency)}</td>
      </tr>
    ))}
  </>
)
