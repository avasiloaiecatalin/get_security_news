'use strict'
const cheerio = require('cheerio')
const _ = require('lodash')
const Promise = require('bluebird')
const fetch = require('node-fetch')

const trimText = (cHTML) => {
    cHTML = _.trim(cHTML.text())
    return cHTML
}

function checkStatus (response) {
    if (response.status !== 200 || !response.ok) {
        let error = new Error(response.statusText)
        error.response = response
        return Promise.reject(error)
    }
    return Promise.resolve(response)
}

function getHtml (url) {
    return fetch(url)
        .then(response => checkStatus(response))
        .then(response => response.text())
        .then(html => cheerio.load(html))
}

module.exports = {
    getHtml,
    trimText
}