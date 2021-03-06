var data, episodeDetails, chordDiagramWhole, chordDiagramSeason
var charCount = 0
var charBackground = ['#b0b0b0', '#D3D3D3']
var filterBy = ['Most Episodes', 'Least Episodes', 'Alphabetical Descending', 'Alphabetical Ascending', 'Most Lines', 'Least Lines']


Promise.all([
  d3.json('data/characters.json'),
  d3.json('data/episodes.json'),
  d3.json('data/Frequency/frequency.json')
    ]).then(function(files) {
      data = new dataCollection(files[0], files[1], files[2])

      console.log(data.episodes)
      console.log(data.characters)

      data.characters.sort((a, b) => a.name > b.name ? 1 : -1)
      data.characters.forEach(character => {
        if(character.total_episodes > 5 && character.total_lines > 5 && character.name.indexOf('+') < 0 && character.name.indexOf('and') < 0) createCheckBox(character)
      })

      checkBoxes = document.getElementsByName('checkbox')
      checkBoxes.forEach(checkbox => {
        checkbox.checked = true
      })

      filterBy.forEach(item => {
        loadDropDown('FilterCharactersSelect', [item])
      })

      checkCheckBox()

      let seasons = data.getSeasons()

      seasons.forEach(item => {
        loadDropDown('SeasonSelect', [item])  
      })

      let episodes = data.getEpisodeNumbers(document.getElementById('SeasonSelect').value)

      episodes.forEach(item => {
        loadDropDown('EpisodeSelect', [item])  
      })
      document.getElementById('EpisodeSelect').onchange()

      let width = document.getElementById('ChordDiagramWhole').clientWidth
      let height = document.getElementById('ChordDiagramWhole').clientHeight

      chordDiagramWhole = new ChordDiagram({ 
        parentElement: "#ChordDiagramWhole", 
        title:"Connections",
        containerWidth: width,
        containerHeight: height,
        margin: {top: 10, right: 10, bottom: 20, left: 10}
      }, 
      data.formatChordData(files[2]), data.getChordCharacters(data.wholeConnection))

      loadSeasonChord()
})

document.getElementById('SeasonSelect').onchange = () => {
  let episodeDropDown = document.getElementById('EpisodeSelect')
  while (episodeDropDown.options.length > 0) episodeDropDown.remove(0)

  let episodes = data.getEpisodeNumbers(document.getElementById('SeasonSelect').value)

  episodes.forEach(item => {
    loadDropDown('EpisodeSelect', [item])  
  })
  episodeDropDown.onchange()

  updateSeasonChord()
}

document.getElementById('EpisodeSelect').onchange = () => {
  let episodeDropDown = document.getElementById('EpisodeSelect')
  let seasonDropDown = document.getElementById('SeasonSelect')

  let details = data.getEpisodeDetails(seasonDropDown.value, episodeDropDown.value)
  details.sort((a, b) => a.lines < b.lines ? 1 : -1)
  let width = document.getElementById('EpisodeDetails').clientWidth
  let height = document.getElementById('EpisodeDetails').clientHeight
  if(episodeDetails === undefined){
    episodeDetails = new BarChart({ 
          parentElement: '#EpisodeDetails', 
          title:"Lines Spoken on Season " + seasonDropDown.value + ", Episode " + episodeDropDown.value,
          containerWidth: width,
          containerHeight: height,
          xLabel: "Episode",
          yLabel: "Lines",
          xValue: "name",
          yValue: "lines",
          margin: {top: 50, right: 10, bottom: 70, left: 50}
        }, 
        details);
  } else {
    episodeDetails.updateVis(details, "Lines Spoken on Season " + seasonDropDown.value + ", Episode " + episodeDropDown.value)
  }
}

document.getElementById('FilterCharactersSelect').onchange = () => {
  checkCheckBox()
}

async function loadSeasonChord(){
  let season = document.getElementById('SeasonSelect').value
  file = await d3.json('data/Frequency/frequency' + season + '.json')
  let width = document.getElementById('ChordDiagramSeason').clientWidth
  let height = document.getElementById('ChordDiagramSeason').clientHeight
    chordDiagramSeason = new ChordDiagram({ 
        parentElement: "#ChordDiagramSeason", 
        title:"Connections from Season " + season,
        containerWidth: width,
        containerHeight: height,
        margin: {top: 10, right: 10, bottom: 20, left: 10}
      }, 
      data.formatChordData(file), data.getChordCharacters(file))
}

async function updateSeasonChord(){
  let season = document.getElementById('SeasonSelect').value
  file = await d3.json('data/Frequency/frequency' + season + '.json')
  chordDiagramSeason.updateVis(data.formatChordData(file), data.getChordCharacters(data.wholeConnection), "Connections from Season " + season)
}

function createCheckBox(_character){
  let container = document.createElement('label')
  container.style.width = '15%'
  container.style.float = 'left'
  container.style.textAlign = 'left'
  container.input = document.createElement('input')
  container.input.type = 'checkbox'
  container.input.data = _character
  container.input.id = 'checkbox' + _character["name"]
  container.input.style.float = 'left'
  container.input.name = 'checkbox'

  container.input.onclick = function() {checkCheckBox()}
  container.innerHTML = _character["name"]

  container.appendChild(container.input)
  document.getElementById('CheckBoxContainer').appendChild(container)
}

