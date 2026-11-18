import type { FC } from 'react'
import { Controller, type SubmitHandler, useForm } from 'react-hook-form'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import { useMinifigsQuery } from 'api/minifigs'
import { Autocomplete, Checkbox, FormTextField } from 'components/inputs'
import { useMinifigsAutocompleteOptions } from 'pages/Minifigs/hooks'
import { parseInteger } from 'utils/parse'

import type { SetIndividualMinifigProps } from './SetMinifigs.constant'
import useSetMinifigsStyles from './SetMinifigs.styles'

type SetMinifigDialogProps = {
  minifig: SetIndividualMinifigProps
  onClose: () => void
  onSave: (minifig: SetIndividualMinifigProps) => void
  takenIds: string[]
}

const SetMinifigDialog: FC<SetMinifigDialogProps> = ({
  minifig,
  onClose,
  onSave,
  takenIds,
}) => {
  const { data: minifigsList, isLoading } = useMinifigsQuery()
  const { ids } = useMinifigsAutocompleteOptions()
  const { classes } = useSetMinifigsStyles()
  const minifigEditId = minifig.id || null
  const { control, setValue, handleSubmit } =
    useForm<SetIndividualMinifigProps>({
      defaultValues: minifig,
      mode: 'all',
    })

  const onSubmit: SubmitHandler<SetIndividualMinifigProps> = (data) => {
    onSave(data)
    onClose()
  }

  return (
    <Dialog
      aria-labelledby="set-minifig-edition"
      disableRestoreFocus
      onClose={onClose}
      open
    >
      <form
        onSubmit={(e) => {
          e.stopPropagation()
          return handleSubmit(onSubmit)(e)
        }}
      >
        <DialogTitle id="set-minifig-edition">{`${
          minifigEditId
            ? `Edit ${minifigEditId} from this set`
            : 'Add a minifig to this set'
        }`}</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Controller
            name="id"
            control={control}
            rules={{
              required: 'This field is required',
              validate: (value) => {
                if (minifigEditId) return true
                if (takenIds.includes(value)) {
                  return 'This minifig is already in the list'
                }
                return true
              },
            }}
            render={({ field, fieldState }) => (
              <Autocomplete
                {...field}
                options={ids}
                textFieldProps={{
                  autoFocus: !minifigEditId,
                  error: fieldState.invalid,
                  helperText: fieldState.error?.message,
                  label: 'Minifig id',
                  placeholder: 'Minifig id (ex: sw0001)',
                  required: true,
                }}
                onChange={(newValue) => {
                  field.onChange(newValue)
                  setValue(
                    'characterName',
                    minifigsList?.find((el) => el.id === newValue)
                      ?.characterName ?? ''
                  )
                }}
              />
            )}
          />
          <FormTextField
            control={control}
            name="characterName"
            label="Character name"
            slotProps={{ input: { readOnly: true } }}
          />
          <FormTextField
            control={control}
            name="quantity"
            rules={{ required: 'This field is required' }}
            label="Quantity"
            type="number"
            parse={parseInteger}
            required
          />
          <Controller
            name="isInFrame"
            control={control}
            render={({ field }) => {
              return <Checkbox {...field} label="At least one in frame" />
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary" loading={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            loading={isLoading}
          >
            {minifigEditId ? 'Edit' : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default SetMinifigDialog
