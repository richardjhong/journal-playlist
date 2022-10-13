# Journal Playlist

## Collaborators
<a href="https://github.com/richardjhong/journal-playlist/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=richardjhong/journal-playlist" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

## Description
User is able to type into the journal and fetch playlists appropriately from the perceived strongest emotion of the text content.

## Technologies
This project uses [Bulma](https://bulma.io/) for the frontend framework and [moment](https://momentjs.com/) for checking time date formating. It also uses three APIs from RapidAPI hub, the [Emotion Analysis API](https://rapidapi.com/twinword/api/emotion-analysis/), the [Famous Quotes API](https://rapidapi.com/saicoder/api/famous-quotes4/) and [Spotify API](https://rapidapi.com/Glavier/api/spotify23/) throughout the app. Lastly [Chart.js](https://www.chartjs.org/) is used for the doughnut chart to give a visual representation of the emotion score tally throughout the day.


## Architecture

At a high level, the user types into the journal text and Emotion Analysis API analyzes the text. After giving a range of scores amongst six different emotions (joy, anger, sadness, disgust, fear, surprise), the highest scoring emotion i.e. the strongest emotion is extracted as a keyword. It is also stored within localStorage which keeps tally of each respective emotions count throughout the day. This same keyword is then put into the Spotify API and 5 playlists are fetched based on appropriate matching; a randomized choice is then stored into the localStorage and then added to the playlist timeline. 

A doughnut chart is created either if there is an existing localStorage collection of emotions of the same day on first load or created upon grabbing the first emotion of the day. This doughnut chart updates as more scores are sttored within localStorage as well. To see the doughnut chart, the user will see a button to see the chart (with at least one emotion score stored in localStorage; otherwise the button will remain hidden).

Upon clicking the quotes button, the Famous Quotes API retrieves 10 quotes. One randomly picked quote displays and it's removed from the pool selection of remaining quotes. Every 30 seconds another randomly picked quote displays and it's then removed from the pool selection of remaining quotes. After 5 minutes (10 quotes that are displayed 30 seconds each is equal to 5 minutes), the Famous Quotes API grabs another 10 quotes and the process of randomizing, etc. repeats.

For more detailed information about the API data retrieval/handling:

- grabEmotions
- grabStrongestEmotion
- grabPlaylists
- injectPlaylistContainer
- grabInspirationalQuote
- injectNewQuote
- injectQuoteContainer

### grabEmotions

For the skeleton loading animation when a playlist is being fetched, heavy inspiration was taken from this [link](https://javascript.plainenglish.io/adding-skeleton-loading-animation-with-css-e6833f6e1d0a).
