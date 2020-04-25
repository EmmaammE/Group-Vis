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

  let matrixPerson = matrixView.matrixPerson
  
  let pIndex = matrixPerson.map(v=>v.preIndex)
  //将number为0的人过滤掉
  // pIndex = pIndex.filter(v=>matrixPerson[v].number>0)
  if(pIndex.length==0){
    return matrixView
  }
  let matrixData = matrixView.matrixData

  // if()

  let edgeData = []

  for(let i=0;i<matrixData.length;i++){
    for(let j=0;j<matrixData[i].length;j++){
      if(matrixData[i][j]!=undefined){
        edgeData.push({
          source:i,
          target:j,
          weight:matrixData[i][j]
        })
        edgeData.push({
          source:j,
          target:i,
          weight:matrixData[i][j]
        })
      }
    }
  }


  let louvain = require('louvain');
  let community = louvain.jLouvain()
                  .nodes(pIndex)
                  .edges(edgeData)
  let person2group  = community();

  // console.log("matrix-util",person2group,matrixPerson)
  let groups = []
  for(let group in person2group){
    let groupIndex = person2group[group]
    if(groups[groupIndex]==undefined){
      groups[groupIndex] = {}
      groups[groupIndex].member = []
      groups[groupIndex].number = 0
    }
    groups[groupIndex].member.push(Number(group))
    groups[groupIndex].number+= matrixPerson[Number(group)].number
  }

  // 组间进行排序
  groups.sort((a,b)=>b.number-a.number)

  let finalIndex = []
  groups.forEach(v=>{
    // 组内部进行排序
    v.member.sort((a,b)=>matrixPerson[b].number-matrixPerson[a].number)
    // concat不改变原数组，同样filter也不改变原数组
    finalIndex = finalIndex.concat(v.member)
  })
  let hashMap = []
  finalIndex.forEach((v,i)=>{
    hashMap[v] = i
  })

  // matrixPerson = matrixPerson.filter(v=>v.number>0)
  matrixPerson.sort((a,b)=>hashMap[a.preIndex]-hashMap[b.preIndex])
  // console.log("finalIndex",finalIndex,matrixPerson)
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
  })
  for(let i=0;i<matrixData.length;i++){
    for(let j=0;j<matrixData.length;j++){
      if(matrixData[i][j]!=undefined){
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