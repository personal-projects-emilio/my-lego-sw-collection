import type { FC } from 'react'

import { Navigate, useSearch } from '@tanstack/react-router'
import { useSetsQuery } from 'api/sets'
import pick from 'lodash/pick'

import SetFormModal from './SetFormModal'

const AddSetFormModal: FC = () => {
  const { data: setsList, isLoading } = useSetsQuery()
  const { duplicate } = useSearch({ from: '/sets/add' })

  if (isLoading) return null

  const setToDuplicate = setsList?.find((set) => set.id === duplicate)

  if (duplicate !== undefined && !setToDuplicate) {
    return <Navigate to="." search={undefined} replace />
  }

  return (
    <SetFormModal
      isEdit={false}
      {...(setToDuplicate && {
        setData: pick(setToDuplicate, [
          'appearances',
          'subtheme',
          'tags',
          'timelines',
        ]),
      })}
    />
  )
}

export default AddSetFormModal
