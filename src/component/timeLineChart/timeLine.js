import * as d3 from 'd3';

export function TimeLine(options){
  let margin = {top: 10, right: 20, bottom: 35, left: 20},
        width = options.width-margin.left-margin.right,
        height = options.height-margin.top-margin.bottom,
        data = options.data,
        container = options.container,
        // labelsData = options.labels,
        startColor = options.start_color,
        endColor = options.end_color;
    console.log("dsfjslfjsklf,1")
    
    if(!data){
        throw new Error('please pass data')
    }

    if(!Array.isArray(data) || !data.length || !Array.isArray(data[0].info)){
        throw new Error('It should be a 2-D array');
    }

    let maxValue = d3.max(data, function(layer) { return d3.max(layer.info, function(d) { return d.value; }); });
    let minValue = d3.min(data, function(layer) { return d3.min(layer.info, function(d) { return d.value; }); });

    let maxDistance = d3.max(data, function(layer) { return d3.max(layer.info, function(d) { return d.distance; }); });
    let minDistance = d3.min(data, function(layer) { return d3.min(layer.info, function(d) { return d.distance; }); });

    let numrows = data.length

    let svg = d3.select(container).append("svg")
        .attr("width",width+margin.left+margin.right)
        .attr("height",height+margin.top+margin.bottom)
        .append("g")
        .attr("transform",`translate(${margin.left},${margin.top})`);


    let xScale = d3.scaleLinear()
        .domain([minDistance,maxDistance])
        .range([100,width])

    let yScale = d3.scaleLinear()
        .domain([0,numrows])
        .range([0,height])

    let colorMap = d3.scaleLinear()
        .domain([minValue,0,maxValue])
        .range([startColor,"white",endColor])

    let row = svg.selectAll(".row")
        .data(data)
        .enter().append("g")
        .attr("class","row")
        .attr("transform",function(d,i){
            return `translate(0,${yScale(i)})`});

    // 绘制线
    row.append("line")
        .attr("x1",0)
        .attr("x2",width)
        .attr("y1",height/numrows)
        .attr("y2",height/numrows)
        .attr("stroke-width","0.3px")
        .attr("stroke", "black")

    // 绘制文字
    row.append("text")
        .attr("x",0)
        .attr("y",height/numrows/2)
        .attr("dy","0.5em")
        .attr("font-size","0.75em")
        .text((d,i)=>{
            return d.name
        })


    // 绘制圆点
    let circleGroup = row.append("g")
        .attr("class","circleGourp")

    let circleLine = circleGroup.selectAll(".circleLine")
        .data(d=>d.info)
        .enter().append("circle")
        .attr("class","singleCircle")
        .attr("transform",`translate(0,${height/numrows/2})`)
        .attr("cx",d=>xScale(d.distance))
        .attr("cy",0)
        .attr("r",4)
        .style("stroke","white")
        .style("stoke-width","0.2px")
        .attr("fill",d=>colorMap(d.value))

    let xAxisBack = svg.append("rect")
        .style("width",width)
        .style("height",20)
        .style("fill","#cccccc")
        .attr("transform",`translate(0,${height})`)

    // 绘制下面的标尺
    let xAxis = d3.axisBottom(xScale).ticks(7).tickSize(0)

    svg.append("g")
        .attr("class","xAxis")
        .attr("transform",`translate(0,${height+5})`)
        .call(xAxis)
        .attr("font-size","0.75em")
        .attr("text-anchor", "end")
        //  删除坐标轴长线
        .call(g => g.select(".domain").remove())

    
    // 绘制相关性虚线
    let markValue = [3,5,9]
    let markLine = svg.append("g")
        .attr("class","mark")
        .selectAll(".markLine")
        .data(markValue)
        .join("line")
        .attr("class","markLine")
        .attr("x1",d=>xScale(d))
        .attr("x2",d=>xScale(d))
        .attr("y1",5)
        .attr("y2",height-5)
        .attr("stroke", endColor)
        .attr("stroke-dasharray","1 1")
}

