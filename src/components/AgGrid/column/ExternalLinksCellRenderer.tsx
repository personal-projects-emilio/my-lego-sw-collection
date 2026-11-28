import type { CustomCellRendererProps } from 'ag-grid-react'
import LogoLink, { type LogoLinkProps } from 'components/LogoLink'
import type { ItemId } from 'types/common'
import { assert, isNotNullOrUndefined } from 'utils/typescript'

export type ExternalLinksCellRenderProps = Pick<LogoLinkProps, 'variant'>

const ExternalLinksCellRenderer = ({
  value: id,
  variant,
}: CustomCellRendererProps<unknown, ItemId> & ExternalLinksCellRenderProps) => {
  assert(isNotNullOrUndefined(id))

  return (
    <>
      <LogoLink id={id} size="small" target="bricklink" variant={variant} />
      <LogoLink id={id} size="small" target="brickset" variant={variant} />
    </>
  )
}

export default ExternalLinksCellRenderer
