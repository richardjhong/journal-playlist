const userContainer = document.getElementById('users')
const button = document.getElementById('fetch-button')
const textArea = document.getElementById('textarea')
const contentContainer = document.getElementById('container')

var inputEl = document.getElementById('text-input');
var inputContainerEl = document.getElementById('input-container');
var newQuoteButtonEl = document.getElementById('grab-new-quote-button');
var playListContainerEl = document.createElement('div')
playListContainerEl.className = 'playlist-container'
var currentDay = moment().format('YYYY-MM-DD')
var quoteContainerEl = document.getElementById('quote-container')

var playlistCard = document.createElement('a')
playlistCard.setAttribute("class", "card h-100 p-3 my-3 playlistCard")

var playlistCardHeader = document.createElement('h4')
var playlistCardImage = document.createElement('img')
playlistCardHeader.className = 'playlistCard-header'
playlistCardImage.setAttribute('height', '200px')
playlistCardImage.setAttribute('width', '200px')

document.getElementById('content-parent').appendChild(playListContainerEl)
playlistCard.appendChild(playlistCardHeader)
playlistCard.appendChild(playlistCardImage)

var skeletonCard = document.createElement('a')
skeletonCard.classList.add('sample-card')
var skeletonHeader = document.createElement('h4')
skeletonHeader.classList.add('skeleton-card', 'skeleton-card-text')
var skeletonImage = document.createElement('img')
skeletonImage.classList.add('sample-img', 'skeleton-card')

skeletonCard.appendChild(skeletonHeader)
skeletonCard.appendChild(skeletonImage)

console.log('skeletonCard: ', skeletonCard)

// needs individual API keys in line below
var apiKey = '5c547f3788msh007f4139bb62e23p1dce91jsnd655fb0d4e13'

const options = {
  SpotifyAPI: {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'spotify23.p.rapidapi.com'
    }
  },
  Quotes: {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'famous-quotes4.p.rapidapi.com'
    }
  },
  EmotionalAPI: {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'twinword-emotion-analysis-v1.p.rapidapi.com'
    }
  }
};

inputContainerEl.addEventListener('click', async function(e) {
  e.preventDefault()

  if (e.target.id === 'grab-new-quote-button') {
    injectQuoteContainer()
  }

  let textAreaInput = textArea.value
  if (e.target.id === 'fetch-button'){
    var skelClone = skeletonCard.cloneNode(true)

    playListContainerEl.prepend(skelClone)
    injectPlaylistContainer(textAreaInput)
  }
})

// API
function grabEmotions(textInput) {
  return fetch('https://twinword-emotion-analysis-v1.p.rapidapi.com/analyze/?text=' + textInput, options.EmotionalAPI)
    .then(response => response.json())
    .then(response => {return response.emotion_scores})
    .catch(err => console.error(err));
}

async function grabStrongestEmotion(textInput) {
  let emotionScores = await grabEmotions(textInput);
  let scores = Object.values(emotionScores);
  let maxScore = Math.max(...scores)
  let strongestEmotion = Object.keys(emotionScores).filter(key => emotionScores[key] === maxScore)
  return strongestEmotion[0]
}

function clearPlaylistContainerContent () {
  while (playListContainerEl.firstChild) {  
    playListContainerEl.removeChild(playListContainerEl.firstChild)
  }
}

// checks if any playlists are already saved in localStorage within the same 
// date and populates the playlist container if so
(function populatePreexistingPlaylistContainer () {
  if (JSON.parse(localStorage.getItem("playlistTimeline")) && Object.keys(JSON.parse(localStorage.getItem("playlistTimeline"))).includes(currentDay)) {
  let pastPlaylistTimeline = JSON.parse(localStorage.getItem("playlistTimeline"))[currentDay]

    pastPlaylistTimeline.forEach(playlist => {
      var clone = playlistCard.cloneNode(true)
      var [playListCardHeader, playListCardImage] = clone.childNodes
      playListCardHeader.innerText = playlist[0]
      playListCardImage.setAttribute('src', playlist[1])
      clone.setAttribute('href', playlist[2])
      playListContainerEl.appendChild(clone)
    })
  }
})()

