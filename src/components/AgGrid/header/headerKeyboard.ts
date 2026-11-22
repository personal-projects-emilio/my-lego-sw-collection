import type { SuppressHeaderKeyboardEventParams } from 'ag-grid-community'

export const suppressHeaderKeyboardEvent = ({
  event,
}: SuppressHeaderKeyboardEventParams) => {
  const { target } = event
  if (!(target instanceof HTMLElement)) return false
  if (target.closest('button')) return true
  return (
    event.key === 'Tab' && !event.shiftKey && !!target.querySelector('button')
  )
}
