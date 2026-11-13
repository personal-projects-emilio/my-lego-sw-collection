import type { FC } from 'react'

import { Navigate, useParams } from '@tanstack/react-router'
import { useResaleSetsQuery } from 'api/resaleSets'

import ResaleSetFormModal from './ResaleSetFormModal'

const EditResaleSetFormModal: FC = () => {
  const { data: resaleSetsList, isLoading } = useResaleSetsQuery()
  const { setId } = useParams({ from: '/resale-sets/edit/$setId' })

  if (isLoading) return null

  const resaleSet = resaleSetsList?.find(({ id }) => id === setId)

  if (!resaleSet) return <Navigate to="/resale-sets" />

  return <ResaleSetFormModal resaleSet={resaleSet} />
}

export default EditResaleSetFormModal
