const userContainer = document.getElementById('users')
const button = document.getElementById('fetch-button')
const textArea = document.getElementById('textarea')
const contentContainer = document.getElementById('container')
const ctx = document.getElementById('myChart');

var inputEl = document.getElementById('text-input');
var inputContainerEl = document.getElementById('input-container');
var newQuoteButtonEl = document.getElementById('grab-new-quote-button');
var playListContainerEl = document.createElement('div')
playListContainerEl.className = 'playlist-container'
var currentDay = moment().format('YYYY-MM-DD')
var quoteContainerEl = document.getElementById('quote-container')
var quoteParagraph = document.getElementById('quote-paragraph')


var playlistCard = document.createElement('a')
playlistCard.setAttribute("class", "card h-100 p-3 my-3 playlistCard has-background-white-ter")

var playlistCardHeader = document.createElement('h4')
var playlistCardImage = document.createElement('img')
playlistCardHeader.className = 'playlistCard-header'
playlistCardImage.className = 'playlistCard-image'

playlistCardImage.setAttribute(
  'style',
  'height: 350px; width: 300px'
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
var apiKey = 'INSERT API KEY HERE'

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

quoteContainerEl.addEventListener('click', function(e) {
  e.preventDefault()

  if (e.target.id === 'grab-new-quote-button') {
    console.log('new quote button clicked')
    injectQuoteContainer()
  }
})

inputContainerEl.addEventListener('click', function(e) {
  e.preventDefault()
  
  
  let textAreaInput = textArea.value
  if (e.target.id === 'fetch-button' && textArea.value.length > 0){
    var skelClone = skeletonCard.cloneNode(true)
    playListContainerEl.prepend(skelClone)
    injectPlaylistContainer(textAreaInput)
  } else if (e.target.id === 'fetch-button' && textArea.value.length === 0) {
    console.log('need more text')
    showSnackBarNotification()
  }
})

if (localStorage.getItem("emotionCollection")) {
  updateChart()
  document.getElementById('chart-modal-button').style.display = "block"
}

function showSnackBarNotification() {
  var snackBar = document.getElementById("snackbar");
  snackBar.className = "show";

  setTimeout(function(){ snackBar.className = snackBar.className.replace("show", ""); }, 3000);
}


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
  var emotionCollection = JSON.parse(localStorage.getItem("emotionCollection")) || {}

  if (Object.keys(emotionCollection).length === 0 || emotionCollection[currentDay] === undefined) {
    emotionCollection[currentDay] = {}
  } 
  if (emotionCollection[currentDay][strongestEmotion[0].toUpperCase()]) {
    emotionCollection[currentDay][strongestEmotion[0].toUpperCase()]++ 
  } else {
    emotionCollection[currentDay][strongestEmotion[0].toUpperCase()] = 1
  }
  localStorage.setItem("emotionCollection", JSON.stringify(emotionCollection))

  updateChart()

  // Bulma modal boilerplate code adds evenListeners based on 
  // 'DOMContentLoaded'. To not disturb its behavior, chart-modal-button
  // initially starts with display: none. This evaluation checks if 
  // the button is still hidden and makes it visible 
  
  var style = window.getComputedStyle(document.getElementById('chart-modal-button'))

  if (style.display === 'none') {
    document.getElementById('chart-modal-button').style.display = "block"
  }


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
  quoteParagraph.innerText = `${currentQuote.text} - ${currentQuote.author}`

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

// boilerplate code associated with Bulma modal, function addData and onwards 
// are created to handle creation of chart and updating chart
document.addEventListener('DOMContentLoaded', () => {
  // Functions to open and close a modal
  function openModal($el) {
    $el.classList.add('is-active');
  }

  function closeModal($el) {
    $el.classList.remove('is-active');
  }

  function closeAllModals() {
    (document.querySelectorAll('.modal') || []).forEach(($modal) => {
      closeModal($modal);
    });
  }

  // Add a click event on buttons to open a specific modal
  (document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger) => {
    const modal = $trigger.dataset.target;
    const $target = document.getElementById(modal);

    $trigger.addEventListener('click', () => {
      openModal($target);
    });
  });

  // Add a click event on various child elements to close the parent modal
  (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
    const $target = $close.closest('.modal');

    $close.addEventListener('click', () => {
      closeModal($target);
    });
  });

  // Add a keyboard event to close all modals
  document.addEventListener('keydown', (event) => {
    const e = event || window.event;

    if (e.key === 27) { // Escape key
      closeAllModals();
    }
  });
});

function removeData(chart) {
  while (chart.config.data.datasets[0].data.length > 0) {
    chart.config.data.datasets[0].data.pop()
  }
  chart.update();
}

function addData(chart, emotionCollection) {
  chart.data.datasets[0].data.push(emotionCollection['JOY'] || 0)
  chart.data.datasets[0].data.push(emotionCollection['ANGER'] || 0)
  chart.data.datasets[0].data.push(emotionCollection['SADNESS'] || 0)
  chart.data.datasets[0].data.push(emotionCollection['DISGUST'] || 0)
  chart.data.datasets[0].data.push(emotionCollection['FEAR'] || 0)
  chart.data.datasets[0].data.push(emotionCollection['SURPRISE'] || 0)
  chart.update();
}

function updateChart() {
  var emotionCollection = JSON.parse(localStorage.getItem("emotionCollection"))[currentDay]
  let existingChart = Chart.getChart(ctx)
  
  // checks if there is an existingChart within the canvas of ctx
  // if not then a chart is created and attached to canvas ctx which 
  // is nested in the modal in index.html
  // if existingChart exists then chart data is removed and then added with new 
  // dataset based on removeData and addData functions
  if (existingChart === undefined) {
    new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: [
            'JOY',
            'ANGER',
            'SADNESS',
            'DISGUST',
            'FEAR',
            'SURPRISE'
          ],
          datasets: [{
            label: 'Emotions Score Tally',
            data: [
              emotionCollection['JOY'] || 0,
              emotionCollection['ANGER'] || 0,
              emotionCollection['SADNESS'] || 0,
              emotionCollection['DISGUST'] || 0,
              emotionCollection['FEAR'] || 0,
              emotionCollection['SURPRISE'] || 0,
            ],
            backgroundColor: [
              'rgb(0,128,0)',
              'rgb(255,0,0)',
              'rgb(17,29,255)',
              'rgb(128,1,128)',
              'rgb(254,253,1)',
              'rgb(255,165,2)'
            ],
            hoverOffset: 4
          }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        },
    }); 
  } 
  else {
    removeData(existingChart)
    addData(existingChart, emotionCollection)
  }
}
