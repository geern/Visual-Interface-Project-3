var characters
var charCount = 0
var charBackground = ['#808080', '#D3D3D3']

Promise.all([
  d3.csv('data/Characters.csv')
    ]).then(function(files) {
      characters = files[0]
      console.log(characters)

      characters.forEach(character => {
        createCheckBox(character)
        createCharacterSheet(character)
      })

      checkBoxes = document.getElementsByName('checkbox')
      checkBoxes.forEach(checkbox => {
        checkbox.checked = true
      })
})

function createCheckBox(_character){
  let container = document.createElement('label')
  container.input = document.createElement('input')
  container.input.type = 'checkbox'
  container.input.data = _character
  container.input.id = 'checkbox' + _character["Character Name"]
  container.input.name = 'checkbox'
  container.input.onclick = function() {checkCheckBox()}
  container.innerHTML = _character["Character Name"]

  container.appendChild(container.input)
  document.getElementById('CheckBoxContainer').appendChild(container)
}

function createCharacterSheet(_character){
  let container = createDiv('left', '50%', '50%')
  container.image = createDiv('left', '25%', '50%')
  container.name = createDiv('left', '75%', '16.66%')
  container.episodes = createDiv('left', '75%', '16.66%')
  container.lines = createDiv('left', '75%', '16.66%')
  container.timeLine = createDiv('left', '100%', '50%')
  container.id = 'characterSheet' + _character['Character Name']
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
  image.src = 'images/index.jpg'

  container.name.innerHTML = "Name:"
  container.name.appendChild(addContent(_character['Character Name']))

  container.episodes.innerHTML = "How many Episodes appeared in:"
  container.episodes.appendChild(addContent(_character['Total Episodes']))

  container.lines.innerHTML = "How many lines spoke:"
  container.lines.appendChild(addContent(_character['Total Lines']))

  container.image.appendChild(image)
  container.appendChild(container.image)
  container.appendChild(container.name)
  container.appendChild(container.episodes)
  container.appendChild(container.lines)
  container.appendChild(container.timeLine)

  document.getElementById('DisplayCharacters').appendChild(container)
}

function checkCheckBox(){
  var sheets = document.querySelectorAll('div[class="CharacterSheet"')
  Array.prototype.forEach.call(sheets, function(el) {
    el.remove()
  });

  var checkboxes = document.querySelectorAll('input[type="checkbox"]:checked')
  Array.prototype.forEach.call(checkboxes, function(el) {
    createCharacterSheet(el.data)
  });

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