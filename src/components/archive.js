const React = require('react')
const hyperdrive = require('hyperdrive')
const ram = require('random-access-memory')
const fileReaderStream = require('filereader-stream')
const choppa = require('choppa')
const webrtc = require('webrtc-swarm')
const signalhub = require('signalhub')
const pump = require('pump')
const concat = require('concat-stream')
const speedometer = require('speedometer')
const pb = require('prettier-bytes')
const speed = speedometer()

const DEFAULT_SIGNALHUBS = [
  'https://signalhub.mafintosh.com',
  'https://signalhub-jccqtwhdwc.now.sh',
  'https://signalhub-hzbibrznqa.now.sh'
]

module.exports = class Archive extends React.Component {
  state = {
    files: [],
    peers: 0,
    loadingFiles: true,
    ready: false
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.files !== this.props.files) {
      this.loadNewFiles(nextProps.files)
    }
  }

  loadNewFiles (files) {
    this.archive = hyperdrive(ram)
    this.setState({
      files: files.map(file => ({
        name: file.name,
        size: file.size,
        ready: false
      })),
      ready: false
    })
    this.archive.on('ready', () => {
      let i = 0
      const loop = () => {
        if (i === files.length) return this.share()
        let file = files[i]
        const stream = this.archive.createWriteStream(file.name)
        fileReaderStream(file, { chunkSize: 5 * 1024 * 1024 })
          .pipe(choppa(64 * 1024))
          .pipe(stream)
          .on('finish', () => {
            this.setState(prevState => ({
              files: prevState.files.map(f => {
                if (f.name === file.name) {
                  return { name: f.name, size: f.size, ready: true }
                }
                return {
                  ...{ name: f.name, size: f.size },
                  ...{ ready: !!f.ready }
                }
              })
            }))
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
        ready: true
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

  downloadFile = fileName => {
    this.archive.stat(fileName, (err, stat) => {
      if (err) {
        console.log(err)
        return
      }
      let bytes = []
      const str = this.archive.createReadStream(fileName)
      str.pipe(
        concat(raw => {
          this.setState(prevState => {
            return {
              files: prevState.files.map((f, i) => {
                if (fileName === f.name) {
                  return {
                    ...f,
                    ...{
                      blob: new window.File([raw], fileName)
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
        console.log('d')
        bytes = bytes.concat(d)
        this.setState(prevState => {
          return {
            files: prevState.files.map((f, i) => {
              if (fileName === f.name) {
                return {
                  ...f,
                  ...{
                    downloadSpeed: pb(speed(d.length)) + '/s',
                    progress: (f.progress || 0) + d.length
                  }
                }
              }
              return f
            })
          }
        })
      })
      str.on('errror', err => {
        console.log(err)
      })
    })
  }

  loadFilesFromExistingArchive (id) {
    this.archive = hyperdrive(ram, id)
    this.archive.on('ready', () => {
      this.share()
      this.archive.on('content', () => {
        this.archive.readdir('/', (err, files) => {
          if (err) {
            console.log(err)
            return
          }
          files.forEach(fileName => {
            this.archive.stat(fileName, (err, stat) => {
              if (err) {
                console.log(err)
                return
              }
              this.setState(prevState => ({
                files: prevState.files.map(f => {
                  if (f.name === fileName) {
                    return { ...f, ...{ size: stat.size } }
                  }
                  return { name: f.name, size: stat.size, progress: 0 }
                })
              }))
            })
          })

          this.setState({
            files: files.map(file => ({
              name: file,
              progress: 0,
              size: 0
            })),
            loadingFiles: false
          })
        })
      })
    })
  }

  componentDidMount () {
    if (this.props.id) {
      this.loadFilesFromExistingArchive(this.props.id)
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
