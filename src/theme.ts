import { createTheme, type MantineColorsTuple } from '@mantine/core';

const darkBlue: MantineColorsTuple = [
  '#eef3ff',
  '#dce4f5',
  '#b9c7e2',
  '#94a8d0',
  '#748dc1',
  '#5f7cb8',
  '#5474b4',
  '#44639f',
  '#3a588f',
  '#2e4a7d',
];

export const theme = createTheme({
  colors: {
    darkBlue,
  },
  primaryColor: 'darkBlue',
  primaryShade: 6,
  fontFamily: 'Inter, system-ui, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, monospace',
  headings: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '600',
  },
  defaultRadius: 'md',
  components: {
    Card: {
      styles: {
        root: {
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        },
      },
    },
    Drawer: {
      styles: {
        content: {
          borderTopLeftRadius: '16px',
          borderBottomLeftRadius: '16px',
        },
      },
    },
  },
});
