import { type FC, useMemo } from 'react'
import { Controller, type SubmitHandler, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { LoadingButton } from '@mui/lab'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
} from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import { Autocomplete } from 'components/inputs'
import { useMinifigsListStats, useMinifigsMutations } from 'hooks'
import { type Minifig, minifigValidationSchema } from 'types/minifigs'

import { defaultMinifigFormValues } from './MinifigFormModal.constant'
import type { MinifigFormModalProps } from './MinifigFormModal.types'

const MinifigFormModal: FC<MinifigFormModalProps> = ({
  isEdit,
  minifigData,
}) => {
  const { appearances, characterNames, ids, tags, timelines } =
    useMinifigsListStats()
  const { addMinifig, editMinifig, isPending } = useMinifigsMutations()
  const navigate = useNavigate()

  const minifigValidationSchemaWithRefinedIdCheck = useMemo(() => {
    if (isEdit) return minifigValidationSchema
    return minifigValidationSchema.refine(({ id }) => !ids.includes(id), {
      path: ['id'],
      message: 'This minifig already exists',
    })
  }, [isEdit, ids])

  const { control, handleSubmit } = useForm<Minifig>({
    defaultValues: {
      ...defaultMinifigFormValues,
      ...minifigData,
    },
    resolver: zodResolver(minifigValidationSchemaWithRefinedIdCheck),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const onClose = () => {
    navigate({ to: '/minifigs' })
  }

  const onSubmit: SubmitHandler<Minifig> = (data) => {
    if (isEdit) {
      return editMinifig(data).then(onClose)
    }
    return addMinifig(data).then(onClose)
  }

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? `Edit ${minifigData.id}` : 'Add a minifig'}
      </DialogTitle>
      <DialogContent dividers>
        <form
          id="minifig-form"
          style={{ display: 'grid', gap: '16px' }}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <Controller
            control={control}
            name="id"
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Id"
                placeholder="Minifig id (ex: sw0001a)"
                disabled={isEdit}
                error={fieldState.invalid}
                helperText={fieldState.error?.message}
                required
              />
            )}
          />
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Name"
                placeholder="Minifig name (ex: Battle Droid Tan with Back Plate)"
                error={fieldState.invalid}
                helperText={fieldState.error?.message}
                required
              />
            )}
          />
          <Controller
            control={control}
            name="characterName"
            render={({ field, fieldState }) => (
              <div>
                <Autocomplete
                  {...field}
                  freeSolo
                  options={characterNames}
                  textFieldProps={{
                    label: 'Character Name',
                    placeholder: 'Character name (ex: Battle Droid)',
                    error: fieldState.invalid,
                    helperText: fieldState.error?.message,
                    required: true,
                  }}
                />
              </div>
            )}
          />
          <Controller
            control={control}
            defaultValue={[]}
            name="tags"
            render={({ field, fieldState }) => (
              <div>
                <Autocomplete
                  {...field}
                  freeSolo
                  multiple
                  options={tags}
                  textFieldProps={{
                    label: 'Tags',
                    placeholder: 'Minifig tags (ex: Battle Droid, CIS, Droid)',
                    error: fieldState.invalid,
                    helperText: fieldState.error?.message,
                  }}
                />
              </div>
            )}
          />
          <Controller
            control={control}
            defaultValue={[]}
            name="timelines"
            render={({ field, fieldState }) => (
              <div>
                <Autocomplete
                  {...field}
                  freeSolo
                  multiple
                  options={timelines}
                  textFieldProps={{
                    label: 'Timelines',
                    placeholder:
                      'Minifig timelines (ex: Fall of the Jedi, Age of Rebellion)',
                    error: fieldState.invalid,
                    helperText: fieldState.error?.message,
                  }}
                />
              </div>
            )}
          />
          <Controller
            control={control}
            defaultValue={[]}
            name="appearances"
            render={({ field, fieldState }) => (
              <div>
                <Autocomplete
                  {...field}
                  freeSolo
                  multiple
                  options={appearances}
                  textFieldProps={{
                    label: 'Appearances',
                    placeholder:
                      'Minifig appearances (ex: The Mandalorian, The Clone Wars...)',
                    error: fieldState.invalid,
                    helperText: fieldState.error?.message,
                  }}
                />
              </div>
            )}
          />
          <Controller
            control={control}
            name="possessed"
            render={({ field }) => (
              <FormControlLabel
                label="Possessed"
                control={<Switch checked={field.value} {...field} />}
              />
            )}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <LoadingButton onClick={onClose} color="primary" loading={isPending}>
          Cancel
        </LoadingButton>
        <LoadingButton
          color="primary"
          form="minifig-form"
          loading={isPending}
          type="submit"
          variant="contained"
        >
          {isEdit ? `Edit ${minifigData.id}` : 'Add a minifig'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

export default MinifigFormModal
