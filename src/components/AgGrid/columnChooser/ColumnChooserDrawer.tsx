import { type Theme, useMediaQuery } from '@mui/material'
import SideDrawer from 'components/SideDrawer'

import ColumnChooser, { type ColumnChooserProps } from './ColumnChooser'

type ColumnChooserDrawerProps<TData> = ColumnChooserProps<TData> & {
  id: string
  onClose: () => void
}

const ColumnChooserDrawer = <TData,>({
  id,
  onClose,
  ...chooserProps
}: ColumnChooserDrawerProps<TData>) => {
  const isWide = useMediaQuery<Theme>((theme) => theme.breakpoints.up('md'))

  return (
    <SideDrawer
      defaultWidth={320}
      id={id}
      isDocked={isWide}
      maxWidth={isWide ? window.innerWidth / 2 : undefined}
      minWidth={240}
      onClose={onClose}
      storageKey="columnChooserWidth"
      title="Columns"
    >
      <ColumnChooser {...chooserProps} />
    </SideDrawer>
  )
}

export default ColumnChooserDrawer
