class BarChart {
    constructor(_config, _data){
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 800,
            containerHeight: _config.containerHeight || 400,
            margin: _config.margin || {top: 30, right: 100, bottom: 50, left: 100},
            class: _config.class || "none",
            title: _config.title,
            xLabel: _config.xLabel,
            yLabel: _config.yLabel,
            xValue: _config.xValue,
            yValue: _config.yValue
        }
        this.data = _data;
        this.initVis();
    }

    initVis(){
        let vis = this;
        
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.svg = d3.select(vis.config.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.config.margin.left + vis.config.margin.right)
            .attr("height", vis.height + vis.config.margin.top + vis.config.margin.bottom)
            .append("g")
            .attr("transform",
            "translate(" + vis.config.margin.left + "," + vis.config.margin.top + ")");

        vis.xScale = d3.scaleBand()
            .range([ 0, vis.width ])
            .domain(vis.data.map(function(d) { return d[vis.config.xValue]; }))
            .padding(0.2);
        vis.xAxis = d3.axisBottom(vis.xScale)
        vis.xAxisG = vis.svg.append("g")
            .attr("transform", "translate(0," + vis.height + ")")
            .attr('class', 'xAxis' + vis.config.title.replace(/\s/g, '').replace(/\./g,''))
            .call(d3.axisBottom(vis.xScale))
            .selectAll("text")
            .attr("transform", "translate(-10,2)rotate(-65)")
            .style("text-anchor", "end");

        // Add Y axis
        vis.yScale = d3.scaleLinear()
            .domain([0, d3.extent(vis.data, d => d[vis.config.yValue])[1]])
            .range([ vis.height, 0]);
        vis.yAxis = d3.axisLeft(vis.yScale)
        vis.yAxisG = vis.svg.append('g')
            .attr('class', 'yAxis' + vis.config.title.replace(/\s/g, '').replace(/\./g,''))
            .call(vis.yAxis)

        d3.select(vis.config.parentElement).append("text")
            .attr("class", "y label")
            .attr("text-anchor", "middle")
            .attr("x", (-1) * vis.config.containerHeight / 2)
            .attr("y", 50)
            .attr("transform", "rotate(-90)")
            .text(vis.config.yLabel);

        d3.select(vis.config.parentElement).append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", vis.config.containerWidth / 2)
            .attr("y", vis.config.containerHeight - 20)
            .text(vis.config.xLabel);

        d3.select(vis.config.parentElement).append("text")
            .attr("class", 'title' + vis.config.title.replace(/\s/g, '').replace(/\./g,''))
            .attr("text-anchor", "middle")
            .attr("x", vis.config.containerWidth / 2)
            .attr("y", 25)
            .text(vis.config.title);

            if(vis.config.parentElement == '#timeLine' || vis.config.parentElement == '#sampleByYear'){

        vis.xScaleContext = d3.scaleBand()
            .range([ 0, vis.width ])
            .domain(vis.data.map(function(d) { return d[vis.config.xValue]; }))
            .padding(0.2);

        vis.yScaleContext = d3.scaleLinear()
        .range([vis.config.containerHeight, 0])
        .nice();

        // Append focus group with x- and y-axes

        vis.focus = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.focus.append('defs').append('clipPath')
            .attr('id', 'clip')
          .append('rect')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);
        
        vis.focusLinePath = vis.focus.append('path')
            .attr('class', 'chart-line');

        vis.xAxisFocusG = vis.focus.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.config.containerHeight})`);

        vis.yAxisFocusG = vis.focus.append('g')
            .attr('class', 'axis y-axis');

        vis.brushG = vis.svg.append('g')
            .attr('class', 'brush x-brush');

        // Initialize brush component
        vis.brush = d3.brushX()
            .extent([[0, 0], [vis.width, vis.height]])
            .on('brush', function({selection}) {
              if (selection) vis.brushed(selection);
            })
            .on('end', function({selection}) {
              if (!selection && vis.config.parentElement == '#sampleByYear') timeLine.brushed([0, timeLine.width])
              else if (!selection) vis.brushed([0, vis.width]);
            });

        vis.brushG.call(vis.brush)}

        // Bars
        vis.svg.selectAll(".bar")
            .data(vis.data)
            .enter()
        .append("rect")
            .attr('class', 'bar')
            .attr("x", function(d) { return vis.xScale(d[vis.config.xValue]); })
            .attr("y", function(d) { return vis.yScale(d[vis.config.yValue]); })
            .attr("width", vis.xScale.bandwidth())
            .attr("height", function(d) { return vis.height - vis.yScale(d[vis.config.yValue]); })
            .attr("fill", "#FF6D8D")

        //createing area for hovering years to display data
        vis.svg.selectAll(".barHighlight")
            .data(vis.data)
            .enter()
        .append("rect")
            .attr("x", function(d) { return vis.xScale(d[vis.config.xValue]); })
            .attr("y", function(d) { return vis.yScale(d3.extent(vis.data, d => d[vis.config.yValue])[1]); })
            .attr("width", vis.xScale.bandwidth())
            .attr("height", function(d) { return vis.height})
            .attr("fill", "white")
            .attr("class", "barHighlight")
            .attr("id", (d) => {return "barHighlight" + d.year})
            .style('opacity', 0)
            .on('mouseover', function(event,d) { //function to add mouseover event
                d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
                  .duration('150') //how long we are transitioning between the two states (works like keyframes)
                  .attr("fill", "#FFEF99") //change the fill
                  .style('opacity', 0.5)
                var html = () => {
                  var stringReturn = ``
                  stringReturn += `<div class="tooltip-label" "></div>`
                  stringReturn += `<ul>`
                  stringReturn += `<li>${vis.config.xValue}: ${d[vis.config.xValue]}</li>`
                  stringReturn += `<li>Samples Collected: ${d[vis.config.yValue]}</li>`
                  stringReturn += `</ul>`
                  return stringReturn
                }
                //create a tool tip
                d3.select('#tooltip')
                    .style('opacity', 1)
                    .style('z-index', 1000000)
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
                  .attr("fill", "white") //change the fill
                  .style('opacity', 0)

                d3.select('#tooltip').style('opacity', 0);//turn off the tooltip

            })
            .on('click', function(event, d){
                if(d.year){
                    let e = document.getElementById("YearSlider")
                    e.value = d.year
                    e.onchange()
                    e.oninput()
                }
            })

        
}

    updateVis(_data, _title){
        let vis = this;

        vis.data = _data

        vis.yScale.domain([0, d3.extent(vis.data, d => d[vis.config.yValue])[1]])
        vis.xScale.domain(vis.data.map(function(d) { return d[vis.config.xValue]; }))
        vis.svg.selectAll('.bar')
            .data(vis.data)
            .transition().duration(1000)
            .attr("x", function(d) { return vis.xScale(d[vis.config.xValue]); })
            .attr("y", function(d) { return vis.yScale(d[vis.config.yValue]); })
            .attr("height", function(d) { return vis.height - vis.yScale(d[vis.config.yValue]);})

        vis.svg.selectAll('.barHighlight')
            .data(vis.data)
            .transition().duration(10)
        if(_title !== undefined){
            d3.select('.title' + vis.config.title.replace(/\s/g, '').replace(/\./g,''))
                .text(_title);
        }

        d3.select('.yAxis' + vis.config.title.replace(/\s/g, '').replace(/\./g,''))
            .transition()
            .duration(1000)
            .call(vis.yAxis)

        d3.select('.xAxis' + vis.config.title.replace(/\s/g, '').replace(/\./g,''))
            .transition()
            .duration(1000)
            .call(vis.xAxis)

    }

    brushed(selection) {
        let vis = this;
        if(vis.config.parentElement == '#timeLine'){
            let low = Math.floor(selection[0]/(vis.width/vis.data.length))
            let high = Math.floor(selection[1]/(vis.width/vis.data.length))
            let list = []

            let extent = vis.data.map(function(d) { return d[vis.config.xValue]; })

            vis.data.forEach(item => {
                if(item.year >= extent[low] && item.year <= extent[high-1]){
                    item.fungi.forEach(fungi => {
                        list.push(fungi)
                    })
                }
            })

            vis.selectedFungi = list
            if(high == extent.length) high--
            vis.yearRange = [extent[low], extent[high]]

            setSliderFromBrush(vis.yearRange)
            updateFromBrush(vis.selectedFungi)
        } else if (vis.config.parentElement == '#sampleByYear'){
            let low = Math.floor(selection[0]/(vis.width/vis.data.length))
            let high = Math.ceil(selection[1]/(vis.width/vis.data.length))
            let list = []

            let extent = vis.data.map(function(d) { return d[vis.config.xValue]; })
            vis.data.forEach(item => {
                if(item.month >= extent[low] && item.month <= extent[high-1]){
                    item.fungi.forEach(fungi => {
                        list.push(fungi)
                    })
                }
            })

            vis.selectedFungi = list
            updateFromBrush(vis.selectedFungi)
        }
    }

    yearHighlight(_selectedYear){
        let vis = this;
        d3.selectAll(".barHighlight")//how long we are transitioning between the two states (works like keyframes)
            .attr("fill", "white") //change the fill
            .style('opacity', 0)
        d3.select("#barHighlight" + _selectedYear)
            .attr("fill", "yellow") //change the fill
            .style('opacity', 0.25)
    }
}