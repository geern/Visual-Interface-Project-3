class dataCollection {
	constructor(_characters, _episodes, _wholeConnection){
		this.characters = _characters
		this.episodes = _episodes
		this.wholeConnection = _wholeConnection
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

	formatChordData(){
		let tmp = []
		let matrix = []
		this.wholeConnection.sort((a, b) => a[0] > b[0] ? 1 : -1)
		
		this.wholeConnection.forEach(connection => {
			if(tmp.find(o => o == connection[0]) === undefined) tmp.push(connection[0])
		})

		for(var i = 0; i < tmp.length; i++){
			matrix[i] = new Array(tmp.length).fill(0)
		}

		this.wholeConnection.forEach(connection => {
			let row = 0
			let column = 0
			row = this.getArrayIndex(tmp, connection[0])
			column = this.getArrayIndex(tmp, connection[1])
			matrix[row][column] = connection[2]
			matrix[column][row] = connection[2]
		})

		this.chordCharacters = tmp
		console.log(this.wholeConnection)
		return matrix
	}

	getArrayIndex(_array, target){
		return _array.indexOf(target)
	}
}