import type { FC } from 'react'

import { pick, useNavigate, useSearch } from '@tanstack/react-router'
import { useSetsQuery } from 'api/sets'

import SetFormModal from './SetFormModal'

const AddSetFormModal: FC = () => {
  const { data: setsList, isLoading } = useSetsQuery()
  const { duplicate } = useSearch({ from: '/sets/add' })
  const navigate = useNavigate()

  if (isLoading) return null

  const setToDuplicate = setsList?.find((set) => set.id === duplicate)

  if (!setToDuplicate) {
    navigate({ to: '.', search: undefined, replace: true })
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
