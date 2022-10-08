// Emotional Analysis API

const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': '6650c3f23amsh5d344be378e5449p1f32bcjsn898396e2adb8',
		'X-RapidAPI-Host': 'twinword-emotion-analysis-v1.p.rapidapi.com'
	}
};

fetch('https://twinword-emotion-analysis-v1.p.rapidapi.com/analyze/?text=After%20living%20abroad%20for%20such%20a%20long%20time%2C%20seeing%20my%20family%20was%20the%20best%20present%20I%20could%20have%20ever%20wished%20for.', options)
	.then(response => response.json())
	.then(response => console.log(response))
	.catch(err => console.error(err));