const React = require('react')
const pb = require('prettier-bytes')
const { Box, Flex, Text } = require('./ui')
const { colors, screen } = require('../config')
const { ellipsis } = require('polished')

const { css } = require('emotion') // eslint-disable-line
const FileIcon = require('react-icons/lib/fa/file-o')

module.exports = class File extends React.Component {
  render () {
    const { name, size, ready } = this.props
    return (
      <Flex
        px={1}
        py={2}
        css={{
          borderBottom: `1px solid ${colors.red}`,
          ':hover': {
            backgroundColor: colors.washedYellow
          }
        }}>
        <Flex flex='0 0 60%' align='center'>
          <Box pr={1}>
            <FileIcon color={colors.red} />
          </Box>
          <Box pr={1}>
            <Text
              css={{
                [screen.medium]: {
                  ...ellipsis('500px')
                },
                ...ellipsis('170px')
              }}
              color={colors.darkGray}>
              {name}
            </Text>
          </Box>
        </Flex>
        <Box flex='0 0 20%' align='center'>
          <Text color={colors.darkGray}>{pb(size)}</Text>
        </Box>
        <Box flex='1' align='right'>
          <Text color={colors.darkGray}>{ready ? '' : 'Sharing...'}</Text>
        </Box>
      </Flex>
    )
  }
}
