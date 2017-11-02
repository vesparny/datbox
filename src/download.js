/** @jsx h */

const { h, Component } = require('preact')
const fileSaver = require('file-saver')
const Archive = require('./archive')

module.exports = class Downlaod extends Component {
  render () {
    return (
      <Archive
        id={this.props.id}
        render={({
          files,
          ready,
          peers,
          archive,
          tooLong,
          waiting,
          downloadFile
        }) => {
          return (
            <div class='tc'>
              {files &&
                files.map(file => {
                  const downloadProgress = file.size
                    ? (file.progress * 100 / file.size).toFixed(0)
                    : 0
                  return (
                    <div>
                      {file.name}
                      <button onClick={() => downloadFile(file)}>
                        download {file.downloadSpeed} {downloadProgress + '%'}
                      </button>
                      {file.blob && (
                        <button
                          onClick={() => {
                            fileSaver.saveAs(file.blob)
                          }}>
                          downlaod ok
                        </button>
                      )}
                    </div>
                  )
                })}
              {ready && !waiting && <div>connected to {peers} peers(s)</div>}
              {tooLong && (
                <div>
                  this is taking too long
                  <br />
                  make sure you do not have other tabs opened and pointing to
                  this URL
                  <br />
                  Try to reload the page
                </div>
              )}
              {waiting && <div>Connecting...</div>}
            </div>
          )
        }}
      />
    )
  }
}
