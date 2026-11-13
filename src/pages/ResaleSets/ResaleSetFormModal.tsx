import { type FC, useMemo, useRef } from 'react'
import {
  Controller,
  type FieldPath,
  type SubmitHandler,
  useForm,
} from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import { useSetsQuery } from 'api/sets'
import { Checkbox } from 'components/inputs'
import { makeStyles } from 'tss-react/mui'
import {
  boxConditions,
  type ResaleSet,
  type ResaleSetFormInput,
  resaleSetValidationSchema,
  setConditions,
} from 'types/resale'

import useResaleSetsMutations from './useResaleSetsMutations'

const useStyles = makeStyles({ name: 'ResaleSetFormModal' })((theme) => ({
  container: {
    display: 'grid',
    gap: theme.spacing(2),
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
}))

const defaultResaleSetFormValues: ResaleSetFormInput = {
  id: '',
  frenchName: '',
  name: '',
  officialPrice: null,
  retired: false,
  exitDate: null,
  quantityBought: 1,
  unitBoughtPrice: 0,
  unitSellingPrice: null,
  quantitySold: 0,
  setCondition: 'sealed',
  boxCondition: 'good',
  location: '',
}

type ResaleSetFormModalProps = {
  resaleSet?: ResaleSet
}

const ResaleSetFormModal: FC<ResaleSetFormModalProps> = ({ resaleSet }) => {
  const isEdit = resaleSet !== undefined
  const { data: setsList = [] } = useSetsQuery()
  const { addResaleSet, editResaleSet, isPending, resaleSetsList } =
    useResaleSetsMutations()
  const navigate = useNavigate()
  const { classes } = useStyles()
  const isPrefilled = useRef(false)

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
    setValue,
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
    if (!set && !isPrefilled.current) return
    isPrefilled.current = Boolean(set)
    setValue('name', set?.name ?? defaultResaleSetFormValues.name)
    setValue('officialPrice', set?.prices.storeValue || null)
    setValue('retired', set?.retired ?? defaultResaleSetFormValues.retired)
    setValue('exitDate', set?.exitDate ?? null)
  }

  const onSubmit: SubmitHandler<ResaleSet> = (data) =>
    (isEdit ? editResaleSet(data) : addResaleSet(data)).then(onClose, () =>
      setError('root', { message: 'Unable to save the resale set' })
    )

  const numberField = (
    name: FieldPath<ResaleSetFormInput>,
    label: string,
    { nullable = false, required = false } = {}
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          error={fieldState.invalid}
          helperText={fieldState.error?.message}
          label={label}
          onChange={({ target: { value } }) =>
            field.onChange(nullable && value === '' ? null : parseFloat(value))
          }
          required={required}
          type="number"
          value={field.value ?? ''}
        />
      )}
    />
  )

  const selectField = (
    name: 'setCondition' | 'boxCondition',
    label: string,
    options: readonly string[]
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <TextField {...field} label={label} select>
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  )

  const textField = (
    name: 'frenchName' | 'name' | 'location',
    label: string,
    required = false
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          error={fieldState.invalid}
          helperText={fieldState.error?.message}
          label={label}
          required={required}
        />
      )}
    />
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
          <Controller
            control={control}
            name="id"
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                autoFocus={!isEdit}
                disabled={isEdit}
                error={fieldState.invalid}
                helperText={
                  fieldState.error?.message ??
                  'Name, official price and retired are filled from your collection'
                }
                label="Set id"
                placeholder="Set id (ex: 75000)"
                onBlur={() => {
                  field.onBlur()
                  prefillFromCollection(field.value)
                }}
                onChange={({ target: { value } }) =>
                  field.onChange(/\D/.test(value) ? value : parseInt(value, 10))
                }
                required
                value={Number.isNaN(field.value) ? '' : field.value}
              />
            )}
          />
          {textField('name', 'Name', true)}
          {textField('frenchName', 'French name')}
          {numberField('officialPrice', 'Official price', { nullable: true })}
          <Controller
            control={control}
            name="exitDate"
            render={({ field }) => (
              <TextField
                {...field}
                label="Exit date"
                onChange={({ target: { value } }) =>
                  field.onChange(value || null)
                }
                slotProps={{ inputLabel: { shrink: true } }}
                type="date"
                value={field.value ?? ''}
              />
            )}
          />
          <Controller
            control={control}
            name="retired"
            render={({ field }) => <Checkbox {...field} label="Retired" />}
          />
          {numberField('quantityBought', 'Quantity bought', { required: true })}
          {numberField('unitBoughtPrice', 'Unit bought price', {
            required: true,
          })}
          {numberField('quantitySold', 'Quantity sold', { required: true })}
          {numberField('unitSellingPrice', 'Unit selling price', {
            nullable: true,
          })}
          {selectField('setCondition', 'Set condition', setConditions)}
          {selectField('boxCondition', 'Box condition', boxConditions)}
          {textField('location', 'Location')}
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
