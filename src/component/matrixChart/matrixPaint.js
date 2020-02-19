import * as d3 from 'd3';

export function MatrixPaint(options) {
	var margin = {top: 60, right: 10, bottom: 10, left: 50},
	    width = options.width-margin.left-margin.right,
	    height = options.width-margin.top-margin.bottom,
	    data = options.data,
	    container = options.container,
	    labelsData = options.labels,
	    startColor = options.start_color,
	    endColor = options.end_color;


	if(!data){
		throw new Error('Please pass data');
	}

	if(!Array.isArray(data) || !data.length || !Array.isArray(data[0])){
		throw new Error('It should be a 2-D array');
	}

    var maxValue = d3.max(data, function(layer) { return d3.max(layer, function(d) { return d; }); });
    var minValue = d3.min(data, function(layer) { return d3.min(layer, function(d) { return d; }); });

	var numrows = data.length;
	var numcols = data[0].length;

	var svg = d3.select(container).append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var x = d3.scaleBand()
	    .domain(d3.range(numcols))
	    .range([0, width])
	    .paddingInner(0.3)
 		.paddingOuter(0.15);

	var y = d3.scaleBand()
	    .domain(d3.range(numrows))
	    .range([0, height])
	    .paddingInner(0.3)
 		.paddingOuter(0.15);

	var colorMap = d3.scaleLinear()
	    .domain([minValue,0,maxValue])
	    .range([startColor,"white", endColor]);

	var row = svg.selectAll(".row")
	    .data(data)
	  	.enter().append("g")
	    .attr("class", "row")
	    .attr("transform", function(d, i) { return "translate(0," + y(i) + ")"; });

	var cell = row.selectAll(".cell")
	    .data(function(d) {
	    	 return d;})
			.enter().append("g")
	    .attr("class", "cell")
	    .attr("transform", function(d, i) { return "translate(" + x(i) + ", 0)"; });

	


	cell.append('rect')
	    .attr("width", x.bandwidth())
	    .attr("height", y.bandwidth())
	    .style("stroke-width", 0);

	row.selectAll(".cell")
	    .data(function(d, i) { return data[i]; })
	    .style("fill", colorMap);

	var labels = svg.append('g')
		.attr('class', "labels");

	// 列的坐标
	var columnLabels = labels.selectAll(".column-label")
	    .data(labelsData)
	    .enter().append("g")
	    .attr("class", "column-label")
	    .attr("transform", function(d, i) { return `translate(${x(i)} ,0 )`; });

	// //	列坐标的短线。所以x1，x2值相同，垂直向下
	// columnLabels.append("line")
	// 	.style("stroke", "black")
	//     .style("stroke-width", "1px")
	//     .attr("x1", x.bandwidth() / 2)
	//     .attr("x2", x.bandwidth() / 2)
	//     .attr("y1", -5)
	//     .attr("y2", 0);

	columnLabels.append("text")
	    .attr("x", 0)
	    .attr("y", -10)
	    .attr("dy", ".05em")
	    .attr("text-anchor", "end")
      .attr("transform", "rotate(45)")
      .attr("font-size","0.65em")
	    .text(function(d, i) { return d; });

	var rowLabels = labels.selectAll(".row-label")
	    .data(labelsData)
	  .enter().append("g")
	    .attr("class", "row-label")
	    .attr("transform", function(d, i) { return "translate(" + 0 + "," + y(i) + ")"; });


	rowLabels.append("text")
	    .attr("x", 0)
	    .attr("y", y.bandwidth())
	    // .attr("dy", ".2em")
      .attr("text-anchor", "end")
      .attr("font-size","0.65em")
	    .attr("transform", "rotate(45)")
      .text(function(d, i) { return d; });
      
}

export const matrixData = [
  [1, 0.3, 0, -0.8, 0, 0.2, 1, 0.5, 0, 0.75,0.5, 0.2, 0.4, 0.3, 0.8],
  [0.3, 1, 0.5, 0.2, 0.4, 0.3, 0.8, 0.1, 1, 0, 1, 0.1, 0.4, 0, -0.6],
  [0, 0.5, 1, 0.4, 0, 0.9, 0, 0.2, 1, 0.3, 0.3, 0.9, 0.4, 0.1, -1],
  [0.8, 0.2, 0.4, -1, 0.3, 0.4, 0.1, 1, 0.2, 0.9, 0.9, 0.7, 0.1, 1, -0.4],
  [0, -0.4, 0, 0.3, 1, 0.1, 0.4, 0, -0.6, 0.7, 0, 0.75,0.5, 0.2, 0.4],
  [0.2, 0.3, 0.9, 0.4, 0.1, -1, 0, 0.1, 0.4, 0.1, -0.8, 0, 0.2, 1, 0.5],
  [1, 0.8, 0, 0.1, 0.4, 0, 1, 0.5, 0, 1, 0.4, -1, 0.3, 0.4, 0.1],
  [0.5, -0.1, 0.2, 1, 0.1, 0, -0.5, 1, 0, 0.4, 1, 0.5, 0, 0.75,0.5],
  [0, 1, 1, 0.2, 0.6, 0.4, 0, 0, 1, 0.6, -1, 0, 0.1, 0.4, 0.1],
  [0.75, 0, -0.3, 0.9, 0.7, 0.1, 1, -0.4, 0.6, 1, -1, 0.3, 0.4, 0.1, 1],
  [0.8, 0.2, 0.4, -1, 0.3, 0.4, 0.1, 1, 0.2, 0.9, 0.9, 0.7, 0.1, 1, -0.4],
  [0, -0.4, 0, 0.3, 1, 0.1, 0.4, 0, -0.6, 0.7, 0, 0.75,0.5, 0.2, 0.4],
  [0.2, 0.3, 0.9, 0.4, 0.1, -1, 0, 0.1, 0.4, 0.1, -0.8, 0, 0.2, 1, 0.5],
  [1, 0.8, 0, 0.1, 0.4, 0, 1, 0.5, 0, 1, 0.4, -1, 0.3, 0.4, 0.1],
  [0.5, -0.1, 0.2, 1, 0.1, 0, -0.5, 1, 0, 0.4, 1, 0.5, 0, 0.75,0.5]
];

