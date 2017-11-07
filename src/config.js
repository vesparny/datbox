const breakpoints = [40, 52, 64]

exports.colors = {
  blue: '#1976D2',
  black: '#111111',
  red: '#FF4136',
  washedYellow: '#FFFCEB',
  green: '#137752',
  darkGray: '#4D4D4F',
  white: '#ffffff',
  lightGrey: '#CCCCCC',
  grey: '#777777'
}

exports.sizes = {
  maxWidth: '900px'
}

exports.screen = {
  small: `@media screen and (min-width: ${breakpoints[0]}em)`,
  medium: `@media screen and (min-width: ${breakpoints[1]}em)`,
  large: `@media screen and (min-width: ${breakpoints[2]}em)`
}
