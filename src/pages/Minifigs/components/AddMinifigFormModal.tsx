import type { FC } from 'react'

import { pick, useNavigate, useSearch } from '@tanstack/react-router'
import { useMinifigsQuery } from 'api/minifigs'

import MinifigFormModal from './MinifigFormModal'

const AddMinifigFormModal: FC = () => {
  const { data: minifigsList, isLoading } = useMinifigsQuery()
  const { duplicate } = useSearch({ from: '/minifigs/add' })
  const navigate = useNavigate()

  if (isLoading) return null

  const minifigToDuplicate = minifigsList?.find(
    (minifig) => minifig.id === duplicate
  )

  if (!minifigToDuplicate) {
    navigate({ to: '.', search: undefined, replace: true })
  }

  return (
    <MinifigFormModal
      isEdit={false}
      {...(minifigToDuplicate && {
        minifigData: pick(minifigToDuplicate, [
          'appearances',
          'characterName',
          'tags',
          'timelines',
        ]),
      })}
    />
  )
}

export default AddMinifigFormModal
