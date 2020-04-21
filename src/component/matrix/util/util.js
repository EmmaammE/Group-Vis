import * as d3 from 'd3';

export function scaleFactory(width,data,startColor,endColor){
  
  // console.log("numcols",data)
  const numcols = data.length;
  
  var maxValue = d3.max(data, function(layer) { return d3.max(layer, function(d) { return d; }); });
  var minValue = d3.min(data, function(layer) { return d3.min(layer, function(d) { return d; }); });
  
  
  var xy = d3.scaleBand()
  .domain(d3.range(numcols))
  .range([0, width])
  .paddingInner(0.3)
  .paddingOuter(0.15);


  var colorMap = d3.scaleLinear()
  .domain([0,maxValue])
  .range(["#dddddd", endColor]);

  return { maxValue, xy,colorMap}
}

export function sortMatrixPerson(matrixView){
  if(matrixView.matrixPerson.length==0){
    return matrixView
  }
  let matrixData = matrixView.matrixData
  let matrixPerson = matrixView.matrixPerson
  // if()
  matrixPerson = matrixPerson.sort((a,b)=>b.number-a.number).filter(v=>v.number>0)
  // console.log("matrixView---sort",matrixPerson)
  
  let preToNewIndex = {}
  let newMatrixData = []
  let newMatrixPerson = matrixPerson.map((v,i)=>{
    newMatrixData[i] = new Array(matrixPerson.length).fill(0)
    v.newIndex = i
    preToNewIndex[v.preIndex] = v.newIndex
    return {
      name:v.name,
      id:v.personId,
      isChoose:false
    }
    
    // v.name
  })
  for(let i=0;i<matrixData.length;i++){
    let b = matrixData[i].length
    for(let j=0;j<matrixData[i].length;j++){
      let a = matrixData[i][j]
      // console.log("matrixData,..",a)
      if(matrixData[i][j]!=undefined&&i<j){
        // console.log("i,i",i,j)
        let newI = preToNewIndex[i]
        let newJ = preToNewIndex[j]
        newMatrixData[newI][newJ] = matrixData[i][j]
        newMatrixData[newJ][newI] = matrixData[i][j]
      }
    }
  }
  matrixPerson = newMatrixPerson
  matrixData = newMatrixData
  return {matrixData,matrixPerson}
}