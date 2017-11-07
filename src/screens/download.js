const React = require('react')
const Archive = require('../components/archive')
const { Box, Text, Flex } = require('../components/ui')
const File = require('../components/file')

module.exports = class Downlaod extends React.Component {
  render () {
    return (
      <Box py={3} px={[2, 2, 0]}>
        <Archive
          id={this.props.match.params.id}
          render={({
            files,
            ready,
            loadingFiles,
            peers,
            archive,
            downloadFile
          }) => {
            return (
              <Box>
                <Flex
                  width='100%'
                  align='center'
                  justify='center'
                  flexDirection='column'>
                  {ready && (
                    <Box>
                      <Box py={1}>
                        <Text fontSize={3}>Connected to {peers} peer(s)</Text>
                      </Box>
                    </Box>
                  )}
                  {loadingFiles && (
                    <Box>
                      <Text fontSize={3}>Loading files...</Text>
                    </Box>
                  )}
                </Flex>
                <Box>
                  {files &&
                    files.map(file => {
                      return (
                        <File
                          download
                          progress={file.progress}
                          downloadFile={downloadFile}
                          blob={file.blob}
                          downloadSpeed={file.downloadSpeed}
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
      </Box>
    )
  }
}
