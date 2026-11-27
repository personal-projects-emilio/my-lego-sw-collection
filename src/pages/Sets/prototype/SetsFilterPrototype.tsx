import type { FC } from 'react'

import { useNavigate, useSearch } from '@tanstack/react-router'
import PrototypeSwitcher from 'components/PrototypeSwitcher'

import HybridVariant from './HybridVariant'
import { type FilterVariantProps, getActiveFields } from './setsFilter'

const variants = [
  { key: 'D', name: 'Filters in header row', component: HybridVariant },
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
