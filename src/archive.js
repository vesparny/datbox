const { Component } = require('preact')
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

module.exports = class File extends Component {
  state = {
    files:
      this.props.files &&
      this.props.files.map(f => ({
        name: f.name
      })),
    peers: 0,
    ready: false,
    tooLong: false,
    waiting: true
  }

  share () {
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
        waiting: false,
        tooLong: false
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
    swarm.on('close', () => {
      console.log('close')
    })
    this.setState(prevState => ({
      ready: true
    }))
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

  componentDidMount () {
    if (this.props.id) {
      setTimeout(() => {
        if (this.state.waiting) {
          this.setState({ tooLong: true })
        }
      }, 5000)
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
    } else {
      this.archive = hyperdrive(ram)
      this.archive.on('ready', () => {
        let i = 0
        const loop = () => {
          if (i === this.props.files.length) return this.share()
          let file = this.props.files[i]
          const stream = this.archive.createWriteStream(file.name)
          fileReaderStream(file, { chunkSize: 5 * 1024 * 1024 })
            .pipe(choppa(64 * 1024))
            .pipe(stream)
            .on('finish', () => {
              this.setState(prevState => {
                return {
                  files: prevState.files.map((file, index) => {
                    if (i !== index) return file
                    return { ...file, ...{ completed: true } }
                  })
                }
              })
              i++
              loop()
            })
        }
        loop()
      })
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
