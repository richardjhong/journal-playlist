var inputEl = document.getElementById('text-input');
var inputContainerEl = document.getElementById('input-container');
var submitButtonEl = document.getElementById('submit-button');
var playListContainerEl = document.createElement('div')
playListContainerEl.className = 'playlist-container'

// document.getElementById('content-parent').appendChild(playListContainerEl)


const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': '0ab9cf3e17msh3dbe219cb411cedp18ddd9jsna2cb53035932',
		'X-RapidAPI-Host': 'spotify23.p.rapidapi.com'
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
})

function clearPlaylistContainerContent () {
  while (playListContainerEl.firstChild) {  
    playListContainerEl.removeChild(playListContainerEl.firstChild)
  }
}

function grabPlaylists(emotion) {
  return fetch(`https://spotify23.p.rapidapi.com/search/?q=${emotion}&type=multi&offset=0&limit=10&numberOfTopResults=5`, options)
    .then(response => response.json())
    .then(response => {
      return response.playlists
    })
    .catch(err => console.error(err));
}

async function injectPlaylistContainer(emotion) {
  clearPlaylistContainerContent()
  var playlists;
  playlists = await grabPlaylists(emotion)

  var playlistCard = document.createElement('a')
  playlistCard.setAttribute("class", "card h-100 p-3 my-3 playlistCard")

  var playlistContainerHeader = document.createElement('h3')
  playlistContainerHeader.textContent = `Playlist curated for mood: ${emotion}`

  var playlistCardHeader = document.createElement('h4')
  var playlistCardImage = document.createElement('img')

  document.getElementById('content-parent').appendChild(playListContainerEl)
  playListContainerEl.appendChild(playlistContainerHeader)
  playlistCard.appendChild(playlistCardHeader)
  playlistCard.appendChild(playlistCardImage)
  
  playlists.items.forEach(playlist => {
    console.log('each individual playlist datum: ', playlist)
    var clone = playlistCard.cloneNode(true)

    var playListCardElements = clone.childNodes
    playListCardElements[0].innerText = playlist.data.name
    playListCardElements[1].setAttribute('src', playlist.data.images.items[0].sources[0].url)
    playListContainerEl.appendChild(clone)
  })
}

