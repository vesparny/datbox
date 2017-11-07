const React = require('react')
const copy = require('copy-text-to-clipboard')
const { rgba } = require('polished')
const Dropzone = require('react-dropzone')
const Archive = require('../components/archive')
const { Box, Text, Flex, Button } = require('../components/ui')
const File = require('../components/file')
const { colors } = require('../config')

module.exports = class Upload extends React.Component {
  state = {
    files: [],
    dropzoneActive: false,
    shouldLoadFiles: false
  }

  onDragEnter = () => {
    this.setState({
      dropzoneActive: true
    })
  }

  onDragLeave = () => {
    this.setState({
      dropzoneActive: false
    })
  }

  onDrop = files => {
    this.setState({
      files: []
    })
    this.setState({
      files,
      dropzoneActive: false
    })
  }

  makeLink = archiveKey =>
    window.location.protocol +
    '//' +
    window.location.host +
    window.location.pathname +
    'd/' +
    archiveKey

  render () {
    const { files, dropzoneActive } = this.state
    return (
      <Box py={3} px={[2, 2, 0]}>
        <Dropzone
          style={{
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backgroundColor: colors.washedYellow,
            boxShadow: `5px 5px 34px -13px ${rgba(colors.red, 1)}`,
            border: `1px dashed ${colors.red}`
          }}
          activeStyle={{
            border: `2px solid ${colors.red}`
          }}
          onDrop={this.onDrop}
          onDragEnter={this.onDragEnter}
          onDragLeave={this.onDragLeave}>
          <Text
            fontSize={[2, 3, 3]}
            css={{ opacity: dropzoneActive ? '.5' : '1' }}>
            Drop files here or click to upload.
          </Text>
        </Dropzone>
        <Box>
          {files.length > 0 && (
            <Archive
              files={files}
              render={({ files, ready, peers, archive }) => {
                return (
                  <Box>
                    <Flex
                      width='100%'
                      align='center'
                      justify='center'
                      flexDirection='column'
                      css={{
                        height: 220
                      }}>
                      {ready ? (
                        <Box>
                          <Box py={1}>
                            <Text fontSize={3}>
                              Connected to {peers} peer(s)
                            </Text>
                          </Box>
                          <Box py={1}>
                            <pre
                              css={{
                                overflow: 'auto',
                                border: `1px solid ${colors.lightGrey}`,
                                padding: 10
                              }}>
                              <code
                                css={{
                                  fontSize: 14
                                }}>
                                {this.makeLink(archive.key.toString('hex'))}
                              </code>
                            </pre>
                            <Button
                              fontSize={3}
                              onClick={() => {
                                copy(this.makeLink(archive.key.toString('hex')))
                                this.props.onNotification(
                                  'Link copied to clipoard'
                                )
                              }}>
                              copy the share link
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Box>
                          <Text>Sharing files...</Text>
                        </Box>
                      )}
                    </Flex>
                    <Box>
                      {files.map(file => {
                        return (
                          <File
                            key={file.name}
                            name={file.name}
                            size={file.size}
                            ready={file.ready}
                          />
                        )
                      })}
                    </Box>
                  </Box>
                )
              }}
            />
          )}
        </Box>
      </Box>
    )
  }
}
