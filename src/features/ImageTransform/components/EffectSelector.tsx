import { MenuItem, MenuPopup } from '@/shared/ui'
import styles from '../index.module.css'

type EffectOption<T extends string = string> = {
  value: T
  label: string
  description: string
}

type EffectSelectorProps<T extends string = string> = {
  options: EffectOption<T>[]
  selectedLabel?: string
  description?: string
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  onSelect: (value: T) => void
}

export const EffectSelector = <T extends string = string>({
  options,
  selectedLabel,
  description,
  isOpen,
  onToggle,
  onClose,
  onSelect,
}: EffectSelectorProps<T>) => {
  return (
    <div className={styles.controlCard}>
      <label className={styles.label} htmlFor="effect-menu-button">
        変換モード
      </label>
      <div className={styles.effectMenu}>
        <button
          id="effect-menu-button"
          type="button"
          className={styles.effectMenuButton}
          aria-expanded={isOpen}
          aria-controls="effect-menu-popup"
          onClick={onToggle}
        >
          {selectedLabel ?? '選択してください'}
        </button>
        <MenuPopup
          id="effect-menu-popup"
          isOpen={isOpen}
          onClose={onClose}
          className={styles.effectMenuPopup}
          variant="inline"
        >
          {options.map((option) => (
            <MenuItem key={option.value} onClick={() => onSelect(option.value)}>
              {option.label}
            </MenuItem>
          ))}
        </MenuPopup>
      </div>
      <p className={styles.help}>{description}</p>
    </div>
  )
}