async function grabPlaylists(emotion) {
  let emotionQuery = await grabStrongestEmotion(emotion)
  return fetch(`https://spotify23.p.rapidapi.com/search/?q=${emotionQuery}&type=multi&offset=0&limit=20&numberOfTopResults=5`, options.SpotifyAPI)
    .then(response => response.json())
    .then(response => {
      return response.playlists 
    })
    .catch(err => console.error(err));
}

// using async, await to wait for results from api call and then store into the playlists variable
async function injectPlaylistContainer(emotion) {
  var playlists;
  playlists = await grabPlaylists(emotion)

  // playlists fetches 20 results; playlistDatum will grab a random playlist 
  // within that selection. While there is a chance of duplicate playlist 
  // entries, playlistDatum as it is setup should mitigate that possibility
  let index = Math.floor(Math.random() * playlists.items.length)
  var playlistDatum = playlists.items[index].data

  var loadingCard = playListContainerEl.firstChild
  // loadingCard.classList.add('card', 'h-100', 'p-3', 'my-3', 'playlistCard')
  loadingCard.className = "card h-100 p-3 my-3 playlistCard"
  // loadingCard.childNodes = 
  console.log('loadingCard: ', loadingCard)
  // var clone = playlistCard.cloneNode(true)

  var [playListCardHeader, playListCardImage] = loadingCard.childNodes
  playListCardHeader.className = 'playlistCard-header'
  playListCardHeader.innerText = playlistDatum.name
  playListCardImage.classList.remove('sample-img', 'skeleton-card')
  playListCardImage.setAttribute('src', playlistDatum.images.items[0].sources[0].url, 'height', '200px', 'width', '200px')

  .setAttribute(
    'style',
    'height: 350px, width: 300px'
  
  // clone.setAttribute('href', playlistDatum.uri)

  var playlistTimeline = JSON.parse(localStorage.getItem("playlistTimeline")) || {}

  // if playlistTimeline[currentDay] already exists, then the current entry is 
  // considered the newest and pushed to the beginning of the playlist; 
  // otherwise this current entry is considered the first playlist entry of the 
  // day and has data set for a 2d/nested array.
  if (playlistTimeline[currentDay]) {
    playlistTimeline[currentDay].unshift([playlistDatum.name, playlistDatum.images.items[0].sources[0].url, playlistDatum.uri])
  } else {
    playlistTimeline[currentDay] = [[playlistDatum.name, playlistDatum.images.items[0].sources[0].url, playlistDatum.uri]]
  }
  
  localStorage.setItem("playlistTimeline", JSON.stringify(playlistTimeline))
}

function grabInspirationalQuote() {
  return fetch('https://famous-quotes4.p.rapidapi.com/random?category=inspirational&count=10', options.Quotes)
	.then(response => response.json())
	.then(response => { return response })
	.catch(err => console.error(err));
}

// grabInspirationQuote within injectQuoteContainer gives array of quotes, 
// injectNewQuote randomizes one of those quotes to display and then removes 
// from the selection pool. This repeats every 30 seconds until there are no 
// quotes left. the setTimeout within injectQuoteContainer meanwhile repeats 
// the process from the beginning every 5 minutes i.e. after all 10 of the 
// previous quotes have been displayed.
function injectNewQuote(quotes) {
  let index = Math.floor(Math.random() * quotes.length)
  let currentQuote = quotes[index]
  quoteContainerEl.innerText = `${currentQuote.text} - ${currentQuote.author}`

  quotes.splice(index , 1)

  if (quotes.length < 1) {
    return
  }

  setTimeout(() => {
    injectNewQuote(quotes)
  }, 30000)
}

async function injectQuoteContainer() {
  let quotes = await grabInspirationalQuote()
  
  injectNewQuote(quotes)

  setTimeout(injectQuoteContainer, 300000);
}