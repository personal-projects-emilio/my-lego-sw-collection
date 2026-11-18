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
import { Autocomplete, TagsAutocomplete } from 'components/inputs'
import { TimelineField } from 'components/Timeline'
import { useCollection } from 'hooks'
import {
  useMinifigsAutocompleteOptions,
  useMinifigsMutations,
} from 'pages/Minifigs/hooks'
import {
  type Minifig,
  type MinifigFormInput,
  minifigValidationSchema,
} from 'types/minifigs'

import { defaultMinifigFormValues } from './MinifigFormModal.constant'
import useMinifigFormModalStyles from './MinifigFormModal.styles'
import type { MinifigFormModalProps } from './MinifigFormModal.types'

const MinifigFormModal: FC<MinifigFormModalProps> = ({
  isEdit,
  minifigData,
}) => {
  const { characterNames, ids } = useMinifigsAutocompleteOptions()
  const { minifigsList } = useCollection()
  const collectionMinifig = isEdit
    ? minifigsList?.find(({ id }) => id === minifigData.id)
    : undefined
  const inheritedTags = collectionMinifig?.inheritedTags
  const { addMinifig, editMinifig, isPending } = useMinifigsMutations()
  const navigate = useNavigate()
  const { classes } = useMinifigFormModalStyles()

  const minifigValidationSchemaWithRefinedIdCheck = useMemo(
    () =>
      minifigValidationSchema.refine(
        ({ id }) => {
          if (!isEdit) return !ids.includes(id)
          return minifigData.id === id || !ids.includes(id)
        },
        {
          path: ['id'],
          message: 'This minifig already exists',
        }
      ),
    [isEdit, ids, minifigData]
  )

  const { control, handleSubmit } = useForm<MinifigFormInput>({
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

  const onSubmit: SubmitHandler<MinifigFormInput> = (data) => {
    if (isEdit) {
      return editMinifig({
        newMinifig: data as Minifig,
        previousMinifig: minifigData,
      }).then(onClose)
    }
    return addMinifig(data as Minifig).then(onClose)
  }

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? `Edit ${minifigData.id}` : 'Add a minifig'}
      </DialogTitle>
      <DialogContent dividers>
        <form
          id="minifig-form"
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
                label="Id"
                placeholder="Minifig id (ex: sw0001a)"
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
            name="appearances"
            render={({ field }) => (
              <TimelineField
                inherited={collectionMinifig?.inheritedAppearances}
                onChange={field.onChange}
                value={field.value}
              />
            )}
          />
          <Controller
            control={control}
            defaultValue={[]}
            name="tags"
            render={({ field, fieldState }) => (
              <TagsAutocomplete
                {...field}
                inheritedTags={inheritedTags}
                itemType="minifigs"
                textFieldProps={{
                  label: 'Tags',
                  placeholder: 'Minifig tags (ex: Battle Droid, Separatists)',
                  error: fieldState.invalid,
                  helperText: fieldState.error?.message,
                }}
              />
            )}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" loading={isPending}>
          Cancel
        </Button>
        <Button
          color="primary"
          form="minifig-form"
          loading={isPending}
          type="submit"
          variant="contained"
        >
          {isEdit ? `Edit ${minifigData.id}` : 'Add a minifig'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MinifigFormModal
