import type { FC } from 'react'

import { useNavigate, useSearch } from '@tanstack/react-router'
import ModuleHeader from 'components/ModuleHeader/ModuleHeader'
import PrototypeSwitcher from 'components/PrototypeSwitcher'

import HybridVariant from './HybridVariant'
import { type FilterVariantProps, getActiveFields } from './setsFilter'
import SidePanelVariant from './SidePanelVariant'

const withHeader = (Variant: FC<FilterVariantProps>) => {
  const VariantWithHeader: FC<FilterVariantProps> = (props) => (
    <>
      <ModuleHeader addTo="/sets/add">
        <span />
      </ModuleHeader>
      <Variant {...props} />
    </>
  )
  return VariantWithHeader
}

const variants = [
  { key: 'B', name: 'Side panel', component: withHeader(SidePanelVariant) },
  {
    key: 'D',
    name: 'Filters in header row',
    component: (props: FilterVariantProps) => (
      <HybridVariant {...props} layout="oneRow" />
    ),
  },
  {
    key: 'E',
    name: 'Filters on their own row',
    component: (props: FilterVariantProps) => (
      <HybridVariant {...props} layout="twoRows" />
    ),
  },
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
  const { variant = 'D' } = useSearch({ from: '/sets' })
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
          void navigate({
            search: (previous) => ({ ...previous, variant: key }),
            replace: true,
          })
        }
        variants={variants}
      />
    </>
  )
}

export default SetsFilterPrototype
