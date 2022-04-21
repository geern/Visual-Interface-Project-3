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

	formatChordData(_data){
		let chordCharacters = []
		let matrix = []
		_data.sort((a, b) => a[0] > b[0] ? 1 : -1)
		
		_data.forEach(connection => {
			if(chordCharacters.find(o => o == connection[0]) === undefined) chordCharacters.push(connection[0])
			if(chordCharacters.find(o => o == connection[1]) === undefined) chordCharacters.push(connection[1])
		})

		for(var i = 0; i < chordCharacters.length; i++){
			matrix[i] = new Array(chordCharacters.length).fill(0)
		}

		_data.forEach(connection => {
			let row = 0
			let column = 0

			row = this.getArrayIndex(chordCharacters, connection[0])
			column = this.getArrayIndex(chordCharacters, connection[1])
			//if(connection[0] == "Mr. Read" || connection[1] == "Mr. Read") console.log(connection, row, column)
			matrix[row][column] = connection[2]
			matrix[column][row] = connection[2]
		})
		return matrix
	}

	getArrayIndex(_array, target){
		return _array.indexOf(target)
	}

	getChordCharacters(_data){
		let chordCharacters = []
		let matrix = []
		_data.sort((a, b) => a[0] > b[0] ? 1 : -1)
		
		_data.forEach(connection => {
			if(chordCharacters.find(o => o == connection[0]) === undefined) chordCharacters.push(connection[0])
		})

		return chordCharacters
	}
}