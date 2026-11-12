import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import { QueryClientProvider, RouterProvider, ThemeProvider } from 'providers'

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider>
        <RouterProvider />
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
