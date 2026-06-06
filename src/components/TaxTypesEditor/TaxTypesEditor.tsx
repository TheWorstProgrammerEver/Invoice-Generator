import type { TaxType } from '../../types'
import styles from './TaxTypesEditor.module.scss'

type TaxTypesEditorProps = {
  taxTypes: TaxType[]
  addTaxType: () => void
  updateTaxType: (id: string, changes: Partial<TaxType>) => void
  removeTaxType: (id: string) => void
}

const numericValue = (value: string) => {
  const parsedValue = Number(value)

  return Number.isFinite(parsedValue) ? parsedValue : 0
}

export const TaxTypesEditor = ({
  taxTypes,
  addTaxType,
  updateTaxType,
  removeTaxType
}: TaxTypesEditorProps) => (
  <section className={styles.section} aria-labelledby="tax-types-title">
    <div className={styles.titleRow}>
      <h2 id="tax-types-title">Tax Types</h2>
      <button type="button" onClick={addTaxType}>
        Add Tax Type
      </button>
    </div>

    <div className={styles.rows}>
      {taxTypes.map((taxType) => (
        <div className={styles.row} key={taxType.id}>
          <label>
            Name
            <input
              value={taxType.name}
              readOnly={taxType.locked}
              onChange={(event) => updateTaxType(taxType.id, { name: event.target.value })}
            />
          </label>

          <label>
            Rate
            <input
              type="number"
              step="0.01"
              value={taxType.rate}
              readOnly={taxType.locked}
              onChange={(event) =>
                updateTaxType(taxType.id, { rate: numericValue(event.target.value) })
              }
            />
          </label>

          <button type="button" disabled={taxType.locked} onClick={() => removeTaxType(taxType.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  </section>
)
