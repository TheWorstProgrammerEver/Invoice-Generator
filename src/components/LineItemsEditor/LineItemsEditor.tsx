import type { LineItem, TaxType } from '../../types'
import styles from './LineItemsEditor.module.scss'

type LineItemsEditorProps = {
  lineItems: LineItem[]
  taxTypes: TaxType[]
  addLineItem: () => void
  updateLineItem: (id: string, changes: Partial<LineItem>) => void
  removeLineItem: (id: string) => void
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

            <label>
              Tax
              <select
                value={lineItem.taxTypeId}
                onChange={(event) => updateLineItem(lineItem.id, { taxTypeId: event.target.value })}
              >
                {taxTypes.map((taxType) => (
                  <option value={taxType.id} key={taxType.id}>
                    {taxType.name || 'Untitled tax'}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </article>
      ))}
    </div>
  </section>
)
