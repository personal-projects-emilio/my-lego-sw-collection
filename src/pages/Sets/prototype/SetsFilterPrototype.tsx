import type { FC } from 'react'

import { useNavigate, useSearch } from '@tanstack/react-router'
import PrototypeSwitcher from 'components/PrototypeSwitcher'

import ChipBarVariant from './ChipBarVariant'
import SearchTokensVariant from './SearchTokensVariant'
import { type FilterVariantProps, getActiveFields } from './setsFilter'
import SidePanelVariant from './SidePanelVariant'

const variants = [
  { key: 'A', name: 'Chip bar', component: ChipBarVariant },
  { key: 'B', name: 'Side panel', component: SidePanelVariant },
  { key: 'C', name: 'Search tokens', component: SearchTokensVariant },
]

type SetsFilterPrototypeProps = FilterVariantProps & {
  matchedCount: number
  totalCount: number
}

const SetsFilterPrototype: FC<SetsFilterPrototypeProps> = ({
  matchedCount,
  totalCount,
  ...props
}) => {
  const { variant = 'A' } = useSearch({ from: '/sets' })
  const navigate = useNavigate({ from: '/sets' })
  const current = variants.find(({ key }) => key === variant) ?? variants[0]
  const Variant = current.component
  const activeFields = getActiveFields(props.filter)

  return (
    <>
      <Variant {...props} />
      <PrototypeSwitcher
        current={current.key}
        details={`${matchedCount} of ${totalCount} sets · ${activeFields.length ? activeFields.map((field) => `${field}=${JSON.stringify(props.filter[field])}`).join(' ') : 'no filter'}`}
        onSelect={(key) =>
          void navigate({ search: (previous) => ({ ...previous, variant: key }), replace: true })
        }
        variants={variants}
      />
    </>
  )
}

export default SetsFilterPrototype
