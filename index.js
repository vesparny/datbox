/** @jsx h */

const { h, render } = require('preact')
const Router = require('preact-router')
const css = require('sheetify')

const Upload = require('./src/upload')
const Download = require('./src/download')

const App = () => (
  <Router>
    <Upload path="/" />
    <Download path="/d/:id" />
  </Router>
)

css('tachyons')
css('./index.css')

render(<App />, document.body)