function createCharacterSheet(_character){
  let container = createDiv('left', '50%', '60%')
  container.image = createDiv('left', '25%', '50%')
  container.name = createDiv('left', '75%', '16.66%')
  container.episodes = createDiv('left', '75%', '16.66%')
  container.lines = createDiv('left', '75%', '16.66%')
  container.timeLine = createDiv('left', '100%', '50%')
  container.id = 'characterSheet' + _character['name']
  container.classList.add('CharacterSheet')

  if(charCount == 0 || charCount == 3) {
    container.style.background = charBackground[0]
  } else {
    container.style.background = charBackground[1]
  }
  charCount++
  if(charCount == 4) charCount = 0

  let image = document.createElement('img')
  image.style.width = '100%'
  image.style.height = '100%'
  image.src = "images/" + _character['name'] + ".jpg"
  image.onerror = function () {failedImage(this)}
  container.name.innerHTML = "Name:"
  container.name.appendChild(addContent(_character['name']))

  container.episodes.innerHTML = "How many Episodes appeared in:"
  container.episodes.appendChild(addContent(_character['total_episodes']))

  container.lines.innerHTML = "How many lines spoke:"
  container.lines.appendChild(addContent(_character['total_lines']))

  container.svg = document.createElement('svg')
  container.svg.id = _character['name'].replace(/[^a-z0-9]/gi, '').trim() + "TimeLine"
  container.svg.style.width = '100%'
  container.svg.style.height = '100%'
  container.timeLine.appendChild(container.svg)

  container.image.appendChild(image)
  container.appendChild(container.image)
  container.appendChild(container.name)
  container.appendChild(container.episodes)
  container.appendChild(container.lines)
  container.appendChild(container.timeLine)

  document.getElementById('DisplayCharacters').appendChild(container)

  let width = container.timeLine.clientWidth
  let height = container.timeLine.clientHeight

  container.barChart = new BarChart({ 
        parentElement: '#' + _character['name'].replace(/[^a-z0-9]/gi, '').trim() + "TimeLine", 
        title:"Lines per Episode",
        containerWidth: width,
        containerHeight: height,
        xLabel: "Episode",
        yLabel: "Lines",
        xValue: "combo",
        yValue: "count",
        margin: {top: 50, right: 10, bottom: 25, left: 50}
      }, 
      data.getLinesPerEpisodeFromCharacter(_character['name']));
}

function checkCheckBox(){
  //removes all character sheets
  var sheets = document.querySelectorAll('div[class="CharacterSheet"')
  Array.prototype.forEach.call(sheets, function(el) {
    el.remove()
  });

  //checks checkboxes to get data for character sheets
  var checkboxes = document.querySelectorAll('input[type="checkbox"]:checked')
  let characterSheets = []
  Array.prototype.forEach.call(checkboxes, function(el) {
    characterSheets.push(el.data)
  });

  //sorts character sheets and creates character sheets
  characterSheets = sortCharacterSheets(characterSheets, document.getElementById('FilterCharactersSelect').value)
  characterSheets.forEach(character => {
    createCharacterSheet(character)
  })
  //createCharacterSheet(characterSheets[2])
  //colors character sheets in alternating pattern
  charCount = 0
  var sheets = document.querySelectorAll('div[class="CharacterSheet"')
  Array.prototype.forEach.call(sheets, function(el) {
    if(charCount == 0 || charCount == 3) {
    el.style.background = charBackground[0]
  } else {
    el.style.background = charBackground[1]
  }
  charCount++
  if(charCount == 4) charCount = 0
  });
}

function createDiv(_float, _width, _height){
  let div = document.createElement('div')
  div.style.float = _float
  div.style.width = _width
  div.style.height = _height
  return div
}

function addContent(_content){
  let content = document.createElement('h3')
  content.classList.add('center')
  content.innerHTML = _content
  return content
}

function checkAll(){
  checkBoxes = document.getElementsByName('checkbox')
  checkBoxes.forEach(checkbox => {
    checkbox.checked = true
  })
  checkCheckBox()
}

function unCheckAll(){
  checkBoxes = document.getElementsByName('checkbox')
  checkBoxes.forEach(checkbox => {
    checkbox.checked = false
  })
  checkCheckBox()
}

function loadDropDown(_name, _values){
  //grabs the dropdown
  var select = document.getElementById(_name);
  var opt = document.createElement('option')
  var value = ""
  var innerHTML = ""

  //goes through each item in _values array to create the name and value of the option
  _values.forEach(function(item, index){
    if(index == _values.length-1) {
      value += item
      innerHTML += item
    }
    else {
      value += item + ", "
      innerHTML += item + " - "
    }
  })
  
  //appends the option to the dropdown
  opt.value = value
  opt.innerHTML = innerHTML
  select.appendChild(opt)
}

function failedImage(_image){
  _image.src = "images/index.jpg"
}

function sortCharacterSheets(_characterSheets, _filter){
  switch (_filter){
    case 'Most Episodes':
      return _characterSheets.sort((a, b) => a.total_episodes < b.total_episodes ? 1 : -1)
      break
    case 'Least Episodes':
      return _characterSheets.sort((a, b) => a.total_episodes > b.total_episodes ? 1 : -1)
      break
    case 'Alphabetical Descending':
      return _characterSheets.sort((a, b) => a.name > b.name ? 1 : -1)
      break
    case 'Alphabetical Ascending':
      return _characterSheets.sort((a, b) => a.name < b.name ? 1 : -1)
      break
    case 'Most Lines':
      return _characterSheets.sort((a, b) => a.total_lines < b.total_lines ? 1 : -1)
      break
    case 'Least Lines':
      return _characterSheets.sort((a, b) => a.total_lines > b.total_lines ? 1 : -1)
      break
  }
}