'use strict'
const cheerio = require('cheerio')
const _ = require('lodash')
const Promise = require('bluebird')
const fetch = require('node-fetch')

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

const cleanText = (cheerioHtml) => {
    // cheerioHtml.find('br').replaceWith('\n')
    // cheerioHtml = groupReplaceWith(cheerioHtml, ['#video-musictory', 'img', 'h2', 'script', 'strong'], '')
    cheerioHtml = _.trim(cheerioHtml.html())
    // // cheerioHtml = cheerioHtml.replace(/\r\n\n/g, '\n')
    // // cheerioHtml = cheerioHtml.replace(/\t/g, '')
    // // cheerioHtml = cheerioHtml.replace(/\n\r\n/g, '\n')
    // // cheerioHtml = cheerioHtml.replace(/ +/g, ' ')
    // // cheerioHtml = cheerioHtml.replace(/\n /g, '\n')
    return cheerioHtml
}

function selectNews (html, selector) {
    if (html(selector).length === 0) {
        let error = new Error('No text was found')
        error.response = html
        return Promise.reject(error)
    }
    return cleanText(html(selector))
}

function newsObject (source, text) {
    return {
        news: text,
        provider: source.identifier,
        url: source.url
    }
}

function getNewsText (source) {
    let url = source.url
    let selector = source.selector

    return getHtml(url)
        .then((html) => selectNews(html, selector))
        .then(text => newsObject(source, text))
        .catch(function (err) {
            console.log("err in unable...: ", err)
            let error = new Error('Unable to get the lyrics with ' + source.identifier)
            error.response = err
            return Promise.reject(error)
        })
}

function getSources () {
    const threatPost = {
        identifier: 'threatpost.com',
        url: 'http://www.threatpost.com/',
        selector: '#latest_news_container'
    }

    return [threatPost]
}

function getNews () {
    const sources = getSources()
    return Promise.any(sources.map(source => getNewsText(source)))
    .catch(Promise.AggregateError, function (err) {
        console.log(err)
        return Promise.reject(err)
    })
}

module.exports = {
    getHtml,
    getNews
}