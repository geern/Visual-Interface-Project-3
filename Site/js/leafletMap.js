class LeafletMap {

  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
    }
    this.data = _data;
    this.initVis();
  }
  
  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;

    vis.theMap = L.map(vis.config.parentElement, {
      center: [30, 0],
      zoom: 2
    });

    vis.updateVisBackground('Jawg.Streets', 'ZbfatVMXqkwePUctq85uzb20cxPlhBZEVGXBSm8mt2glUIYxtLepu1zsX4RbOAFC', 'year')
    vis.setDots()
  }

  updateVis() {
    let vis = this;

    //want to see how zoomed in you are? 
    // console.log(vis.map.getZoom()); //how zoomed am I
    
    //want to control the size of the radius to be a certain number of meters? 
    vis.radiusSize = 3; 
    // if( vis.theMap.getZoom > 15 ){
    //   metresPerPixel = 40075016.686 * Math.abs(Math.cos(map.getCenter().lat * Math.PI/180)) / Math.pow(2, map.getZoom()+8);
    //   desiredMetersForPoint = 100; //or the uncertainty measure... =) 
    //   radiusSize = desiredMetersForPoint / metresPerPixel;
    // }
   
   //redraw based on new zoom- need to recalculate on-screen position
    vis.Dots
      .attr("cx", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).x)
      .attr("cy", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).y)
      .attr("r", vis.radiusSize);
  }

  updateVisColor(_classification){
    let vis = this;
    vis.classification = _classification

    if(parseInt(vis.data[0][_classification])){
      var domain = d3.extent(vis.data, d => d[_classification]);
      vis.colorScale = d3.scaleSequential()
        .interpolator(d3.interpolateBlues)
        .domain(domain);

      d3.select("#mapLegend").selectAll("*").remove()

      d3.select("#mapLegend").style('height', '10vh')

      var svg = d3.select("#mapLegend").append('svg')
        .attr('class', 'center-container')
        .attr('width', '100%')

      var gradient = svg.append('defs').append('linearGradient')
        .attr("id", "legend-gradient")

      var legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(20,20)`);

      var legendRect = legend.append('rect')
        .attr('width', '95%')
        .attr('height', 25)

      var legendTitle = legend.append('text')
        .attr('class', 'legend-title')
        .attr('dy', '.35em')
        .attr('y',-10)
        .text("Color By " + _classification)

      var legendStops = [
        { color: vis.colorScale(domain[0]), value: domain[0], offset: 0},
        { color: vis.colorScale(domain[1]), value: domain[1], offset: 100},
      ];

      gradient.selectAll('stop')
        .data(legendStops)
        .join('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => d.color);

      legendRect.attr('fill', 'url(#legend-gradient)');

      let incrementTicks = []
      let incrementValue = _classification == "year" ? 5 : 12
      for(var i = domain[0]; i <= domain[1]; i+=incrementValue){
        incrementTicks.push({value: i})
      }

      if(incrementTicks[incrementTicks.length-1].value != domain[1]){
        incrementTicks.push({value: domain[1]})
      }

      legend.selectAll('.legend-label')
        .data(incrementTicks)
        .join('text')
        .attr('class', 'legend-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .attr('y', 40)
        .attr('x', (d,index) => {
          return index == 0 ? 0 : (98/incrementTicks.length)*index + "%";
        })
        .text(d => d.value);
    } else {
      var unique = [...new Set(vis.data.map(item => item[_classification]))];
      unique.sort()

      vis.colorScale = d3.scaleOrdinal()
        .domain(unique)
        .range(d3.schemeTableau10);

      d3.select("#mapLegend").selectAll("*").remove()
      d3.select("#mapLegend").style('height', '10vh')

      var svg = d3.select("#mapLegend").append("svg")
        .attr("width", "100%")
        .attr("height", "100%")

      svg.append('text')
        .attr('transform', `translate(0,${parseInt(svg.style('height')) - 1})`)
        .style("font-size", "10px")
        .text("*Some data phylums are blank")

      svg.append("g")
        .attr("class", "legendOrdinal")
        .attr("transform", "translate(20,20)");

      var legendOrdinal = d3.legendColor()
        .title("Color By Phylum")
        .shapeWidth(100)
        .shapePadding(50)
        .orient('horizontal')
        .scale(vis.colorScale);

      svg.select(".legendOrdinal")
        .call(legendOrdinal);
    }
  }

  updateVisBackground(_name, _token, _classification){
    let vis = this
    vis.classification = _classification
    vis.theMap.eachLayer(function (layer){
      vis.theMap.removeLayer(layer)
    })

    L.tileLayer.provider(_name, {
      accessToken: _token
    }).addTo(vis.theMap)

    L.svg({clickable:true}).addTo(vis.theMap)
    vis.overlay = d3.select(vis.theMap.getPanes().overlayPane)
    vis.svg = vis.overlay.select('svg').attr("pointer-events", "auto")

    vis.updateVisColor(_classification)
    
    //handler here for updating the map, as you zoom in and out           
    vis.theMap.on("zoomend", function(){
      vis.updateVis();
    });

    vis.setDots()
  }

  updateData(_selection){
    let vis = this
    vis.data.forEach(fungi => {
        fungi.selected = false
    })
    
    _selection.forEach(item => {
      vis.data.forEach(fungi => {
        if(item.id == fungi.id) {
          fungi.selected = true
        }
      })
    })

    vis.updateDots()
  }

  setDots(){
    let vis = this

    vis.Dots = vis.svg.selectAll('circle')
                    .data(vis.data) 
                    .join('circle')
                        .attr("fill", d => vis.colorScale(d[vis.classification])) 
                        .attr("stroke", "black")
                        .attr('opacity', d => {
                          if(d.selected) return 1
                          return 0
                        })
                        //Leaflet has to take control of projecting points. Here we are feeding the latitude and longitude coordinates to
                        //leaflet so that it can project them on the coordinates of the view. Notice, we have to reverse lat and lon.
                        //Finally, the returned conversion produces an x and y point. We have to select the the desired one using .x or .y
                        .attr("cx", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).x)
                        .attr("cy", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).y) 
                        .attr("r", 3)
                        .style('z-index', 1000)
                        .on('mouseover', function(event,d) { //function to add mouseover event
                            d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
                              .duration('150') //how long we are transitioning between the two states (works like keyframes)
                              .attr("fill", "red") //change the fill
                              .attr('r', 4); //change radius
                            var html = () => {
                              var stringReturn = ``
                              stringReturn += `<div class="tooltip-label" "></div>`
                              stringReturn += `<ul>`
                              stringReturn += `<li>Year collected: ${d.year}</li>`
                              stringReturn += `<li>Collected By: ${d.recordedBy}</li>`
                              stringReturn += `<li>Pylum: ${d.phylum}</li>`
                              stringReturn += `<li>Classification: ${d.class}</li>`
                              stringReturn += `<li>Habitat: ${d.habitat}</li>`
                              stringReturn += `<li>Substrate: ${d.substrate}</li>`
                              if(d.references != ''){
                                stringReturn += `<li>Click on dot to go to Link: ${d.references}</li>`
                              }
                              stringReturn += `</ul>`
                              return stringReturn
                            }
                            //create a tool tip
                            d3.select('#tooltip')
                                .style('opacity', 1)
                                .style('z-index', 1000000)
                                  // Format number with million and thousand separator
                                .html(html);

                          })
                        .on('mousemove', (event) => {
                            //position the tooltip
                            d3.select('#tooltip')
                              .style('left', (event.pageX + 10) + 'px')   
                              .style('top', (event.pageY + 10) + 'px');
                         })              
                        .on('mouseleave', function() { //function to add mouseover event
                            d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
                              .duration('150') //how long we are transitioning between the two states (works like keyframes)
                              .attr("fill", d => vis.colorScale(d[vis.classification])) //change the fill
                              .attr('r', 3) //change radius

                            d3.select('#tooltip').style('opacity', 0);//turn off the tooltip

                          })
                        .on('click', (event, d) => { //experimental feature I was trying- click on point and then fly to it
                            if(d.references != ''){
                              window.open(d.references)
                            }
                          });
  }

  updateDots(){
    let vis = this

    var update = vis.svg.selectAll('circle').data(vis.data)
    update.enter().append('circle')
    update
    .attr('opacity', d => {
      if(d.selected) return 1
      return 0
    })
    .attr("fill", d => vis.colorScale(d[vis.classification])) 
    .on('mouseleave', function() { //function to add mouseover event
                            d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
                              .duration('150') //how long we are transitioning between the two states (works like keyframes)
                              .attr("fill", d => vis.colorScale(d[vis.classification])) //change the fill
                              .attr('r', 3) //change radius

                            d3.select('#tooltip').style('opacity', 0);//turn off the tooltip

                          })
    update.transition()
    .duration(500)
  }
}