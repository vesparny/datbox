const React = require('react')
const ReactDOM = require('react-dom')
const { BrowserRouter, Route } = require('react-router-dom')
const { injectGlobal, css, keyframes } = require('emotion') // eslint-disable-line
const { rgba, normalize } = require('polished')
const { fadeInDown, fadeOutUp } = require('react-animations')

const { colors, sizes } = require('./src/config')
const Upload = require('./src/screens/upload')
const Download = require('./src/screens/download')
const { Box, H1, Flex, Text, A, Link } = require('./src/components/ui')

injectGlobal`
${normalize()}
* {
  box-sizing: border-box;
}

body {
  font-family: -apple-system,BlinkMacSystemFont,sans-serif;
  background-color: ${colors.white}
}

#container {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}
main {
  flex: 1;
}

`

class App extends React.Component {
  state = {
    notification: '',
    animationReady: false
  }

  handleNotification = notification => {
    this.setState({
      notification,
      animationReady: true
    })
    setTimeout(() => {
      this.setState({
        notification: ''
      })
    }, 3000)
  }

  render () {
    const { animationReady, notification } = this.state
    return (
      <BrowserRouter>
        <div id='container'>
          {animationReady && (
            <Box
              css={{
                opacity: this.state.notification ? 1 : 0,
                animation: `.4s ${keyframes(
                  notification ? fadeInDown : fadeOutUp
                )}`,
                background: colors.green,
                textAlign: 'center',
                position: 'fixed',
                height: 40,
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
              }}>
              <Flex
                align='center'
                justify='center'
                css={{
                  height: 40
                }}>
                <Text color={colors.white}>{this.state.notification}</Text>
              </Flex>
            </Box>
          )}
          <header
            css={{
              boxShadow: `0px 9px 10px -12px ${rgba(colors.red, 1)}`
            }}>
            <Box px={2} bg={colors.washedYellow}>
              <H1 fontSize={5}>
                <Link fontSize={5} to='/'>
                  datbox
                </Link>
              </H1>
            </Box>
          </header>
          <main>
            <Box
              css={{
                margin: '0 auto',
                maxWidth: sizes.maxWidth
              }}>
              <Route
                exact
                path='/'
                render={props => (
                  <Upload onNotification={this.handleNotification} {...props} />
                )}
              />
              <Route
                path='/d/:id'
                render={props => (
                  <Download
                    onNotification={this.handleNotification}
                    {...props}
                  />
                )}
              />
            </Box>
          </main>

          <footer
            css={{
              boxShadow: `0px 9px 10px 5px ${rgba(colors.red, 1)}`
            }}>
            <Flex align='center' justify='center'>
              <Box p={2}>
                <A href='https://github.com/vesparny/datbox'>GitHub</A>
              </Box>
            </Flex>
          </footer>
        </div>
      </BrowserRouter>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
