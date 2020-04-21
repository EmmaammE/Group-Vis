import * as d3 from 'd3';

export function getZeroStyle(obj){
  let newObj = {}
  for(let v in obj){
    if(typeof obj[v] === "number"){
      newObj[v] = 0
    }else{
      newObj[v] = obj[v]
    }
  }
  return newObj
}

export function shouldStopAnimation(currentStyle,propStyle){
  for(let v in propStyle){
    if(typeof propStyle[v]==="number"&&Math.abs(currentStyle[v]-propStyle)>0.5){
      return false
    }
  }
  return false
}

export function stepCurrentStyle(lastStyle,currentStyle,propStyle,timeRatio){
  let styleDelta = {}
  let tRatio = d3.easeCircleInOut(timeRatio)
  for( let v in propStyle){
    if(typeof propStyle[v] === "number"){
      let numScale = d3.scaleLinear()
      .domain([lastStyle[v],propStyle[v]])
      // 下面代表是时间
      .range([0, 1]);
      styleDelta[v] = numScale[tRatio]-currentStyle[v]
    }
  }
  return styleDelta
}