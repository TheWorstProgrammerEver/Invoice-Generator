import { formatTaxRate } from '../../domain/invoice'
import { noTaxId } from '../../state/invoiceDraftDefaults'
import type { LineItem, TaxType } from '../../types'
import styles from './LineItemsEditor.module.scss'

type LineItemsEditorProps = {
  lineItems: LineItem[]
  taxTypes: TaxType[]
  addLineItem: () => void
  updateLineItem: (id: string, changes: Partial<LineItem>) => void
  removeLineItem: (id: string) => void
}

const getNextTaxTypeIds = (lineItem: LineItem, taxTypeId: string, checked: boolean) => {
  const selectedTaxTypeIds = lineItem.taxTypeIds ?? []

  if (checked) {
    return [...new Set([...selectedTaxTypeIds, taxTypeId])]
  }

  return selectedTaxTypeIds.filter((selectedTaxTypeId) => selectedTaxTypeId !== taxTypeId)
}

export const LineItemsEditor = ({
  lineItems,
  taxTypes,
  addLineItem,
  updateLineItem,
  removeLineItem
}: LineItemsEditorProps) => (
  <section className={styles.section} aria-labelledby="line-items-title">
    <div className={styles.titleRow}>
      <h2 id="line-items-title">Line Items</h2>
      <button type="button" onClick={addLineItem}>
        Add Item
      </button>
    </div>

    <div className={styles.items}>
      {lineItems.map((lineItem, index) => (
        <article className={styles.item} key={lineItem.id}>
          <header>
            <h3>Item {index + 1}</h3>
            <button type="button" onClick={() => removeLineItem(lineItem.id)}>
              Delete
            </button>
          </header>

          <label className={styles.description}>
            Description
            <textarea
              rows={3}
              value={lineItem.description}
              onChange={(event) =>
                updateLineItem(lineItem.id, { description: event.target.value })
              }
            />
          </label>

          <div className={styles.numberGrid}>
            <label>
              Rate
              <input
                type="number"
                step="0.01"
                value={lineItem.rate}
                onChange={(event) => updateLineItem(lineItem.id, { rate: event.target.value })}
              />
            </label>

            <label>
              Qty
              <input
                type="number"
                step="0.01"
                value={lineItem.quantity}
                onChange={(event) => updateLineItem(lineItem.id, { quantity: event.target.value })}
              />
            </label>

            <fieldset className={styles.taxSet}>
              <legend>Taxes</legend>
              {taxTypes
                .filter((taxType) => taxType.id !== noTaxId)
                .map((taxType) => (
                  <label className={styles.checkbox} key={taxType.id}>
                    <input
                      type="checkbox"
                      checked={(lineItem.taxTypeIds ?? []).includes(taxType.id)}
                      onChange={(event) =>
                        updateLineItem(lineItem.id, {
                          taxTypeIds: getNextTaxTypeIds(lineItem, taxType.id, event.target.checked)
                        })
                      }
                    />
                    <span>{taxType.name || 'Untitled tax'}</span>
                    <small>{formatTaxRate(taxType.rate)}</small>
                  </label>
                ))}
            </fieldset>
          </div>
        </article>
      ))}
    </div>
  </section>
)