export let circleData = [
  {name: "SuShi", info:[{distance:1,value:0.2,discription:"this is 1 discription"},
      {distance:2,value:0.8,discription:"this is 2  discription"},
      {distance:4,value:0.1,discription:"this is 3 discription"},
      {distance:6,value:-0.4,discription:"this is 4 discription"},
      {distance:10,value:0.9,discription:"this is 5 discription"},
      {distance:5,value:0.8,discription:"this is 6 discription"},
      {distance:3,value:0.1,discription:"this is 3 discription"},
      {distance:6.2,value:-0.4,discription:"this is 4 discription"},
      {distance:11,value:0.9,discription:"this is 5 discription"},
      {distance:11.1,value:0.8,discription:"this is 6 discription"}
      ]},
  {name: "WangAnshi", info:[{distance:1,value:0.2,discription:"this is 1 discription"},
      {distance:12,value:-0.4,discription:"this is 12  discription"},
      {distance:14,value:0.1,discription:"this is 13 discription"},
      {distance:5,value:0.2,discription:"this is 42 discription"},
      {distance:10,value:-0.9,discription:"this is 45 discription"},
      {distance:1.9,value:0.8,discription:"this is 76 discription"},
      {distance:2.10,value:0.1,discription:"this is 13 discription"},
      {distance:2.25,value:0.2,discription:"this is 42 discription"},
      {distance:2.4,value:0.3,discription:"this is 45 discription"},
      {distance:2.6,value:0.4,discription:"this is 76 discription"}
      ]},
  {name: "SuZhe", info:[{distance:1,value:0.2,discription:"this is 1 discription"},
      {distance:6,value:0.5,discription:"this is 32  discription"},
      {distance:4,value:-0.1,discription:"this is 33 discription"},
      {distance:2,value:-0.3,discription:"this is 34 discription"},
      {distance:9,value:0.1,discription:"this is 35 discription"},
      {distance:8,value:-0.9,discription:"this is 36 discription"},
      {distance:8.2,value:-0.1,discription:"this is 33 discription"},
      {distance:8.4,value:-0.3,discription:"this is 34 discription"},
      {distance:8.6,value:-0.4,discription:"this is 35 discription"},
      {distance:8.8,value:-0.6,discription:"this is 36 discription"}
      ]},
  {name: "OuYangxiu", info:[{distance:1,value:0.2,discription:"this is 1 discription"},
      {distance:9,value:-0.5,discription:"this is 452  discription"},
      {distance:4,value:0.1,discription:"this is 453 discription"},
      {distance:9,value:-0.4,discription:"this is 454 discription"},
      {distance:4,value:0.3,discription:"this is 4455 discription"},
      {distance:9,value:-0.9,discription:"this is 456 discription"},
      ]},
  {name: "ZhengXie", info:[{distance:1,value:0.2,discription:"this is 1 discription"},
      {distance:2,value:0.2,discription:"this is 52  discription"},
      {distance:9,value:0.1,discription:"this is 53 discription"},
      {distance:6,value:0.4,discription:"this is 54 discription"},
      {distance:10,value:-0.9,discription:"this is 55 discription"},
      {distance:4,value:0.3,discription:"this is 56 discription"},
      ]},
  {name: "SuShi", info:[{distance:1,value:0.2,discription:"this is 1 discription"},
      {distance:2,value:0.8,discription:"this is 2  discription"},
      {distance:4,value:0.1,discription:"this is 3 discription"},
      {distance:6,value:-0.4,discription:"this is 4 discription"},
      {distance:10,value:0.9,discription:"this is 5 discription"},
      {distance:12,value:0.8,discription:"this is 6 discription"},
      ]},
  {name: "WangAnshi", info:[{distance:1,value:0.2,discription:"this is 1 discription"},
      {distance:12,value:-0.4,discription:"this is 12  discription"},
      {distance:14,value:0.1,discription:"this is 13 discription"},
      {distance:5,value:0.2,discription:"this is 42 discription"},
      {distance:10,value:-0.9,discription:"this is 45 discription"},
      {distance:2,value:0.8,discription:"this is 76 discription"},
      ]},
  {name: "SuZhe", info:[{distance:1,value:0.2,discription:"this is 1 discription"},
      {distance:6,value:0.9,discription:"this is 32  discription"},
      {distance:4,value:-0.1,discription:"this is 33 discription"},
      {distance:2,value:-0.3,discription:"this is 34 discription"},
      {distance:9,value:0.1,discription:"this is 35 discription"},
      {distance:2,value:0.3,discription:"this is 36 discription"},
      ]},
  {name: "OuYangxiu", info:[{distance:1,value:0.2,discription:"this is 1 discription"},
      {distance:9,value:-0.5,discription:"this is 452  discription"},
      {distance:4,value:0.1,discription:"this is 453 discription"},
      {distance:9,value:-0.4,discription:"this is 454 discription"},
      {distance:4,value:0.3,discription:"this is 4455 discription"},
      {distance:9,value:-0.9,discription:"this is 456 discription"},
      ]},
  {name: "ZhengXie", info:[{distance:1,value:0.2,discription:"this is 1 discription"},
      {distance:0,value:0.2,discription:"this is 52  discription"},
      {distance:9,value:0.1,discription:"this is 53 discription"},
      {distance:6,value:0.4,discription:"this is 54 discription"},
      {distance:10,value:-0.9,discription:"this is 55 discription"},
      {distance:4,value:0.3,discription:"this is 56 discription"},
      ]}
];