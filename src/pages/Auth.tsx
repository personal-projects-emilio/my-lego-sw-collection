import { FC, useState } from 'react'
import { Controller, type SubmitHandler, useForm } from 'react-hook-form'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
} from '@mui/material'
import { useAuth } from 'providers'
import { makeStyles } from 'tss-react/mui'
import { authValidationSchema, LoginInputs } from 'types/auth'

const useStyles = makeStyles()((theme) => ({
  container: {
    padding: theme.spacing(2),
    margin: theme.spacing(2),
    boxSizing: 'border-box',
    display: 'grid',
    gap: theme.spacing(2),
  },
  button: {
    justifySelf: 'center',
  },
}))

const Auth: FC = () => {
  const { classes } = useStyles()
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading } = useAuth()
  const { control, handleSubmit } = useForm<LoginInputs>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(authValidationSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const onSubmit: SubmitHandler<LoginInputs> = (data) => login(data)

  return (
    <Paper
      className={classes.container}
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => {
          return (
            <TextField
              {...field}
              label="Email"
              id="email"
              placeholder="Email@exemple.com"
              error={fieldState.invalid}
              helperText={fieldState.error?.message}
              required
              fullWidth
            />
          )
        }}
      />
      <Controller
        name="password"
        control={control}
        render={({ field, fieldState }) => {
          return (
            <TextField
              {...field}
              label="Password"
              id="password"
              error={fieldState.invalid}
              helperText={fieldState.error?.message}
              required
              fullWidth
              type={showPassword ? 'text' : 'password'}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Toggle password visibility"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          )
        }}
      />
      <Button
        className={classes.button}
        color="primary"
        disabled={isLoading}
        type="submit"
        variant="contained"
      >
        Login
      </Button>
    </Paper>
  )
}

export default Auth
