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
playlistCard.setAttribute("class", "card h-100 p-3 my-3 playlistCard has-background-white-ter")

var playlistCardHeader = document.createElement('h4')
var playlistCardImage = document.createElement('img')
playlistCardHeader.className = 'playlistCard-header'
playlistCardImage.className = 'playlistCard-image'

playlistCardImage.setAttribute(
  'style',
  'height: 350px, width: 300px'
);

document.getElementById('content-parent').appendChild(playListContainerEl)
playlistCard.appendChild(playlistCardHeader)
playlistCard.appendChild(playlistCardImage)


// skeletonCard is used for visual confirmation that a new playlist is being 
// added to playlistTimeline; after data is retrieved from API fetches element 
// tag attributes are replaced to replicate those of playlistCard
var skeletonCard = document.createElement('a')
skeletonCard.classList.add('skeleton-card-template')
var skeletonHeader = document.createElement('h4')
skeletonHeader.classList.add('skeleton-card', 'skeleton-card-text')
var skeletonImage = document.createElement('img')
skeletonImage.classList.add('skeleton-card', 'skeleton-card-img')

skeletonCard.appendChild(skeletonHeader)
skeletonCard.appendChild(skeletonImage)

// needs individual API keys in line below
var apiKey = 'PLACE API KEY HERE'

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
  if (e.target.id === 'fetch-button', textArea.value != ""){
    var skelClone = skeletonCard.cloneNode(true)
    playListContainerEl.prepend(skelClone)
    injectPlaylistContainer(textAreaInput)
  } 
})

//Decoupled the event listner for the log button from the input container so as to not be called when clicking anything else
button.addEventListener('click', async function(e){
  e.preventDefault()

  if (e.target.id === 'fetch-button', textArea.value === ""){
    console.log("You must input a journal entry to evaluate first before ");
    textArea.setAttribute('placeholder', "You must input a journal entry to evaluate before generating a playlist!")

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

  // the first appended child whenever a user clicks fetch-button within 
  // eventListener will be a skeleton card
  var loadedCard = playListContainerEl.firstChild
  
  // previous element attributes of loadedCard from when it assumed 
  // skeletonCard role are replaced to those of a playlistCard now
  loadedCard.className = "card h-100 p-3 my-3 playlistCard"

  var [playListCardHeader, playListCardImage] = loadedCard.childNodes
  playListCardHeader.className = 'playlistCard-header'
  playListCardHeader.innerText = playlistDatum.name
  playListCardImage.className = 'playlistCard-image'
  playListCardImage.setAttribute('src', playlistDatum.images.items[0].sources[0].url)
  loadedCard.setAttribute('href', playlistDatum.uri)

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

