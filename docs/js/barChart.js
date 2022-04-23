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
            .attr('class', 'xAxis' + vis.config.title.replace(/\s/g, '').replace(/\./g,'').replace(',', ''))
            .call(d3.axisBottom(vis.xScale))
            .selectAll("text")
            .attr("transform", "translate(-10,25)rotate(-45)")
            .style("display", () => {
                if(vis.config.parentElement == '#EpisodeDetails') return 'block'
                return 'none'
            });

        // Add Y axis
        vis.yScale = d3.scaleLinear()
            .domain([0, d3.extent(vis.data, d => d[vis.config.yValue])[1]])
            .range([ vis.height, 0]);
        vis.yAxis = d3.axisLeft(vis.yScale)
        vis.yAxisG = vis.svg.append('g')
            .attr('class', 'yAxis' + vis.config.title.replace(/\s/g, '').replace(/\./g,'').replace(',', ''))
            .call(vis.yAxis)

        vis.svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "middle")
            .attr("x", (-1) * vis.config.containerHeight / 2 + 30)
            .attr("y", -30)
            .attr("transform", "rotate(-90)")
            .text(vis.config.yLabel);

        vis.svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", vis.config.containerWidth / 2)
            .attr("y", vis.config.containerHeight - 55)
            .text(vis.config.xLabel);

        vis.svg.append("text")
            .attr("class", 'title' + vis.config.title.replace(/\s/g, '').replace(/\./g,'').replace(',', ''))
            .attr("text-anchor", "middle")
            .attr("x", vis.config.containerWidth / 2)
            .attr("y", 0)
            .text(vis.config.title);
    
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
            .attr("fill", "#EBE04D")

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
                    if(vis.config.parentElement == '#EpisodeDetails') {
                        var stringReturn = ``
                        stringReturn += `<div class="tooltip-label" "></div>`
                        stringReturn += `<ul>`
                        stringReturn += `<li>Name: ${d.name}</li>`
                        stringReturn += `<li>Amount of Lines spoken: ${d.lines}</li>`
                        stringReturn += `</ul>`
                        return stringReturn
                    }
                    else {
                        var stringReturn = ``
                        stringReturn += `<div class="tooltip-label" "></div>`
                        stringReturn += `<ul>`
                        stringReturn += `<li>Season: ${d.season}</li>`
                        stringReturn += `<li>Episode: ${d.episode}</li>`
                        stringReturn += `<li>Lines Spoke: ${d[vis.config.yValue]}</li>`
                        stringReturn += `</ul>`
                        return stringReturn
                    }
                }
                //create a tool tip
                d3.select('#ToolTip')
                    .style('opacity', 1)
                    .style('z-index', 1000000)
                    .html(html);
            })
            .on('mousemove', (event) => {
                //position the tooltip
                var width = document.getElementById('ToolTip').offsetWidth
                d3.select('#ToolTip')
                  .style('left', ()=>{
                    if(event.pageX + width >= 1850){                        
                        return (event.pageX - width) + 'px'
                    }
                    return (event.pageX + 10) + 'px'
                })   
                  .style('top', (event.pageY + 10) + 'px');
            })              
            .on('mouseleave', function() { //function to add mouseover event
                d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
                  .duration('150') //how long we are transitioning between the two states (works like keyframes)
                  .attr("fill", "white") //change the fill
                  .style('opacity', 0)

                d3.select('#ToolTip').style('opacity', 0);//turn off the tooltip
            })
            .on('click', function(event, d) {
                if(d.combo !== undefined){
                    document.getElementById("SeasonSelect").value = d.season
                    document.getElementById("EpisodeSelect").value = d.episodes
                    document.getElementById("SeasonSelect").onchange()
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
            .attr("width", vis.xScale.bandwidth())
            .attr("x", function(d) { return vis.xScale(d[vis.config.xValue]); })
            .attr("y", function(d) { return vis.yScale(d[vis.config.yValue]); })
            .attr("height", function(d) { return vis.height - vis.yScale(d[vis.config.yValue]);})

        vis.svg.selectAll('.barHighlight')
            .data(vis.data)
            .attr("width", vis.xScale.bandwidth())
            .attr("x", function(d) { return vis.xScale(d[vis.config.xValue]); })
            .attr("y", function(d) { return vis.yScale(d3.extent(vis.data, d => d[vis.config.yValue])[1]); })
            .transition().duration(10)

        if(_title !== undefined){
            d3.select('.title' + vis.config.title.replace(/\s/g, '').replace(/\./g,'').replace(',', ''))
                .text(_title);
        }

        d3.select('.yAxis' + vis.config.title.replace(/\s/g, '').replace(/\./g,'').replace(',', ''))
            .transition()
            .duration(1000)
            .call(vis.yAxis)

        d3.select('.xAxis' + vis.config.title.replace(/\s/g, '').replace(/\./g,'').replace(',', ''))
            .transition()
            .duration(1000)
            .call(vis.xAxis)
            .selectAll('text')
            .attr("transform", "translate(-10,25)rotate(-45)")
    }
}