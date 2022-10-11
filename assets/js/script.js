const userContainer = document.getElementById('users')
const button = document.getElementById('fetch-button')
const textArea = document.getElementById('textarea')
const contentContainer = document.getElementById('container')

var inputEl = document.getElementById('text-input');
var inputContainerEl = document.getElementById('input-container');
var submitButtonEl = document.getElementById('submit-button');
var newQuoteButtonEl = document.getElementById('grab-new-quote-button');
//added 
var playListContainerEl = document.createElement('div')
playListContainerEl.className = 'playlist-container'
var currentDay = moment().format('YYYY-MM-DD')
var quoteContainerEl = document.getElementById('quote-container')

var playlistCard = document.createElement('a')
playlistCard.setAttribute("class", "card h-100 p-3 my-3 playlistCard has-background-white-ter")

var playlistCardHeader = document.createElement('h4')
var playlistCardImage = document.createElement('img')
playlistCardHeader.className = 'playlistCard-header'
// playlistCardImage.setAttribute('height', '200px')
// playlistCardImage.setAttribute('width', '200px')
playlistCardImage.setAttribute(
  'style',
  'height: 350px, width: 300px'
);

document.getElementById('content-parent').appendChild(playListContainerEl)
playlistCard.appendChild(playlistCardHeader)
playlistCard.appendChild(playlistCardImage)

//added
inputContainerEl.addEventListener("click", function(event){

  let currentText = textArea.value
  if (event.target.id === 'fetch-button'){
  grabStrongestEmotion(currentText);
  }
  
  
  })

// needs individual API keys in line below
var apiKey = //insert key here

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

  if (e.target.id === 'submit-button') {
    var currentText = inputEl.value
    if (currentText.length > 0) {
      injectPlaylistContainer(currentText)   
    }
  }

  // if (e.target.id === 'grab-new-quote-button') {
  //   injectQuoteContainer()
  // }

  let textAreaInput = textArea.value
  if (e.target.id === 'fetch-button'){
      console.log(textAreaInput)
  grabStrongestEmotion(textAreaInput);
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
  console.log('emotionScores: ', emotionScores);
  let scores = Object.values(emotionScores);
  let maxScore = Math.max(...scores)
  console.log('maxScore: ', maxScore);
  let strongestEmotion = Object.keys(emotionScores).filter(key => emotionScores[key] === maxScore)
  console.log(strongestEmotion); 
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
      var playListCardElements = clone.childNodes
      playListCardElements[0].innerText = playlist[0]
      playListCardElements[1].setAttribute('src', playlist[1])
      clone.setAttribute('href', playlist[2])
      playListContainerEl.appendChild(clone)
    })
  }
})()

function grabPlaylists(emotion) {
  return fetch(`https://spotify23.p.rapidapi.com/search/?q=${emotion}&type=multi&offset=0&limit=20&numberOfTopResults=5`, options.SpotifyAPI)
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

  var clone = playlistCard.cloneNode(true)

  var playListCardElements = clone.childNodes
  playListCardElements[0].innerText = playlistDatum.name
  playListCardElements[1].setAttribute('src', playlistDatum.images.items[0].sources[0].url)
  clone.setAttribute('href', playlistDatum.uri)
  playListContainerEl.prepend(clone)

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

// function grabInspirationalQuote() {
//   return fetch('https://famous-quotes4.p.rapidapi.com/random?category=inspirational&count=10', options.Quotes)
// 	.then(response => response.json())
// 	.then(response => { return response })
// 	.catch(err => console.error(err));
// }

// (async function injectQuoteContainer() {
//   let quotes = await grabInspirationalQuote()
//   let index = Math.floor(Math.random() * quotes.length)
//   let currentQuote = quotes[index]
//   quoteContainerEl.innerText = `${currentQuote.text} - ${currentQuote.author}`

//   setTimeout(injectQuoteContainer, 30000);
// })()


