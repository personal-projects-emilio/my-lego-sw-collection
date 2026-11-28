import type { FC } from 'react'

import { Navigate, useParams } from '@tanstack/react-router'
import { useMinifigsQuery } from 'api/minifigs'

import MinifigFormModal from './MinifigFormModal'

const EditMinifigFormModal: FC = () => {
  const { data: minifigsList, isLoading } = useMinifigsQuery()
  const { minifigId } = useParams({ from: '/minifigs/edit/$minifigId' })

  if (isLoading) return null

  const minifigToEdit = minifigsList?.find(
    (minifig) => minifig.id === minifigId
  )

  if (!minifigToEdit) return <Navigate to="/minifigs" />

  return <MinifigFormModal isEdit minifigData={minifigToEdit} />
}

export default EditMinifigFormModal
