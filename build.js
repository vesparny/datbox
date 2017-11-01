const crypto = require('crypto')
const browserify = require('browserify')
const fs = require('fs')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const concat = require('concat-stream')

rimraf.sync('build')
mkdirp('build')

let bundlejs = ''
let bundlecss = ''

function bundleCss() {
  return concat({ encoding: 'buffer' }, buf => {
    bundlecss = 'bundle-' + createHash(buf) + '.css'
    fs.writeFileSync('build/' + bundlecss, buf.toString())
  })
}

function createHash(data) {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('base64')
    .slice(0, 20)
    .replace(/\+|\/|=/g, '')
}

function buildHtml() {
  const html = `
  <!doctype html>
  <html class="no-js" lang="">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <title></title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="/${bundlecss}">
    </head>
    <body>
        <script src="/${bundlejs}"></script>
    </body>
  </html>
`
  fs.writeFileSync('build/index.html', html)
}

browserify('index.js', { debug: false })
  .transform('babelify', { sourceMaps: false })
  .transform('sheetify')
  .plugin('css-extract', { out: bundleCss })
  .bundle((err, buf) => {
    bundlejs = 'bundle-' + createHash(buf) + '.js'
    fs.writeFileSync('build/' + bundlejs, buf.toString())
    buildHtml()
  })
