import * as d3 from 'd3';

export default function scaleFactory(width,data,startColor,endColor){
  
  const numcols = data.length;
  
  var maxValue = d3.max(data, function(layer) { return d3.max(layer, function(d) { return d; }); });
  var minValue = d3.min(data, function(layer) { return d3.min(layer, function(d) { return d; }); });
  
  
  var xy = d3.scaleBand()
  .domain(d3.range(numcols))
  .range([0, width])
  .paddingInner(0.3)
  .paddingOuter(0.15);


  var colorMap = d3.scaleLinear()
  .domain([minValue,0,maxValue])
  .range([startColor,"white", endColor]);

  return { xy,colorMap}
}
