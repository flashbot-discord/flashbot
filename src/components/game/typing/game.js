const { Collection } = require('discord.js')
const path = require('path')
const fs = require('fs')

const logger = require('../../../shared/logger')('components:typing')

// Data Storage
const typingData = new Collection()
const localeList = new Collection()
const session = new Collection()
let isLoading = false
let isLoaded = false

let isReady = false

function init (client) {
  if (isReady) return

  client.db.internal.register('typing', {
    typingData,
    localeList,
    session
  })
  isReady = true
}

function getData (baseLocale, category) {
  const localeData = typingData.get(baseLocale)
  const categoryData = category != null ? localeData.get(category) : localeData.filter((c) => c.data.length > 0).random()
  if (categoryData.data.length < 1) return null

  const data = categoryData.data[Math.floor(Math.random() * categoryData.data.length)]
  if (!data.from) data.from = null

  data.category = categoryData
  return data
}

const startGame = (channelid, collector) => session.set(channelid, collector)
const isPlaying = (channelid) => session.has(channelid)
const getSession = (channelid) => session.get(channelid)
const endGame = (channelid) => session.delete(channelid)

const getBaseLocale = (locale) => localeList.get(locale)
const isLocaleExist = (locale) => localeList.has(locale)

function isCategoryExist (baseLocale, category) {
  const data = typingData.get(baseLocale)
  return data.has(category)
}
/*
exports.getCategory = (baseLocale, category) => {
  const localeData = typingData.get(baseLocale)
  const categoryData = localeData.get(category)
  return categoryData
}
*/

function clearAllData () {
  typingData.clear()
  localeList.clear()
}

function loadData (basePath) {
  const loggerFn = logger.extend('loadData')

  // TODO make it async
  isLoading = true

  loggerFn.log('Start loading typing data...')

  if (!fs.existsSync(basePath)) return makeResultObj(false, 'noDataFolder')

  const locales = fs.readdirSync(basePath)
  if (locales.length < 1) return makeResultObj(false, 'noLocaleFolder')

  locales.forEach((locale) => {
    const loadPath = path.join(basePath, locale)
    loggerFn.verbose(`Loading typing data for locale '${locale}'`)
    loggerFn.debug('load path: ' + loadPath)
    if (
      !(fs.lstatSync(loadPath).isDirectory()) ||
        !fs.existsSync(path.join(loadPath, 'manifest.json')) ||
        !(fs.lstatSync(path.join(loadPath, 'manifest.json')).isFile())
    ) return

    // NOTE Load the manifest
    const manifest = JSON.parse(fs.readFileSync(path.join(loadPath, 'manifest.json')).toString())
    const data = new Collection()
    const tempDataSortedByGroup = {}
    manifest.groups.forEach((group) => {
      loggerFn.verbose(`registering group '${group.id}'`)
      data.set(group.id, group)
      tempDataSortedByGroup[group.id] = []
    })
    manifest.locale.forEach((localeAlias) => {
      loggerFn.verbose(`registering locale alias '${localeAlias}'`)
      localeList.set(localeAlias, locale)
    })

    // NOTE Load each data files
    manifest.files.forEach((file) => {
      loggerFn.verbose(`loading data file '${file}'`)
      const textData = JSON.parse(fs.readFileSync(path.join(loadPath, file)).toString())
      textData.forEach((td) => {
        if (!data.has(td.group)) {
          loggerFn.error(`Failed to load data which contains unregistered group: group '${td.group}' from data '${td.text}'`)
          // FIXME return makeResultObj(false, 'dataContainsUnregisteredGroup')
        } else tempDataSortedByGroup[td.group].push(td)
      })
    })

    manifest.groups.forEach((group) => {
      loggerFn.verbose(`applying data file to group '${group.id}'`)
      const tempData = data.get(group.id)
      tempData.data = tempDataSortedByGroup[group.id]
      data.set(group.id, tempData)
    })

    typingData.set(locale, data)
  })

  isLoaded = true
  isLoading = false
  return makeResultObj(true)
}

/**
 * @private
 */
function makeResultObj (success, reason) {
  return { success, reason }
}

module.exports = {
  init,
  isReady: () => isReady,

  isLoading: () => isLoading,
  isLoaded: () => isLoaded,
  getData,

  startGame,
  isPlaying,
  getSession,
  endGame,

  getBaseLocale,
  isLocaleExist,

  isCategoryExist,

  clearAllData,
  loadData
}
