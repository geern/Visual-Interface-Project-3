class ChordDiagram {
    constructor(_config, _data, _characters){
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 800,
            containerHeight: _config.containerHeight || 400,
            margin: _config.margin || {top: 30, right: 100, bottom: 50, left: 100},
            class: _config.class || "none",
            title: _config.title
        }
        this.data = _data;
        this.characters = _characters;
        this.initVis();
    }

    initVis(){
        let vis = this;
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
        vis.radius = vis.width > vis.height ? vis.height / 2 : vis.width / 2

        vis.updateVis(vis.data, vis.characters, vis.config.title)

        vis.loadLegend()
    }

    loadLegend(){
        let vis = this
        let legend = "#chordWholeLegend"

        d3.select(legend).selectAll("*").remove()

        var svg = d3.select(legend).append("svg")
        .attr("width", "100%")
        .attr("height", "100%")

        svg.append('text')
        .attr('transform', `translate(0,${parseInt(svg.style('height')) - 1})`)
        .style("font-size", "10px")

        svg.append("g")
        .attr("class", "legendOrdinal")
        .attr("transform", "translate(20,20)");

        var legendOrdinal = d3.legendColor()
        .title("Color By Characters")
        .shapeWidth(10)
        .shapePadding(5)
        .scale(vis.colorScale);

        svg.select(".legendOrdinal")
        .call(legendOrdinal);
    }

    updateVis(_data, _characters, _title){
        let vis = this
        vis.characters = _characters
        vis.data = _data
        vis.config.title = _title

        vis.colorScale = d3.scaleOrdinal()
            .domain(vis.characters)
            .range(["#EFD304", "#F79138", "#CBC2C3", "#0FC6B3", "#EF6DA7", "#943131", "#C18221", "#76800D", "#C0CEEC", "#CA3464", "#826DA9", "#592DF0", "#FCD2A2", "#EF442E", "#8F9A8E"]);

        d3.select(vis.config.parentElement).selectAll("*").remove()

        vis.svg = d3.select(vis.config.parentElement)
          .append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
          .append("g")
            .attr("transform", `translate(${vis.width / 2},${vis.height / 2})`)

        d3.select(vis.config.parentElement).append("text")
            .attr("class", 'title' + vis.config.title.replace(/\s/g, '').replace(/\./g,'').replace(',', ''))
            .attr("text-anchor", "middle")
            .attr("x", vis.config.containerWidth /2)
            .attr("y", vis.config.containerHeight-10)
            .text(vis.config.title);

        var res = d3.chord()
            .padAngle(0.1)
            .sortSubgroups(d3.descending)
            (vis.data)

        var defs = vis.svg.append('defs');

        // Add one gradient for each link
        var gradient = defs.selectAll(".gradient")
          .data(res)
          .enter()
          .append("radialGradient")
          .attr("class", "gradient")
          .attr("id", function(d) {
            return "gradient-" + d.source.index + '-' + d.target.index;
          })
          .each(function(d) {
            var centerAngle = (d.source.endAngle - d.source.startAngle) / 2;
            centerAngle += d.source.startAngle;
            const radius = 0.5;

            d3.select(this)
              .attr('cx', function() {
                return Math.sin(centerAngle) * radius + 0.5;
              })
              .attr('cy', function() {
                return -Math.cos(centerAngle) * radius + 0.5;
              })
              .attr('r', 1);
          });

        gradient.append("stop")
          .attr('class', 'start')
          .attr("offset", "0%")
          .attr("stop-color", function(d) {
            return vis.colorScale(vis.characters[d.source.index]);
          })
          .attr("stop-opacity", 1);

        gradient.append("stop")
          .attr('class', 'end')
          .attr("offset", "100%")
          .attr("stop-color", function(d) {
            return vis.colorScale(vis.characters[d.target.index]);
          })
          .attr("stop-opacity", 1);

        // add the groups on the outer part of the circle
        vis.svg
          .datum(res)
          .append("g")
          .selectAll("g")
          .data(function(d) { return d.groups; })
          .enter()
          .append("g")
          .append("path")
            .attr("class", function(d) { return "ring ring" + vis.characters[d.index].replace(/\s/g, '').replace(/\./g,'').replace(',', '') })
            .style("fill", function(d,i){ return vis.colorScale(vis.characters[i]) })
            .attr("d", d3.arc()
              .innerRadius(vis.radius - 10)
              .outerRadius(vis.radius)
            )
            .on('mouseenter', function(event,d) { //function to add mouseover event
                vis.svg.selectAll(".ring").transition()
                  .style('opacity', 0.25)
                vis.svg.selectAll(".link").transition()
                  .style('opacity', 0.25)
                vis.svg.selectAll(".link" + vis.characters[d.index].replace(/\s/g, '').replace(/\./g,'').replace(',', '')).transition()
                  .style('opacity', 1)
                d3.select(this).transition().style('opacity', 1)
                let html = () => {
                    var stringReturn = ``
                    stringReturn += `<div class="tooltip-label" "></div>`
                    stringReturn += `${vis.characters[d.index]}`
                    return stringReturn
                }
                //create a tool tip
                d3.select('#ToolTip')
                    .style('opacity', 1)
                    .style('z-index', 1000000)
                    .html(html);
            })
            .on('mousemove', (event) => {
                //position the tooltip
                let width = document.getElementById('ToolTip').offsetWidth
                d3.select('#ToolTip')
                  .style('left', ()=>{
                    if(event.pageX + width >= 1850){                        
                        return (event.pageX - width) + 'px'
                    }
                    return (event.pageX + 10) + 'px'
                })   
                  .style('top', (event.pageY + 10) + 'px');
            })              
            .on('mouseleave', function() { 
                vis.svg.selectAll(".ring").transition()
                  .style('opacity', 1)
                vis.svg.selectAll(".link").transition()
                  .style('opacity', 1)
                d3.select('#ToolTip').style('opacity', 0);//turn off the tooltip
            })
            .style('stroke', 'black')

        // Add the links between groups
        vis.svg
          .datum(res)
          .append("g")
          .selectAll("path")
          .data(function(d) { return d; })
          .enter()
          .append("path")
            .attr("class", function(d) {
                return "link link" + vis.characters[d.source.index].replace(/\s/g, '').replace(/\./g,'').replace(',', '') + " link" + vis.characters[d.target.index].replace(/\s/g, '').replace(/\./g,'').replace(',', '')
            })
            .attr("d", d3.ribbon()
              .radius(vis.radius - 10)
            )
            .style("fill", function(d){ return "url(#gradient-" + d.source.index + '-' + d.target.index + ")" })
            .on('mouseenter', function(event,d) { //function to add mouseover event
                vis.svg.selectAll(".link").transition()
                  .style('opacity', 0.25)
                vis.svg.selectAll(".ring").transition()
                  .style('opacity', 0.25)
                vis.svg.selectAll(".ring" + vis.characters[d.source.index].replace(/\s/g, '').replace(/\./g,'').replace(',', '')).transition()
                  .style('opacity', 1)
                vis.svg.selectAll(".ring" + vis.characters[d.target.index].replace(/\s/g, '').replace(/\./g,'').replace(',', '')).transition()
                  .style('opacity', 1)
                d3.select(this).transition().style('opacity', 1)
                let html = () => {
                    var stringReturn = ``
                    stringReturn += `<div class="tooltip-label" "></div>`
                    stringReturn += `${vis.characters[d.source.index]} and ${vis.characters[d.target.index]}`
                    stringReturn += `<ul>`
                    stringReturn += `<li>Lines together: ${d.source.value}`
                    stringReturn += `</ul>`
                    return stringReturn
                }
                //create a tool tip
                d3.select('#ToolTip')
                    .style('opacity', 1)
                    .style('z-index', 1000000)
                    .html(html);
            })
            .on('mousemove', (event) => {
                //position the tooltip
                let width = document.getElementById('ToolTip').offsetWidth
                d3.select('#ToolTip')
                  .style('left', ()=>{
                    if(event.pageX + width >= 1850){                        
                        return (event.pageX - width) + 'px'
                    }
                    return (event.pageX + 10) + 'px'
                })   
                  .style('top', (event.pageY + 10) + 'px');
            })              
            .on('mouseleave', function() { 
                vis.svg.selectAll(".ring").transition()
                  .style('opacity', 1)
                vis.svg.selectAll(".link").transition()
                  .style('opacity', 1)
                d3.select('#ToolTip').style('opacity', 0);//turn off the tooltip
            })
    }
}