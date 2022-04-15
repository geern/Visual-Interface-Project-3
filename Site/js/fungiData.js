class fungiData {
  constructor(_data) {
    this.data = _data;
  }

  parseData(){
    let data = this.data
    Object.keys(data[0]).forEach( column => {
      if(parseInt(data[0][column])){
        data.forEach(d => {
          d[column] = parseFloat(d[column])
        });
      } 
    })

    data.forEach(d => {
      if(isNaN(d.decimalLatitude) || isNaN(d.decimalLongitude)){
        d.latitude = 9999999
        d.longitude = 9999999
      } else {
        d.latitude = d.decimalLatitude; //make sure these are not strings
        d.longitude = d.decimalLongitude; //make sure these are not strings
      }
    });
  }

  countDataByYear(){
    let data = this.data;

    /*var uniqueYears = [...new Set(data.map(item => item.year))];
    uniqueYears.splice(uniqueYears.findIndex(Number.isNaN), 1)
    */
    var counts = []

    var minYear = 9999
    var maxYear = 0

    data.forEach(item => {
      if(item.year > maxYear) maxYear = item.year
      if(item.year < minYear) minYear = item.year
    })

    for(var i = minYear; i <= maxYear; i++){
      counts.push({year: i, count: 0, fungi: []})
    }
    
    data.forEach( item => {
      if(counts.find(o => o.year === item.year) === undefined){
        counts.push({year: item.year, count: 1, fungi: [item]})
      }  else {
        counts.find(o => o.year === item.year).count++
        counts.find(o => o.year === item.year).fungi.push(item)
      }
    })

    //for posterity
    var counter = 0
    for(var i = counts.length-1; i > 0; i--){
      if(isNaN(counts[i].year)) {
        counter++;
        counts.splice(i, 1)
      }
    }

    //counts.sort((a,b) => ((a.year > b.year) ? 1 : ((b.year > a.year) ? -1 : 0)))
    
    this.countsByYear = counts;
  }

  getDataByYear(_year){
    let fungi = this

    var result = fungi.data.filter(obj => {
      return obj.year == _year
    })

    var counts = []

    for(var i = 1; i <= 12; i++){
      counts.push({month: i, count: 0, fungi: []})
    }

    result.forEach(item => {
      if(!isNaN(item.month)){
        if(counts.find(o => o.month === item.month) === undefined){
          counts.find(o => o.month === "0").count++
        }  else {
          counts.find(o => o.month === item.month).count++
          counts.find(o => o.month === item.month).fungi.push(item)
        }
        }
    })
    fungi.groupOfDataByYear = counts
  }

  getCountByCategory(_category){
    let fungi = this

    var unique = [...new Set(fungi.data.map(item => item[_category]))];
    unique.sort()
    var groupedData = []

    unique.forEach(item => {
      groupedData.push({[_category]: item, count: 0})
    })

    fungi.data.forEach(item => {
      if(item.selected) groupedData.find(o => o[_category] === item[_category]).count++
    })

    groupedData.sort((a,b) => ((a.count < b.count) ? 1 : ((b.count < a.count) ? -1 : 0)))

    fungi["groupedDataBy" + _category] = groupedData
  }

  getDataforTable(_data){
    let fungi = this
    
    let countWithCoords = 0
    let countWithoutCoords = 0
    let countWithEvent = 0
    let countWithoutEvent = 0

    _data.forEach(item => {
      if(item.latitude != 9999999 && item.longitude != 9999999 && item.selected) countWithCoords++
      else if(item.latitude == 9999999 && item.longitude == 9999999 && item.selected) countWithoutCoords++
      if(!isNaN(item.eventDate) && item.selected) countWithEvent++
      else if(isNaN(item.eventDate) && item.selected) countWithoutEvent++
    })

    fungi.tableData = {totalRecords: _data.length, withCoords: countWithCoords, withoutCoords: countWithoutCoords, withEvent: countWithEvent, withoutEvent: countWithoutEvent}
  }

  appendSelected(){
    let fungi = this

    fungi.data.forEach(item => {
      item.selected = true
    })
  }
}