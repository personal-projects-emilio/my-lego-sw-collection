import { type FC, useMemo, useRef } from 'react'
import { Controller, type SubmitHandler, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Typography,
} from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import { useSetsQuery } from 'api/sets'
import { Checkbox, FormTextField } from 'components/inputs'
import capitalize from 'lodash/capitalize'
import {
  boxConditions,
  type ResaleSet,
  type ResaleSetFormInput,
  resaleSetValidationSchema,
  setConditions,
} from 'types/resale'
import { parseNullableNumber, parseNullableText, parseSetId } from 'utils/parse'

import { defaultResaleSetFormValues } from './ResaleSetFormModal.constant'
import useResaleSetFormModalStyles from './ResaleSetFormModal.styles'
import useResaleSetsMutations from './useResaleSetsMutations'

type ResaleSetFormModalProps = {
  resaleSet?: ResaleSet
}

const ResaleSetFormModal: FC<ResaleSetFormModalProps> = ({ resaleSet }) => {
  const isEdit = resaleSet !== undefined
  const { data: setsList = [] } = useSetsQuery()
  const { addResaleSet, editResaleSet, isPending, resaleSetsList } =
    useResaleSetsMutations()
  const navigate = useNavigate()
  const { classes } = useResaleSetFormModalStyles()
  const prefilledId = useRef<ResaleSet['id'] | null>(null)

  const schema = useMemo(
    () =>
      resaleSetValidationSchema.refine(
        ({ id }) => isEdit || !resaleSetsList?.some((item) => item.id === id),
        { path: ['id'], message: 'This set already exists' }
      ),
    [isEdit, resaleSetsList]
  )

  const {
    control,
    formState: { errors },
    handleSubmit,
    setError,
    setValues,
  } = useForm<ResaleSetFormInput, unknown, ResaleSet>({
    defaultValues: resaleSet ?? defaultResaleSetFormValues,
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const onClose = () => {
    navigate({ to: '/resale-sets' })
  }

  const prefillFromCollection = (id: ResaleSet['id']) => {
    const set = setsList.find((item) => item.id === id)
    if (id === prefilledId.current || (!set && prefilledId.current === null))
      return
    prefilledId.current = set ? id : null
    setValues({
      name: set?.name ?? defaultResaleSetFormValues.name,
      officialPrice: set?.prices.storeValue || null,
      retired: set?.retired ?? defaultResaleSetFormValues.retired,
      exitDate: set?.exitDate ?? null,
    })
  }

  const onSubmit: SubmitHandler<ResaleSet> = (data) =>
    (isEdit ? editResaleSet(data) : addResaleSet(data)).then(onClose, () =>
      setError('root', { message: 'Unable to save the resale set' })
    )

  return (
    <Dialog disableRestoreFocus open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? `Edit ${resaleSet.id}` : 'Add a resale set'}
      </DialogTitle>
      <DialogContent dividers>
        <form
          id="resale-set-form"
          className={classes.container}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <FormTextField
            control={control}
            name="id"
            autoFocus={!isEdit}
            disabled={isEdit}
            helperText="Name, official price and retired are filled from your collection"
            label="Set id"
            placeholder="Set id (ex: 75000)"
            onBlur={({ target: { value } }) =>
              prefillFromCollection(parseSetId(value))
            }
            parse={parseSetId}
            required
          />
          <FormTextField control={control} name="name" label="Name" required />
          <FormTextField
            control={control}
            name="frenchName"
            label="French name"
          />
          <FormTextField
            control={control}
            name="officialPrice"
            label="Official price"
            parse={parseNullableNumber}
            type="number"
          />
          <FormTextField
            control={control}
            name="exitDate"
            label="Exit date"
            parse={parseNullableText}
            slotProps={{ inputLabel: { shrink: true } }}
            type="date"
          />
          <Controller
            control={control}
            name="retired"
            render={({ field }) => <Checkbox {...field} label="Retired" />}
          />
          <FormTextField
            control={control}
            name="quantityBought"
            label="Quantity bought"
            parse={parseFloat}
            required
            type="number"
          />
          <FormTextField
            control={control}
            name="unitBoughtPrice"
            label="Unit bought price"
            parse={parseFloat}
            required
            type="number"
          />
          <FormTextField
            control={control}
            name="quantitySold"
            label="Quantity sold"
            parse={parseFloat}
            required
            type="number"
          />
          <FormTextField
            control={control}
            name="unitSellingPrice"
            label="Unit selling price"
            parse={parseNullableNumber}
            type="number"
          />
          <FormTextField
            control={control}
            name="setCondition"
            label="Set condition"
            select
          >
            {setConditions.map((option) => (
              <MenuItem key={option} value={option}>
                {capitalize(option)}
              </MenuItem>
            ))}
          </FormTextField>
          <FormTextField
            control={control}
            name="boxCondition"
            label="Box condition"
            select
          >
            {boxConditions.map((option) => (
              <MenuItem key={option} value={option}>
                {capitalize(option)}
              </MenuItem>
            ))}
          </FormTextField>
          <FormTextField control={control} name="location" label="Location" />
          {errors.root && (
            <Typography color="error" className={classes.fullWidth}>
              {errors.root.message}
            </Typography>
          )}
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" loading={isPending}>
          Cancel
        </Button>
        <Button
          color="primary"
          form="resale-set-form"
          loading={isPending}
          type="submit"
          variant="contained"
        >
          {isEdit ? 'Save' : 'Add a resale set'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ResaleSetFormModal
