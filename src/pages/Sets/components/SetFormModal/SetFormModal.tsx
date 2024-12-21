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
  Typography,
} from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import DisplayIfAuthenticated from 'components/DisplayIfAuthenticated'
import { Autocomplete, Checkbox } from 'components/inputs'
import { useSetsAutocompleteOptions, useSetsMutations } from 'pages/Sets/hooks'
import { type Set, setValidationSchema } from 'types/sets'

import { defaultSetFormValues } from './SetFormModal.constant'
import useStyles from './SetFormModal.styles'
import type { SetFormModalProps } from './SetFormModal.types'

const SetFormModal: FC<SetFormModalProps> = ({ isEdit, setData }) => {
  const { appearances, subthemes, ids, tags, timelines } =
    useSetsAutocompleteOptions()
  const { addSet, editSet, isPending } = useSetsMutations()
  const navigate = useNavigate()
  const { classes } = useStyles()

  const setValidationSchemaWithRefinedIdCheck = useMemo(
    () =>
      setValidationSchema
        .refine(
          ({ id }) => {
            if (!isEdit) return !ids.includes(id)
            if (isEdit) return setData?.id === id
          },
          {
            path: ['id'],
            message: 'This set already exists',
          }
        )
        .refine(
          ({ possessed, location }) => {
            if (!possessed) return true
            if (possessed) return location.length > 0
          },
          {
            path: ['location'],
            message: 'Location is mandatory if you possess the set!',
          }
        )
        .refine(
          ({ possessed, ownedQuantity }) => {
            if (!possessed) return true
            if (possessed) return ownedQuantity > 0
          },
          {
            path: ['ownedQuantity'],
            message: 'Owned quantity must be superior to 0!',
          }
        ),
    [ids, isEdit, setData]
  )

  const { control, handleSubmit, setValue, watch } = useForm<Set>({
    defaultValues: defaultSetFormValues(setData),
    resolver: zodResolver(setValidationSchemaWithRefinedIdCheck),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const onClose = () => {
    navigate({ to: '/sets' })
  }

  const onSubmit: SubmitHandler<Set> = (data) => {
    if (isEdit) {
      return editSet(data).then(onClose)
    }
    return addSet(data).then(onClose)
  }

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? `Edit ${setData.id}` : 'Add a set'}</DialogTitle>
      <DialogContent dividers>
        <form
          id="set-form"
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
                className={classes.gridSpan12}
                disabled={isEdit}
                error={fieldState.invalid}
                helperText={fieldState.error?.message}
                label="Id"
                placeholder="Set id (ex: 75000)"
                onChange={(event) => {
                  const { value } = event.target
                  if (/\D/.test(value)) {
                    // contains non-digits
                    field?.onChange(value)
                  } else {
                    // contains only digits
                    field?.onChange(parseInt(value, 10))
                  }
                }}
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
                className={classes.gridSpan12}
                error={fieldState.invalid}
                helperText={fieldState.error?.message}
                label="Name"
                placeholder="Set name (ex: X-Wing)"
                required
              />
            )}
          />
          <Controller
            control={control}
            name="subtheme"
            render={({ field, fieldState }) => (
              <Autocomplete
                {...field}
                className={classes.gridSpan12}
                freeSolo
                options={subthemes}
                textFieldProps={{
                  label: 'Subtheme',
                  placeholder: 'Set subtheme (ex: UCS, Seasonal...)',
                  error: fieldState.invalid,
                  helperText: fieldState.error?.message,
                  required: true,
                }}
              />
            )}
          />
          <Controller
            control={control}
            defaultValue={[]}
            name="tags"
            render={({ field, fieldState }) => (
              <Autocomplete
                {...field}
                className={classes.gridSpan12}
                freeSolo
                multiple
                options={tags}
                textFieldProps={{
                  label: 'Tags',
                  placeholder: 'Set tags (ex: Starfighter, Rebel Alliance...)',
                  error: fieldState.invalid,
                  helperText: fieldState.error?.message,
                }}
              />
            )}
          />
          <Controller
            control={control}
            defaultValue={[]}
            name="appearances"
            render={({ field, fieldState }) => (
              <Autocomplete
                {...field}
                className={classes.gridSpan12}
                freeSolo
                multiple
                options={appearances}
                textFieldProps={{
                  label: 'Appearances',
                  placeholder:
                    'Set appearances (ex: The Mandalorian, The Clone Wars...)',
                  error: fieldState.invalid,
                  helperText: fieldState.error?.message,
                }}
              />
            )}
          />
          <Controller
            control={control}
            defaultValue={[]}
            name="timelines"
            render={({ field, fieldState }) => (
              <Autocomplete
                {...field}
                className={classes.gridSpan12}
                freeSolo
                multiple
                options={timelines}
                textFieldProps={{
                  label: 'Timelines',
                  placeholder:
                    'Set timelines (ex: Fall of the Jedi, Age of Rebellion)',
                  error: fieldState.invalid,
                  helperText: fieldState.error?.message,
                }}
              />
            )}
          />
          <Controller
            name="location"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                className={classes.gridSpan12}
                error={fieldState.invalid}
                helperText={fieldState.error?.message}
                label="Location"
                multiline
                placeholder="Set location (ex: Attic, Office...)"
                required={watch('possessed') === true}
              />
            )}
          />
          <Controller
            name="note"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                className={classes.gridSpan12}
                error={fieldState.invalid}
                helperText={fieldState.error?.message}
                label="Notes"
                multiline
                placeholder="Misce notes"
              />
            )}
          />
          <Controller
            name="releaseYear"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                className={classes.gridSpan4}
                error={fieldState.invalid}
                helperText={fieldState.error?.message}
                label="Release Year"
                onChange={(event) =>
                  field?.onChange?.(parseInt(event.target.value, 10))
                }
                required
                type="number"
              />
            )}
          />
          <Controller
            name="possessed"
            control={control}
            render={({ field }) => {
              return (
                <FormControlLabel
                  className={classes.gridSpan4}
                  label="Possessed"
                  control={
                    <Switch
                      checked={field.value}
                      {...field}
                      onChange={(event) => {
                        field?.onChange(event)
                        setValue(
                          'ownedQuantity',
                          event.target.value === 'false' ? 1 : 0
                        )
                      }}
                    />
                  }
                />
              )
            }}
          />
          {watch('possessed') === true && (
            <Controller
              name="ownedQuantity"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  className={classes.gridSpan4}
                  error={fieldState.invalid}
                  helperText={fieldState.error?.message}
                  label="Owned quantity"
                  onChange={(event) =>
                    field?.onChange?.(parseInt(event.target.value, 10))
                  }
                  required
                  type="number"
                />
              )}
            />
          )}
          <Typography variant="h6" className={classes.gridSpan12}>
            Content
          </Typography>
          {/* <Controller
            name="content.minifigs"
            control={control}
            render={({ field }) => {
              return <SetMinifigs className={classes.grid12} {...field} />
            }}
          /> */}
          <Controller
            name="content.box"
            control={control}
            render={({ field }) => (
              <Checkbox
                {...field}
                className={classes.gridSpan3}
                label="Box"
                isIndeterminate
              />
            )}
          />
          <Controller
            name="content.notice"
            control={control}
            render={({ field }) => (
              <Checkbox
                {...field}
                className={classes.gridSpan3}
                label="Notice"
                isIndeterminate
              />
            )}
          />
          <Controller
            name="content.bags"
            control={control}
            render={({ field }) => (
              <Checkbox
                {...field}
                className={classes.gridSpan3}
                label="Bags"
                isIndeterminate
              />
            )}
          />
          <Controller
            name="content.partsQuantity"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                className={classes.gridSpan3}
                error={fieldState.invalid}
                helperText={fieldState.error?.message}
                label="Parts quantity"
                onChange={(event) =>
                  field?.onChange?.(parseInt(event.target.value, 10))
                }
                type="number"
                value={field.value}
              />
            )}
          />{' '}
          <DisplayIfAuthenticated>
            <Typography variant="h6" className={classes.gridSpan12}>
              Prices
            </Typography>
            <Controller
              name="prices.bought"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  className={classes.gridSpan4}
                  error={fieldState.invalid}
                  helperText={fieldState.error?.message}
                  label="Bought"
                  onChange={(event) =>
                    field?.onChange?.(parseFloat(event.target.value))
                  }
                  required
                  type="number"
                />
              )}
            />
            <Controller
              name="prices.storeValue"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  className={classes.gridSpan4}
                  error={fieldState.invalid}
                  helperText={fieldState.error?.message}
                  label="Store Value"
                  onChange={(event) =>
                    field?.onChange?.(parseFloat(event.target.value))
                  }
                  required
                  type="number"
                />
              )}
            />
            <Controller
              name="prices.marketValue"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  className={classes.gridSpan4}
                  error={fieldState.invalid}
                  helperText={fieldState.error?.message}
                  label="Market Value"
                  onChange={(event) =>
                    field?.onChange?.(parseFloat(event.target.value))
                  }
                  required
                  type="number"
                />
              )}
            />
          </DisplayIfAuthenticated>
        </form>
      </DialogContent>
      <DialogActions>
        <LoadingButton onClick={onClose} color="primary" loading={isPending}>
          Cancel
        </LoadingButton>
        <LoadingButton
          color="primary"
          form="set-form"
          loading={isPending}
          type="submit"
          variant="contained"
        >
          {isEdit ? `Edit ${setData.id}` : 'Add a set'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

export default SetFormModal
