import type { SuppressHeaderKeyboardEventParams } from 'ag-grid-community'

export const suppressHeaderKeyboardEvent = ({
  event,
}: SuppressHeaderKeyboardEventParams) => {
  const { target } = event
  if (!(target instanceof HTMLElement)) return false
  if (event.key !== 'Tab') return !!target.closest('button')
  const header = target.closest('[role="columnheader"]')
  const buttons = [...(header?.querySelectorAll('button') ?? [])]
  const next =
    buttons.findIndex((button) => button === target) + (event.shiftKey ? -1 : 1)
  if (next === -1 && header instanceof HTMLElement) {
    event.preventDefault()
    header.focus()
    return true
  }
  return next >= 0 && next < buttons.length
}
