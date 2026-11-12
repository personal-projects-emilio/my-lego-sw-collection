import type { FC } from 'react'

import { Navigate, useSearch } from '@tanstack/react-router'
import { useMinifigsQuery } from 'api/minifigs'
import pick from 'lodash/pick'

import MinifigFormModal from './MinifigFormModal'

const AddMinifigFormModal: FC = () => {
  const { data: minifigsList, isLoading } = useMinifigsQuery()
  const { duplicate } = useSearch({ from: '/minifigs/add' })

  if (isLoading) return null

  const minifigToDuplicate = minifigsList?.find(
    (minifig) => minifig.id === duplicate
  )

  if (duplicate !== undefined && !minifigToDuplicate) {
    return <Navigate to="." search={undefined} replace />
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
