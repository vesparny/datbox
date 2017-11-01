const { Component } = require('preact')
const fileReaderStream = require('filereader-stream')

module.exports = class File extends Component {
  state = {
    completed: false
  }

  componentDidMount() {
    const stream = this.props.archive.createWriteStream(this.props.file.name)
    fileReaderStream(this.props.file, { chunkSize: 256 * 1024 })
      .pipe(stream)
      .on('finish', () => {
        this.setState({ completed: true })
      })
  }

  render() {
    return this.props.render(this.state)
  }
}
