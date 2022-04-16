class dataCollection {
	constructor(_characters, _episodes){
		this.characters = _characters
		this.episodes = _episodes
	}

	getLinesPerEpisodeFromCharacter(_characterName){
		let returnArr = []
		this.episodes.forEach(episode => {
			if(episode.characters.find(o => o.name == _characterName) !== undefined){
				returnArr.push({combo: episode.season + ":" + episode.episode, episode: episode.episode, season: episode.season, count: episode.characters.find(o => o.name == _characterName).lines})
			}
			
		})
		return returnArr
	}

	getSeasons(){
		let returnArr = []
		this.episodes.forEach(episode => {
			if(returnArr.find(o => o == episode.season) === undefined) returnArr.push(episode.season)
		})
		return returnArr
	}

	getEpisodeNumbers(_season){
		let returnArr = []
		this.episodes.forEach(episode => {
			if(episode.season == _season) returnArr.push(episode.episode)
		})
		return returnArr
	}

	getEpisodeDetails(_season, _episode){
		let returnArr = []
		this.episodes.forEach(episode => {
			if(episode.season == _season && episode.episode == _episode) {
				episode.characters.forEach(character => {
					returnArr.push(character)
				})
			}
		})
		return returnArr
	}
}