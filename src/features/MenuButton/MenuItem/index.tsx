import React from 'react'
import styles from './index.module.css'

export type MenuItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode
}

export const MenuItem: React.FC<MenuItemProps> = ({ children, ...rest }) => {
  return (
    <button type="button" role="menuitem" className={styles.button} {...rest}>
      {children}
    </button>
  )
}

export default MenuItem
