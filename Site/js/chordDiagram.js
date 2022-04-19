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
        console.log(vis.characters)

        vis.colorScale = d3.scaleOrdinal()
            .domain(vis.characters)
            .range(d3.schemeCategory10);

        var svg = d3.select(vis.config.parentElement)
          .append("svg")
            .attr("width", 440)
            .attr("height", 440)
          .append("g")
            .attr("transform", "translate(220,220)")

        // create a matrix
        var matrix = vis.data;

        // 4 groups, so create a vector of 4 colors
        var colors = []

        // give this matrix to d3.chord(): it will calculates all the info we need to draw arc and ribbon
        var res = d3.chord()
            .padAngle(0.05)
            .sortSubgroups(d3.descending)
            (matrix)

        // add the groups on the outer part of the circle
        svg
          .datum(res)
          .append("g")
          .selectAll("g")
          .data(function(d) { return d.groups; })
          .enter()
          .append("g")
          .append("path")
            .style("fill", function(d,i){ return vis.colorScale(vis.characters[i]) })
            .attr("d", d3.arc()
              .innerRadius(200)
              .outerRadius(210)
            )

        // Add the links between groups
        svg
          .datum(res)
          .append("g")
          .selectAll("path")
          .data(function(d) { return d; })
          .enter()
          .append("path")
            .attr("d", d3.ribbon()
              .radius(200)
            )
            .style("fill", function(d){ return(vis.colorScale(vis.characters[d.source.index])) }) // colors depend on the source group. Change to target otherwise.
            .style("stroke", "black");

        d3.select("#mapLegend").selectAll("*").remove()

        var svg = d3.select("#mapLegend").append("svg")
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
}