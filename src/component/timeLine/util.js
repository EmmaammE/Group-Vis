import * as d3 from 'd3';

export function scaleFactory(width,height,tLabelData,tCircleData,startColor,endColor){
  
  let xScale,yScale,colorMap,timeData,aScale,tScale;
  const numcols = tLabelData.length;

  if(numcols==0){
    return { yScale,xScale,colorMap,timeData,tScale}
  }
  let flag =false
  tCircleData.forEach(v=>{
    if(v.length>0){
      flag = true
    }
  })

  if(flag==false){
    return { yScale,xScale,colorMap,timeData,tScale}
  }
  
  let maxValue = d3.max(tCircleData, function(layer) { return d3.max(layer, function(d) { return d.distance; }); });
  let minValue = d3.min(tCircleData, function(layer) { return d3.min(layer, function(d) { return d.distance; }); });
  
  let maxDistance = d3.max(tCircleData, function(layer) { return d3.max(layer, function(d) { return d.distance; }); });
  let minDistance = d3.min(tCircleData, function(layer) { return d3.min(layer, function(d) { return d.distance; }); });
  
  xScale = d3.scaleLinear()
    .domain([minDistance,maxDistance])
    .range([0,width])

  yScale = d3.scaleLinear()
    .domain([0,numcols])
    .range([0,height])

  colorMap = d3.scaleLinear()
    .domain([minValue,maxValue])
    .range([startColor, endColor]);

  let n = 8;
  timeData = []

  aScale = d3.scaleLinear()
    .domain([0,n-1])
    .range([minDistance,maxDistance])

  for(let i=0;i<n;i++){
      timeData.push(aScale(i).toFixed(0))
  }

  tScale = d3.scaleLinear()
    .domain([0,n-1])
    .range([0,width])

  return { yScale,xScale,colorMap,timeData,tScale}
}

export function sortTimeLineData(timeLineData){
  let tLabelData = timeLineData.tLabelData
  let tCircleData = timeLineData.tCircleData
  tLabelData.sort((a,b)=>b.number-a.number)
  tCircleData.sort((a,b)=>b.length-a.length)
  return {tLabelData,tCircleData}
}

// 绘制相关性虚线
export const lineData = []




