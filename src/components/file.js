const React = require('react')
const pb = require('prettier-bytes')
const fileSaver = require('file-saver')
const { ellipsis } = require('polished')
const { css } = require('emotion') // eslint-disable-line
const percent = require('percent')

const { Box, Flex, Text, Button } = require('./ui')
const { colors, screen } = require('../config')

const FileIcon = require('react-icons/lib/fa/file-o')
const DownloadIcon = require('react-icons/lib/fa/download')
const CheckIcon = require('react-icons/lib/fa/check')

module.exports = class File extends React.Component {
  state = {
    isDownloading: false
  }
  render () {
    const {
      name,
      size,
      ready,
      download,
      progress,
      downloadFile,
      blob,
      downloadSpeed
    } = this.props

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
          <Flex align='center' justify='center' flexDirection='column'>
            {download ? (
              blob ? (
                <Box>
                  <Button
                    color={colors.red}
                    onClick={() => {
                      fileSaver.saveAs(blob)
                    }}>
                    <CheckIcon /> save
                  </Button>
                </Box>
              ) : this.state.isDownloading ? (
                <Box>
                  <Box>
                    <Text color={colors.green}>{downloadSpeed}</Text>
                  </Box>
                  <Box>
                    <Text>{percent.calc(progress, size, 0) + ' %'}</Text>
                  </Box>
                </Box>
              ) : (
                <Box>
                  {' '}
                  <Button
                    color={colors.red}
                    onClick={() => {
                      downloadFile(name)
                      this.setState({ isDownloading: true })
                    }}>
                    <DownloadIcon /> download
                  </Button>
                </Box>
              )
            ) : (
              <Box>
                <Text color={colors.darkGray}>{ready ? '' : 'sharing...'}</Text>
              </Box>
            )}
          </Flex>
        </Box>
      </Flex>
    )
  }
}
