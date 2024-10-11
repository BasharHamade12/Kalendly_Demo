import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, extendTheme, ColorModeScript } from '@chakra-ui/react'; // Import ChakraProvider and theming tools
import App from './App';
import './index.css';

// Configure Chakra UI's theme to use dark mode by default
const config = {
  initialColorMode: 'dark', // Default to dark mode
  useSystemColorMode: false, // Disable system color mode
};

const theme = extendTheme({ config });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <App />
    </ChakraProvider>
  </StrictMode>
);
