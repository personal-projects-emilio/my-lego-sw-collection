import { type FC, useMemo } from 'react'
import { Controller, type SubmitHandler, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import DisplayIfAuthenticated from 'components/DisplayIfAuthenticated'
import {
  Autocomplete,
  Checkbox,
  FormTextField,
  TagsAutocomplete,
} from 'components/inputs'
import { TimelineField } from 'components/Timeline'
import { useSetsAutocompleteOptions, useSetsMutations } from 'pages/Sets/hooks'
import { type SetFormInput, setValidationSchema } from 'types/sets'
import { formatFrDate } from 'utils/format'
import { isSetRetired } from 'utils/lego'
import { parseInteger, parseSetId } from 'utils/parse'

import {
  brickLinkPriceFields,
  contentFields,
  dimensionFields,
  getDefaultSetFormValues,
  priceFields,
} from './SetFormModal.constant'
import useSetFormModalStyles from './SetFormModal.styles'
import type { SetFormModalProps } from './SetFormModal.types'
import SetMinifigs from './SetMinifigs'

const SetFormModal: FC<SetFormModalProps> = ({ isEdit, setData }) => {
  const { subthemes, ids } = useSetsAutocompleteOptions()
  const { addSet, editSet, isPending } = useSetsMutations()
  const navigate = useNavigate()
  const { classes } = useSetFormModalStyles()

  const setValidationSchemaWithRefinedIdCheck = useMemo(
    () =>
      setValidationSchema
        .refine(
          ({ id }) => {
            if (!isEdit) return !ids.includes(id)
            return setData.id === id || !ids.includes(id)
          },
          {
            path: ['id'],
            message: 'This set already exists',
          }
        )
        .refine(
          ({ ownedQuantity, location }) =>
            !(ownedQuantity > 0) || location.length > 0,
          {
            path: ['location'],
            message: 'Location is mandatory if you possess the set!',
          }
        ),
    [ids, isEdit, setData]
  )

  const { control, handleSubmit, watch } = useForm<SetFormInput>({
    defaultValues: getDefaultSetFormValues(setData),
    resolver: zodResolver(setValidationSchemaWithRefinedIdCheck),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })
  const onClose = () => {
    navigate({ to: '/sets' })
  }

  const onSubmit: SubmitHandler<SetFormInput> = (data) => {
    if (isEdit) {
      return editSet({ newSet: data, previousSet: setData }).then(onClose)
    }
    return addSet(data).then(onClose)
  }

  return (
    <Dialog disableRestoreFocus open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? `Edit ${setData.id}` : 'Add a set'}</DialogTitle>
      <DialogContent dividers>
        <form
          id="set-form"
          className={classes.container}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <FormTextField
            control={control}
            name="id"
            autoFocus={!isEdit}
            className={classes.gridSpan12}
            label="Id"
            placeholder="Set id (ex: 75000)"
            parse={parseSetId}
            required
          />
          <FormTextField
            control={control}
            name="name"
            className={classes.gridSpan12}
            label="Name"
            placeholder="Set name (ex: X-Wing)"
            required
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
            name="timeline"
            render={({ field }) => (
              <TimelineField
                className={classes.gridSpan12}
                onChange={field.onChange}
                placeholder="Pick eras, trilogies or titles"
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
                className={classes.gridSpan12}
                itemType="sets"
                textFieldProps={{
                  label: 'Tags',
                  placeholder:
                    'Set tags (ex: A New Hope, X-wing, Rebel Alliance...)',
                  error: fieldState.invalid,
                  helperText: fieldState.error?.message,
                }}
              />
            )}
          />
          <FormTextField
            control={control}
            name="location"
            className={classes.gridSpan12}
            label="Location"
            multiline
            placeholder="Set location (ex: Attic, Office...)"
            required={watch('ownedQuantity') > 0}
          />
          <FormTextField
            control={control}
            name="note"
            className={classes.gridSpan12}
            label="Notes"
            multiline
            placeholder="Misce notes"
          />
          <FormTextField
            control={control}
            name="releaseYear"
            className={classes.gridSpan4}
            label="Release Year"
            parse={parseInteger}
            required
            type="number"
          />
          <FormTextField
            control={control}
            name="ownedQuantity"
            className={classes.gridSpan4}
            label="Owned quantity"
            parse={parseInteger}
            required
            type="number"
          />
          <Controller
            name="retired"
            control={control}
            render={({ field }) => {
              const exitDate = watch('exitDate')
              return (
                <Checkbox
                  {...field}
                  className={classes.gridSpan4}
                  disabled={Boolean(exitDate)}
                  label={
                    exitDate ? `Retired (${formatFrDate(exitDate)})` : 'Retired'
                  }
                  value={isSetRetired({ exitDate, retired: field.value })}
                />
              )
            }}
          />
          {(['EAN', 'UPC'] as const).map((name) => (
            <FormTextField
              key={name}
              control={control}
              name={name}
              className={classes.gridSpan6}
              disabled
              label={name}
            />
          ))}
          <Typography variant="h6" className={classes.gridSpan12}>
            Content
          </Typography>
          <Controller
            name="content.minifigs"
            control={control}
            render={({ field }) => {
              return <SetMinifigs className={classes.gridSpan12} {...field} />
            }}
          />
          {contentFields.map(({ name, label }) => (
            <Controller
              key={name}
              name={name}
              control={control}
              render={({ field }) => (
                <Checkbox
                  {...field}
                  className={classes.gridSpan3}
                  label={label}
                  isIndeterminate
                />
              )}
            />
          ))}
          <FormTextField
            control={control}
            name="content.partsQuantity"
            className={classes.gridSpan3}
            label="Parts quantity"
            parse={parseInteger}
            type="number"
          />
          <Typography variant="h6" className={classes.gridSpan12}>
            Dimensions
          </Typography>
          <Typography variant="subtitle1" className={classes.gridSpan12}>
            From brickset (in cm) - You can update them by uploading a new CSV
            from Brickset
          </Typography>
          {dimensionFields.map(({ name, label }) => (
            <FormTextField
              key={name}
              control={control}
              name={name}
              className={classes.gridSpan4}
              disabled
              label={label}
            />
          ))}
          <DisplayIfAuthenticated>
            <Typography variant="h6" className={classes.gridSpan12}>
              Prices
            </Typography>
            {priceFields.map(({ name, label }) => (
              <FormTextField
                key={name}
                control={control}
                name={name}
                className={classes.gridSpan4}
                label={label}
                parse={parseFloat}
                required
                type="number"
              />
            ))}
            {brickLinkPriceFields.map(({ name, label }) => (
              <FormTextField
                key={name}
                control={control}
                name={name}
                className={classes.gridSpan6}
                disabled
                helperText="This value is updated when you upload a new CSV from Brickset"
                label={label}
              />
            ))}
          </DisplayIfAuthenticated>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" loading={isPending}>
          Cancel
        </Button>
        <Button
          color="primary"
          form="set-form"
          loading={isPending}
          type="submit"
          variant="contained"
        >
          {isEdit ? `Edit ${setData.id}` : 'Add a set'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SetFormModal
