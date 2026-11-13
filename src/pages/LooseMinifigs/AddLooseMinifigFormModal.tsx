import { type FC, useMemo } from 'react'
import { Controller, type SubmitHandler, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import { Autocomplete, Checkbox } from 'components/inputs'
import { useCollection } from 'hooks'
import { makeStyles } from 'tss-react/mui'
import { z } from 'zod'

import useLooseMinifigsMutations from './useLooseMinifigsMutations'

const useStyles = makeStyles({ name: 'AddLooseMinifigFormModal' })((theme) => ({
  container: {
    display: 'grid',
    gap: theme.spacing(2),
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
}))

type LooseMinifigFormInput = {
  id: string
  quantity: number
  isInFrame: boolean
  unitBoughtPrice: number
  unitMarketValue: number
}

const AddLooseMinifigFormModal: FC = () => {
  const { minifigsList = [] } = useCollection()
  const { editLooseMinifig, isPending } = useLooseMinifigsMutations()
  const navigate = useNavigate()
  const { classes } = useStyles()

  const availableMinifigs = useMemo(
    () =>
      new Map(
        minifigsList
          .filter(({ owned }) => owned.loose.quantity === 0)
          .map(({ id, name }) => [id, name])
      ),
    [minifigsList]
  )

  const schema = useMemo(
    () =>
      z.object({
        id: z
          .string({ message: 'Minifig is required' })
          .refine((id) => availableMinifigs.has(id), {
            message: 'Pick a minifig without loose copies',
          }),
        quantity: z.number().int().min(1, {
          message: 'Quantity must be at least 1',
        }),
        isInFrame: z.boolean(),
        unitBoughtPrice: z.number().min(0),
        unitMarketValue: z.number().min(0),
      }),
    [availableMinifigs]
  )

  const { control, handleSubmit } = useForm<LooseMinifigFormInput>({
    defaultValues: {
      id: '',
      quantity: 1,
      isInFrame: false,
      unitBoughtPrice: 0,
      unitMarketValue: 0,
    },
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const onClose = () => {
    navigate({ to: '/loose-minifigs' })
  }

  const onSubmit: SubmitHandler<LooseMinifigFormInput> = ({ id, ...loose }) =>
    editLooseMinifig(id, loose).then(onClose)

  const numberField = (
    name: 'quantity' | 'unitBoughtPrice' | 'unitMarketValue',
    label: string
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
          onChange={(event) => field.onChange(parseFloat(event.target.value))}
          required
          type="number"
        />
      )}
    />
  )

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add a loose minifig</DialogTitle>
      <DialogContent dividers>
        <form
          id="loose-minifig-form"
          className={classes.container}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <Controller
            control={control}
            name="id"
            render={({ field, fieldState }) => (
              <div className={classes.fullWidth}>
                <Autocomplete
                  {...field}
                  getOptionLabel={(id) =>
                    availableMinifigs.has(id)
                      ? `${id} - ${availableMinifigs.get(id)}`
                      : id
                  }
                  options={[...availableMinifigs.keys()]}
                  textFieldProps={{
                    label: 'Minifig',
                    placeholder: 'Minifig id or name (ex: sw0001a)',
                    error: fieldState.invalid,
                    helperText: fieldState.error?.message,
                    required: true,
                  }}
                />
              </div>
            )}
          />
          {numberField('quantity', 'Quantity')}
          <Controller
            control={control}
            name="isInFrame"
            render={({ field }) => <Checkbox {...field} label="In frame" />}
          />
          {numberField('unitBoughtPrice', 'Unit bought price')}
          {numberField('unitMarketValue', 'Unit market value')}
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" loading={isPending}>
          Cancel
        </Button>
        <Button
          color="primary"
          form="loose-minifig-form"
          loading={isPending}
          type="submit"
          variant="contained"
        >
          Add a loose minifig
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddLooseMinifigFormModal
