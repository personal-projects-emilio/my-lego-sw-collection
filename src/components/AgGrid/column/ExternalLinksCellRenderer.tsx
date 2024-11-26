import type { CustomCellRendererProps } from 'ag-grid-react'
import LogoLink, { type LogoLinkProps } from 'components/LogoLink'
import type { ItemId } from 'types/common'

export type ExternalLinksCellRenderParams = Pick<LogoLinkProps, 'variant'>

const ExternalLinksCellRenderer = ({
  value: id,
  variant,
}: CustomCellRendererProps<unknown, ItemId> &
  ExternalLinksCellRenderParams) => {
  if (!id) return null

  return (
    <>
      <LogoLink id={id} size="small" target="bricklink" variant={variant} />
      <LogoLink id={id} size="small" target="brickset" variant={variant} />
    </>
  )
}

export default ExternalLinksCellRenderer
