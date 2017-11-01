/** @jsx h */

const { h, Component } = require('preact')
const copy = require('copy-text-to-clipboard')

const Dropzone = require('./dropzone')
const Archive = require('./archive')

module.exports = class Upload extends Component {
  copyLink = archiveKey => {
    copy(
      window.location.protocol +
        '//' +
        window.location.host +
        window.location.pathname +
        'd/' +
        archiveKey
    )
  }

  render () {
    return (
      <Dropzone
        render={({ files, over }, openFileDialog) => {
          return (
            <div
              class='tc h-100'
              style={{ border: over ? '10px red dashed' : 'inherit' }}>
              <div class='pa5'>
                drag files or{' '}
                <a href='javascript:void(0)' onClick={openFileDialog}>
                  click here
                </a>
              </div>

              {files && (
                <Archive
                  files={files}
                  render={({ files, ready, peers, archive }) => {
                    return (
                      <div>
                        {files.map(file => {
                          return (
                            <div>
                              {file.name}
                              {!file.completed && ' ...uploading'}
                            </div>
                          )
                        })}
                        {ready && (
                          <div>
                            connected to {peers} peers(s)
                            <div>
                              <button
                                onClick={() =>
                                  this.copyLink(archive.key.toString('hex'))}>
                                click here to copy the link to share
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  }}
                />
              )}
            </div>
          )
        }}
      />
    )
  }
}
