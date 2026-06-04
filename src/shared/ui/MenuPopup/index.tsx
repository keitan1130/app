import React, { useEffect, useRef } from 'react'
import styles from './index.module.css'

type MenuPopupProps = {
  id?: string
  isOpen: boolean
  onClose?: () => void
  children?: React.ReactNode
  className?: string
  listClassName?: string
  variant?: 'fixed' | 'inline'
  closeOnOutsideClick?: boolean
}

export const MenuPopup: React.FC<MenuPopupProps> = ({
  id = 'menu-popup',
  isOpen,
  onClose,
  children,
  className,
  listClassName,
  variant = 'fixed',
  closeOnOutsideClick = true,
}) => {
  const menuRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen || !onClose || !closeOnOutsideClick) return

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null
      if (!target) return
      if (menuRef.current && !menuRef.current.contains(target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [isOpen, onClose, closeOnOutsideClick])

  return (
    <nav
      id={id}
      ref={menuRef}
      className={`${styles.menu} ${styles[variant]} ${isOpen ? styles.opened : ''} ${
        className ?? ''
      }`}
      aria-hidden={!isOpen}
    >
      <ul className={`${styles.list} ${listClassName ?? ''}`} role="menu">
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
