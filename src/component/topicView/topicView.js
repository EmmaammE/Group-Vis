import * as d3 from 'd3';

export function TopicView(options){
  let margin = {top: 90, right: 20, bottom: 10, left: 70},
   width = options.width-margin.left-margin.right,
   height = options.height-margin.top-margin.bottom,
   data = options.data,
   container = options.container,
   // labelsData = options.labels,
   startColor = options.start_color,
   endColor = options.end_color;

   let n = 30;
   let value = []
   for(let i=0;i<n;i++){
       value.push("60")
   }

   // console.log("dsfjslfjsklf,1")
     
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

   let yScale = d3.scaleLinear()
       .domain([minDistance,maxDistance])
       .range([0,height])

    let vScale = d3.scaleLinear()
      .domain([0,n])
      .range([0,height])

   let xScale = d3.scaleLinear()
       .domain([0,numrows])
       .range([0,width])

   let colorMap = d3.scaleLinear()
       .domain([minValue,0,maxValue])
       .range([startColor,"white",endColor])

   let column = svg.selectAll(".column")
       .data(data)
       .enter().append("g")
       .attr("class","column")
       .attr("transform",function(d,i){
           return `translate(${xScale(i)},0)`});

   // 绘制文字
   column.append("text")
       .attr("x",0)
       .attr("y",0)
       .attr("dy","0.5em")
       .attr("transform","translate(0,-80) rotate(90) ")
       .attr("font-size","10px")
       .text((d,i)=>{
           return d.name
       })


   // 绘制圆点
   let circleGroup = column.append("g")
       .attr("class","circleGourp")

   let circleLine = circleGroup.selectAll(".circleLine")
       .data(d=>d.info)
       .enter().append("circle")
       .attr("class","singleCircle")
       .attr("transform",`translate(0,0)`)
       .attr("cx",0)
       .attr("cy",d=>yScale(d.distance))
       .attr("r",4)
       .attr("fill",d=>colorMap(d.value))
   
   // console.log("value",value)

   // 绘制下面的标尺
   // let yAxis = d3.axisLeft(yScale).ticks(20).tickSize(0);
   // yAxis.tickValues(value)


   let yValue = svg.append("g")
       .selectAll(".yValue")
       .data(value)
       .enter()
       .append("g")
       .attr("class","yValue")
       .attr("transform",`translate(-40,0)`)

   yValue.append("text")
       .attr("x",0)
       .attr("y",0)
       .attr("dy","0.5em")
       .attr("transform",(d,i)=>`translate(0,${vScale(i)})`)
       .attr("font-size","10px")
       .text((d,i)=>{
           return d
       })

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
      {distance:5,value:0.7,discription:"this is 2  discription"},
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
      {distance:2,value:-0.3,discription:"this is 34 discription"},
      {distance:9,value:0.1,discription:"this is 35 discription"},
      {distance:8,value:-0.9,discription:"this is 36 discription"},
      {distance:8.2,value:-0.1,discription:"this is 33 discription"},
      {distance:8.4,value:-0.3,discription:"this is 34 discription"},
      {distance:8.6,value:-0.4,discription:"this is 35 discription"},
      {distance:4,value:0.3,discription:"this is 4455 discription"},
      {distance:9,value:-0.9,discription:"this is 456 discription"},
      ]},
  {name: "ZhengXie", info:[{distance:1,value:0.2,discription:"this is 1 discription"},
      {distance:2,value:0.2,discription:"this is 52  discription"},
      {distance:9,value:0.1,discription:"this is 53 discription"},
      {distance:2,value:-0.3,discription:"this is 34 discription"},
      {distance:9,value:0.1,discription:"this is 35 discription"},
      {distance:8,value:0.9,discription:"this is 36 discription"},
      {distance:7.2,value:0.7,discription:"this is 33 discription"},
      {distance:7.4,value:0.3,discription:"this is 34 discription"},
      {distance:7.8,value:0.4,discription:"this is 35 discription"},
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
  {name: "OuYangxiu", info:[{distance:1,value:0.2,discription:"this is 1 discription"},
      {distance:9,value:-0.5,discription:"this is 452  discription"},
      {distance:4,value:0.1,discription:"this is 453 discription"},
      {distance:2,value:-0.3,discription:"this is 34 discription"},
      {distance:9,value:0.1,discription:"this is 35 discription"},
      {distance:5,value:-0.9,discription:"this is 36 discription"},
      {distance:5.3,value:-0.1,discription:"this is 33 discription"},
      {distance:5.7,value:-0.3,discription:"this is 34 discription"},
      {distance:5.9,value:-0.4,discription:"this is 35 discription"},
      {distance:9,value:-0.4,discription:"this is 454 discription"},
      {distance:4,value:0.3,discription:"this is 4455 discription"},
      {distance:9,value:-0.9,discription:"this is 456 discription"},
      ]},
  {name: "ZhengXie", info:[{distance:1,value:0.2,discription:"this is 1 discription"},
      {distance:0,value:0.2,discription:"this is 52  discription"},
      {distance:9,value:0.1,discription:"this is 53 discription"},
      {distance:2,value:-0.3,discription:"this is 34 discription"},
      {distance:9,value:0.1,discription:"this is 35 discription"},
      {distance:3,value:-0.9,discription:"this is 36 discription"},
      {distance:3.2,value:-0.1,discription:"this is 33 discription"},
      {distance:3.4,value:-0.3,discription:"this is 34 discription"},
      {distance:3.6,value:-0.4,discription:"this is 35 discription"},
      {distance:6,value:0.4,discription:"this is 54 discription"},
      {distance:10,value:-0.9,discription:"this is 55 discription"},
      {distance:4,value:0.3,discription:"this is 56 discription"},
      ]},
  {name: "SuShi", info:[{distance:1,value:0.2,discription:"this is 1 discription"},
      {distance:2,value:0.8,discription:"this is 2  discription"},
      {distance:4,value:0.1,discription:"this is 3 discription"},
      {distance:2,value:-0.3,discription:"this is 34 discription"},
      {distance:9,value:0.1,discription:"this is 35 discription"},
      {distance:8,value:-0.9,discription:"this is 36 discription"},
      {distance:12.0,value:0.1,discription:"this is 33 discription"},
      {distance:12.4,value:0.3,discription:"this is 34 discription"},
      {distance:12.9,value:0.4,discription:"this is 35 discription"},
      {distance:6,value:-0.4,discription:"this is 4 discription"},
      {distance:10,value:0.9,discription:"this is 5 discription"},
      {distance:12,value:0.8,discription:"this is 6 discription"},
      ]},
  {name: "WangAnshi", info:[{distance:1,value:0.2,discription:"this is 1 discription"},
      {distance:12,value:-0.4,discription:"this is 12  discription"},
      {distance:14,value:0.1,discription:"this is 13 discription"},
      {distance:2,value:-0.3,discription:"this is 34 discription"},
      {distance:9,value:0.1,discription:"this is 35 discription"},
      {distance:8,value:-0.9,discription:"this is 36 discription"},
      {distance:7.1,value:0.1,discription:"this is 33 discription"},
      {distance:7.4,value:0.3,discription:"this is 34 discription"},
      {distance:7.7,value:0.4,discription:"this is 35 discription"},
      {distance:5,value:0.2,discription:"this is 42 discription"},
      {distance:10,value:-0.9,discription:"this is 45 discription"},
      {distance:2,value:0.8,discription:"this is 76 discription"},
      ]},
  {name: "SuZhe", info:[{distance:1,value:0.2,discription:"this is 1 discription"},
      {distance:6,value:0.9,discription:"this is 32  discription"},
      {distance:4,value:-0.1,discription:"this is 33 discription"},
      {distance:2,value:-0.3,discription:"this is 34 discription"},
      {distance:9,value:0.1,discription:"this is 35 discription"},
      {distance:2,value:-0.3,discription:"this is 34 discription"},
      {distance:9,value:0.1,discription:"this is 35 discription"},
      {distance:6,value:-0.9,discription:"this is 36 discription"},
      {distance:6.2,value:-0.1,discription:"this is 33 discription"},
      {distance:6.4,value:-0.3,discription:"this is 34 discription"},
      {distance:6.8,value:-0.4,discription:"this is 35 discription"},
      {distance:2,value:0.3,discription:"this is 36 discription"},
      ]},
  {name: "OuYangxiu", info:[{distance:1,value:0.2,discription:"this is 1 discription"},
      {distance:9,value:-0.5,discription:"this is 452  discription"},
      {distance:4,value:0.1,discription:"this is 453 discription"},
      {distance:9,value:-0.4,discription:"this is 454 discription"},
      {distance:2,value:-0.3,discription:"this is 34 discription"},
      {distance:9,value:0.1,discription:"this is 35 discription"},
      {distance:4,value:-0.9,discription:"this is 36 discription"},
      {distance:4.2,value:-0.1,discription:"this is 33 discription"},
      {distance:4.4,value:-0.3,discription:"this is 34 discription"},
      {distance:4.6,value:-0.4,discription:"this is 35 discription"},
      {distance:5,value:0.3,discription:"this is 4455 discription"},
      {distance:9,value:-0.9,discription:"this is 456 discription"},
      ]},
  {name: "ZhengXie", info:[{distance:1,value:0.2,discription:"this is 1 discription"},
      {distance:0,value:0.2,discription:"this is 52  discription"},
      {distance:9,value:0.1,discription:"this is 53 discription"},
      {distance:2,value:-0.3,discription:"this is 34 discription"},
      {distance:9,value:0.1,discription:"this is 35 discription"},
      {distance:8,value:-0.9,discription:"this is 36 discription"},
      {distance:8.2,value:-0.1,discription:"this is 33 discription"},
      {distance:8.4,value:-0.3,discription:"this is 34 discription"},
      {distance:8.6,value:-0.4,discription:"this is 35 discription"},
      {distance:6,value:0.4,discription:"this is 54 discription"},
      {distance:10,value:-0.9,discription:"this is 55 discription"},
      {distance:4,value:0.3,discription:"this is 56 discription"},
      ]}
];