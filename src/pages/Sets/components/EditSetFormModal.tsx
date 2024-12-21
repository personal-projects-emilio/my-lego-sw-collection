import type { FC } from 'react'

import { Navigate, useParams } from '@tanstack/react-router'
import { useSetsQuery } from 'api/sets'

import SetFormModal from './SetFormModal'

const EditSetFormModal: FC = () => {
  const { data: setsList, isLoading } = useSetsQuery()
  const { setId } = useParams({ from: '/sets/edit/$setId' })

  if (isLoading) return null

  const setToEdit = setsList?.find((set) => set.id === setId)

  if (!setToEdit) return <Navigate to="/sets" />

  return <SetFormModal isEdit setData={setToEdit} />
}

export default EditSetFormModal
