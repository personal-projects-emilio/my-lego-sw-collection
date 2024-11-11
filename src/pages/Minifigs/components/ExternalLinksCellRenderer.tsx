import { type CustomCellRendererProps } from 'ag-grid-react'
import LogoLink from 'components/LogoLink'
import { Minifig } from 'types/minifigs'

const ExternalLinksCellRenderer = ({
  value: minifigId,
}: CustomCellRendererProps<Minifig, Minifig['id']>) => {
  if (!minifigId) return null

  return (
    <>
      <LogoLink
        id={minifigId}
        size="small"
        target="bricklink"
        variant="minifig"
      />
      <LogoLink
        id={minifigId}
        size="small"
        target="brickset"
        variant="minifig"
      />
    </>
  )
}

export default ExternalLinksCellRenderer
