const { Collection } = require('discord.js')
const path = require('path')
const fs = require('fs')

const logPos = 'module / typing'

// Data Storage
const typingData = new Collection()
const localeList = new Collection()
const session = new Collection()
let isLoading = false
let isLoaded = false

exports.isLoading = () => isLoading
exports.isLoaded = () => isLoaded

exports.getData = (locale, category) => {
  const localeData = typingData.get(locale)
  const categoryData = category != null ? localeData.get(category) : localeData.filter((c) => c.data.length > 0).random()
  const data = categoryData.data[Math.floor(Math.random() * categoryData.data.length)]
  if (!data.from && categoryData.fromDefault) data.from = categoryData.fromDefault

  data.category = categoryData
  return data
}

exports.startGame = (channelid, collector) => session.set(channelid, collector)
exports.isPlaying = (channelid) => session.has(channelid)
exports.getSession = (channelid) => session.get(channelid)
exports.endGame = (channelid) => session.delete(channelid)

exports.getBaseLocale = (locale) => localeList.get(locale)
exports.isLocaleExist = (locale) => localeList.has(locale)

exports.isCategoryExist = (baseLocale, category) => {
  const data = typingData.get(baseLocale)
  return data.has(category)
}

exports.clearAllData = () => {
  typingData.clear()
  localeList.clear()
}

exports.loadData = (basePath, logger) => {
  // TODO make it async
  isLoading = true

  logger.log(logPos, 'Start loading typing data...')

  if (!fs.existsSync(basePath)) return makeResultObj(false, 'noDataFolder')

  const locales = fs.readdirSync(basePath)
  if (locales.length < 1) return makeResultObj(false, 'noLocaleFolder')

  locales.forEach((locale) => {
    const loadPath = path.join(basePath, locale)
    logger.log(logPos, `Loading typing data for locale '${locale}'...`)
    logger.debug(logPos, 'load path: ' + loadPath)
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
      logger.debug(logPos, `register group '${group.id}'`)
      data.set(group.id, group)
      tempDataSortedByGroup[group.id] = []
    })
    manifest.locale.forEach((localeAlias) => {
      logger.debug(logPos, `register locale alias '${localeAlias}'`)
      localeList.set(localeAlias, locale)
    })

    // NOTE Load each data files
    manifest.files.forEach((file) => {
      logger.debug(logPos, `load data file '${file}'`)
      const textData = JSON.parse(fs.readFileSync(path.join(loadPath, file)).toString())
      textData.forEach((td) => {
        if (!data.has(td.group)) {
          logger.error(logPos, `Failed to load data which contains unregistered group: group '${td.group}' from data '${td.text}'`)
          return makeResultObj(false, 'dataContainsUnregisteredGroup')
        } else tempDataSortedByGroup[td.group].push(td)
      })
    })

    manifest.groups.forEach((group) => {
      logger.debug(logPos, `applying data file to group '${group.id}'`)
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

function makeResultObj (success, reason) {
  return { success, reason }
}
