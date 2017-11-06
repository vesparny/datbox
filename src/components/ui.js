const styled = require('react-emotion').default
const { lighten, transitions } = require('polished')

const {
  space,
  width,
  fontSize,
  color,
  fontWeight,
  textAlign,
  alignItems,
  justifyContent,
  flexDirection,
  flex,
  borderColor,
  borderWidth
} = require('styled-system')

const { colors } = require('../config')

module.exports.Box = styled('div')(
  space,
  width,
  textAlign,
  alignItems,
  justifyContent,
  flexDirection,
  flex,
  borderColor,
  borderWidth,
  color
)

module.exports.Flex = styled(module.exports.Box)({ display: 'flex' })

module.exports.H1 = styled('h1')(space, fontSize, color, fontWeight, textAlign)
module.exports.H1.defaultProps = {
  fontWeight: 'bold',
  fontSize: [6, 8],
  color: colors.red,
  m: 0,
  p: 0
}

module.exports.Text = styled('span')(space, fontSize, color)
module.exports.Text.defaultProps = {
  fontSize: 2,
  color: colors.red,
  m: 0,
  p: 0
}

module.exports.A = styled('a')(
  {
    ...transitions('all 0.1s ease-in'),
    textDecoration: 'underline',
    ':hover': {
      color: lighten(0.1, colors.green),
      textDecoration: 'underline'
    }
  },
  space,
  fontSize,
  color
)
module.exports.A.defaultProps = {
  fontSize: 2,
  color: colors.green,
  m: 0,
  p: 0
}

module.exports.Button = styled(module.exports.A.withComponent('button'))({
  ...transitions('all 0.1s ease-in'),
  background: 'transparent',
  border: 'none',
  cursor: 'pointer'
})
module.exports.Button.defaultProps = {
  fontSize: 2,
  color: colors.green,
  m: 0,
  p: 0
}
