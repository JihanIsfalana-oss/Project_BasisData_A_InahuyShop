import { colors } from './primitives/colors.js'
import { spacing } from './primitives/spacing.js'
import { typography } from './primitives/typography.js'
import { semanticColors } from './semantic/colors.js'
import { semanticSurfaces } from './semantic/surfaces.js'
import { lightTheme } from './themes/light.js'
import { darkTheme } from './themes/dark.js'

export { lightTheme, darkTheme }

export const primitives = Object.freeze({
  colors,
  spacing,
  typography,
  controlHeight: 44,
  radius: Object.freeze({ sm: '6px', md: '10px', lg: '16px' }),
  elevation: Object.freeze({ card: '0 2px 8px rgb(15 23 42 / 0.08)' }),
  iconSize: Object.freeze({ sm: 16, md: 20, lg: 24 }),
  motion: Object.freeze({ fast: '150ms', standard: '250ms' }),
})

export const semantic = Object.freeze({
  color: semanticColors,
  surface: semanticSurfaces,
  focus: Object.freeze({ ring: '#6366F1' }),
})
