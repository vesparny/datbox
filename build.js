const crypto = require('crypto')
const browserify = require('browserify')
const fs = require('fs')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const minify = require('babel-minify')

rimraf.sync('build')
mkdirp('build')

let bundlejs = ''

function createHash (data) {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('base64')
    .slice(0, 20)
    .replace(/\+|\/|=/g, '')
}

function buildHtml () {
  const html = `
  <!doctype html>
  <html class="no-js" lang="">
    <head>
      <meta charset="utf-8">
      <meta http-equiv="x-ua-compatible" content="ie=edge">
      <title></title>
      <meta name="description" content="">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
      <div id="root"></div>
      <script src="/${bundlejs}.js"></script>
    </body>
  </html>
`
  fs.writeFileSync('build/index.html', html)
}

function buildRedirect () {
  fs.writeFileSync('build/_redirects', '/* /index.html 200')
}

browserify('index.js', { debug: false })
  .transform('babelify', { sourceMaps: false })
  .bundle((err, buf) => {
    if (err) return
    bundlejs = 'bundle-' + createHash(buf)
    const { code, map } = minify(buf.toString())
    fs.writeFileSync('build/' + bundlejs + '.js', code)
    fs.writeFileSync('build/' + bundlejs + '.js.map', map)
    buildHtml()
    buildRedirect()
  })
