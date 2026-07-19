import React from 'react'
import styles from './index.module.css'

export type MenuItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode
}

export const MenuItem: React.FC<MenuItemProps> = ({ children, ...rest }) => {
  return (
    <li role="none" className={styles.menuItem}>
      <button type="button" role="menuitem" className={styles.button} {...rest}>
        {children}
      </button>
    </li>
  )
}
export default MenuItem
