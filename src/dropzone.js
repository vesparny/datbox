const { Component } = require('preact')
const dragDrop = require('drag-drop')

module.exports = class Dropzone extends Component {
  state = {
    files: null,
    over: false
  }

  addFiles = files => {
    this.setState({
      files: null
    })
    setTimeout(() => {
      this.setState({
        files,
        over: false
      })
    }, 0)
  }
  openFileDialog = () => {
    const el = document.createElement('input')
    el.setAttribute('type', 'file')
    el.setAttribute('multiple', 'true')
    el.onchange = files => this.addFiles([...el.files])
    el.click()
  }

  componentDidMount () {
    this.dd = dragDrop(document.body, {
      onDrop: files => this.addFiles(files),
      onDragEnter: () => this.setState({ over: true }),
      onDragLeave: () => this.setState({ over: false })
    })
  }

  componentWillUnmount () {
    this.dd && this.dd()
  }

  render () {
    return this.props.render(this.state, this.openFileDialog)
  }
}
