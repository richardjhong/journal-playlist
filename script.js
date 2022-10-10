const userContainer = document.getElementById('users')
const button = document.getElementById('fetch-button')
const textArea = document.getElementById('textarea')
const contentContainer = document.getElementById('container')

contentContainer.addEventListener("click", function(event){

let currentText = textArea.value
if (event.target.id === 'fetch-button'){
    console.log(currentText)
grabStrongestEmotion(currentText);
}


})



// // //API Emotional Damage
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': '6650c3f23amsh5d344be378e5449p1f32bcjsn898396e2adb8',
		'X-RapidAPI-Host': 'twinword-emotion-analysis-v1.p.rapidapi.com'
	}
};

function grabEmotions(textInput) {
    return fetch('https://twinword-emotion-analysis-v1.p.rapidapi.com/analyze/?text=' + textInput, options)
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

    
//     function grabEmotions(textInput) {
//         return fetch('https://twinword-emotion-analysis-v1.p.rapidapi.com/analyze/?text=After%20living%20abroad%20for%20such%20a%20long%20time%2C%20seeing%20my%20family%20was%20the%20best%20present%20I%20could%20have%20ever%20wished%20for.', options)
//         .then(response => response.json())
//         .then(response => {
//             // console.log(response.emotion_scores.joy)
//         // let emotionScores = ['anger', 'disgust', 'fear', 'sadness', 'surprise', 'joy'];
//         // Math.max(emotionScores);
//         // console.log(response.emotion_scores.Math.max());
//     // let maxScore = Object.values(response.emotion_scores);
//     return response.emotion_scores;
//     console.log(Math.max(maxScore));
        
    
//     })
    
//         .catch(err => console.error(err))
//     }

//     async function grabStrongestEmotion() {
// let emotionScores = await grabEmotions();
// let maxScore = Math.max(Object.values(emotionScores));
// console.log(maxScore);
// let strongestEmotion = Object.keys(emotionScores).filter(key => emotionScores[key] === maxScore)
// console.log(strongestEmotion); 

//     }





