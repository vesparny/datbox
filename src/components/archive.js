const React = require('react')
const hyperdrive = require('hyperdrive')
const ram = require('random-access-memory')
const fileReaderStream = require('filereader-stream')
const choppa = require('choppa')
const webrtc = require('webrtc-swarm')
const signalhub = require('signalhub')
const pump = require('pump')
const DEFAULT_SIGNALHUBS = ['https://signalhub.mafintosh.com'] // content will be stored in this folder
const concat = require('concat-stream') // content will be stored in this folder
const speedometer = require('speedometer')
const pb = require('prettier-bytes')
const speed = speedometer()

module.exports = class Archive extends React.Component {
  state = {
    files: this.props.files.map(file => ({
      name: file.name,
      size: file.size,
      ready: false
    })),
    peers: 0,
    ready: false,
    waiting: true
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.files !== this.props.files) {
      this.loadNewFiles(nextProps.files)
    }
  }

  loadNewFiles (files) {
    this.archive = hyperdrive(ram)
    this.archive.on('ready', () => {
      let i = 0
      const loop = () => {
        if (i === files.length) return this.share()
        let file = files[i]
        const fileList = i === 0 ? [] : this.state.files

        const stream = this.archive.createWriteStream(file.name)
        fileReaderStream(file, { chunkSize: 5 * 1024 * 1024 })
          .pipe(choppa(64 * 1024))
          .pipe(stream)
          .on('finish', () => {
            this.setState({
              files: [
                ...fileList,
                ...[
                  {
                    ...{ name: file.name, size: file.size },
                    ...{ ready: true }
                  }
                ]
              ]
            })
            i++
            loop()
          })
      }
      loop()
    })
  }

  share () {
    this.setState(prevState => ({
      ready: true
    }))

    const swarm = webrtc(
      signalhub(
        'datbox-' + this.archive.discoveryKey.toString('hex'),
        DEFAULT_SIGNALHUBS
      )
    )
    swarm.on('peer', conn => {
      this.setState(prevState => ({
        peers: prevState.peers + 1,
        ready: true,
        waiting: false
      }))
      const peer = this.archive.replicate({
        upload: true,
        download: true
      })

      pump(conn, peer, conn, () => {
        this.setState(prevState => ({
          peers: prevState.peers - 1
        }))
      })
    })
  }

  downloadFile = file => {
    this.archive.stat(file.name, (err, stat) => {
      if (err) return
      let bytes = []
      const str = this.archive.createReadStream('/' + file.name)
      str.pipe(
        concat(raw => {
          this.setState(prevState => {
            return {
              files: prevState.files.map((f, i) => {
                if (file.name === f.name) {
                  return {
                    ...f,
                    ...{
                      blob: new window.File([raw], file.name)
                    }
                  }
                }
                return f
              })
            }
          })
        })
      )
      str.on('data', d => {
        bytes = bytes.concat(d)
        this.setState(prevState => {
          return {
            files: prevState.files.map((f, i) => {
              if (file.name === f.name) {
                return {
                  ...f,
                  ...{
                    downloadSpeed: pb(speed(d.length)) + '/s',
                    progress: (f.progress || 0) + d.length,
                    size: stat.size
                  }
                }
              }
              return f
            })
          }
        })
      })
    })
  }

  loadFilesFromExistingArchive () {
    this.archive = hyperdrive(ram, this.props.id)
    this.archive.on('ready', () => {
      this.share()
      this.archive.on('content', () => {
        this.archive.readdir('/', (err, files) => {
          if (err) return
          this.setState({
            files: files.map(file => ({
              name: file,
              progress: 0,
              size: 0
            }))
          })
        })
      })
    })
  }

  componentDidMount () {
    if (this.props.id) {
      this.loadFilesFromExistingArchive()
    } else {
      this.loadNewFiles(this.props.files)
    }
  }
  render () {
    return this.props.render({
      ...this.state,
      ...{ archive: this.archive },
      downloadFile: this.downloadFile
    })
  }
}
