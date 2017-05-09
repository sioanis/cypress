import {linuxBrowser} from './linux'
import darwin from './darwin'
import debug from 'debug'

import _ = require('lodash')
import os = require('os')
import Promise = require('bluebird')

const log = debug('cypress:launcher')

type Browser = {
  name: string,
  re: RegExp,
  profile: boolean,
  binary: string,
  executable: string
}

const browsers:Browser[] = [
  {
    name: 'chrome',
    re: /Google Chrome (\S+)/,
    profile: true,
    binary: 'google-chrome',
    executable: 'Contents/MacOS/Google Chrome'
  },{
    name: 'chromium',
    re: /Chromium (\S+)/,
    profile: true,
    binary: 'chromium-browser',
    executable: 'Contents/MacOS/Chromium'
  },{
    name: 'canary',
    re: /Google Chrome Canary (\S+)/,
    profile: true,
    binary: 'google-chrome-canary',
    executable: 'Contents/MacOS/Google Chrome Canary'
  }
]

const setMajorVersion = (obj) => {
  obj.majorVersion = obj.version.split('.')[0]
  return obj
}

function lookup (platform, obj) {
  log('looking up %s on %s platform', obj.name, platform)
  switch (platform) {
    case 'darwin':
      const fn = darwin[obj.name]
      if (fn) {
        return fn.get(obj.executable)
      }
      const err: NotInstalledError =
        new Error(`Browser not installed: ${obj.name}`) as NotInstalledError
      err.notInstalled = true
      return Promise.reject(err)
    case 'linux':
      return linuxBrowser.get(obj.binary, obj.re)
    // TODO handle default case?
  }
}

function checkOneBrowser(browser:Browser) {
  const platform = os.platform()
  return lookup(platform, browser)
    .then(props => {
      return _.chain({})
        .extend(browser, props)
        .pick('name', 'type', 'version', 'path')
        .value()
    })
    .then(setMajorVersion)
    .catch(err => {
      if (err.notInstalled) {
        return false
      }
      throw err
    })
}

module.exports = () => {
  return Promise.map(browsers, checkOneBrowser)
    .then(_.compact)
}
