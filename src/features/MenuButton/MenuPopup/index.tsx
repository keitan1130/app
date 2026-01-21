import React from 'react'
import { MenuItem } from '../MenuItem'
import styles from './index.module.css'

export { MenuItem }

type MenuPopupProps = {
  isOpen: boolean
  onClose?: () => void
  children?: React.ReactNode
}

export const MenuPopup: React.FC<MenuPopupProps> = ({ isOpen, onClose, children }) => {
  return (
    <nav
      id="menu-popup"
      className={`${styles.menu} ${isOpen ? styles.opened : ''}`}
      aria-hidden={!isOpen}
    >
      <ul className={styles.list} role="menu">
        {React.Children.map(children, (child, index) => {
          let content = child
          if (React.isValidElement(child)) {
            const element = child as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>
            const childOnClick = element.props.onClick
            content = React.cloneElement(element, {
              onClick: (e: React.MouseEvent) => {
                if (typeof childOnClick === 'function') childOnClick(e)
                if (typeof onClose === 'function') onClose()
              },
            })
          }

          return (
            <li key={index} role="none">
              {content}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
