import * as d3 from 'd3';
import exampleData from '../../assets/geojson/b.json';
import topicData from '../../assets/geojson/a.json';



export function rectLeafScale(data,width,height){
    let maxX = d3.max(data,function(layer){return layer.x})
    let minX = d3.min(data,function(layer){return layer.x})

    let maxY = d3.max(data,function(layer){return layer.y})
    let minY = d3.min(data,function(layer){return layer.y})

    // console.log("maxX,maxY",minX,minY,maxX,maxY,width,height)
    let xScale = d3.scaleLinear()
    .domain([minX,maxX])
    .range([0,width])

    let yScale = d3.scaleLinear()
        .domain([minY,maxY])
        .range([0,height])
    return {xScale,yScale}
}

export function rectTree(width,height,topicData){
    
    
    let weightData = topicData.map(v=>v.weight)
    let children = weightData.map((v,i)=>({
        name:i,
        value:v
    }))
    const data = {
        name:"root",
        children
    }

    //treemap是一个函数
    const treemap = d3.treemap()
    .padding(1)
    .round(true);

    // console.log("treemap",treemap)

    let root = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    treemap.size([width, height]);
    const leaves = treemap(root).leaves();

    let rectTreeData = root['children'].map((v,i)=>({
        "x0":v.x0,
        "y0":v.y0,
        "x1":v.x1,
        "y1":v.y1
    }))
    return rectTreeData
}


export function filterTimeLine(data){
    let personIndex = 0;
    let personToIndex = {}
    let tLabelData = []
    let tCircleData=[]
    let tTopicExist = []
    for(let v of data){
        for (let k of v.cData){
            if(k.time>0&&k.persons.length>0){
                for(let h of k.persons){
                    if(personToIndex[h]==undefined){
                        personToIndex[h]=personIndex
                        tLabelData[personIndex] = {
                            name:h,
                            number:0,
                            preIndex:personIndex
                        }
                        tCircleData[personIndex] = []
                        tTopicExist[personIndex] = {}
                        personIndex++
                    }
                    if(!tTopicExist[personToIndex[h]][k.discription]){
                        tTopicExist[k.discription]=1
                        tLabelData[personToIndex[h]].number++
                        tCircleData[personToIndex[h]].push({
                            discription:k.discription,
                            distance:k.time
                        })
                    }
                }
            }
        }
    }
    return {tLabelData,tCircleData}
    
}
export function filterMatrixView(data){
    let personIndex = 0;
    let personToIndex = {}
    let matrixPerson = []
    let matrixData = []
    for(let v of data){
        for(let k of v.cData){
            if(k.persons.length>1){
                for(let p of k.persons){
                    if(personToIndex[p]==undefined){
                        personToIndex[p] = personIndex
                        matrixPerson[personIndex] = {
                            name:p,
                            number:0,
                            preIndex:personIndex,
                            newIndex:0
                        }
                        matrixData[personIndex]=[]
                        personIndex++
                    }
                    matrixPerson[personToIndex[p]].number++
                }
                for(let i=0;i<k.persons.length;i++){
                    for(let j=0;j<k.persons.length;j++){
                        let a = personToIndex[k.persons[i]]
                        let b = personToIndex[k.persons[j]]
                        if(a<b){
                            if(matrixData[a][b]==undefined){
                                matrixData[a][b]=1
                            }else{
                               matrixData[a][b]+=1 
                            }
                        }
                    }         
                }
            }
        }
    }
    return {matrixData,matrixPerson}
}
export function filterSelectList(data){
    let newData = []
    for(let singleData of data){
        for(let k of singleData.cData){
             newData.push(k.discription)
        }
    }
    return newData
}

export function filterBrushSelectList(data){
    let newData = []
    for(let singleData of data){
        for(let k of singleData.cData){
            if(k.isChoose){
                newData.push(k.discription)
            }
        }
    }
    return newData
}

export function filterMapView(data){
    let mapViewData = {}
    for(let singleData of data){
        for(let k of singleData.cData){
            k.personsId.forEach((v,i)=>{
                if(!mapViewData[v]){
                    mapViewData[v] = k.persons[i]
                }
            })
        }
    }
    return mapViewData
}

export function deepClone(Obj) {   
    var buf;   
    if (Obj instanceof Array) {   
        buf = [];  //创建一个空的数组 
        var i = Obj.length;   
        while (i--) {   
            buf[i] = deepClone(Obj[i]);   
        }   
        return buf;   
    }else if (Obj instanceof Object){   
        buf = {};  //创建一个空对象 
        for (var k in Obj) {  //为这个对象添加新的属性 
            buf[k] = deepClone(Obj[k]);   
        }   
        return buf;   
    }else{   
        return Obj;   
    }   
}  
export function reduceRelationData(data,n){
    data.sort((a,b)=>{
        return b[2]-a[2]
    })
    // console.log("filterRealataion",data)
    return data.slice(0,n)
}
export function smallize(data,n){
    let i = 0;
    while(i<data.length){
        //两个主题跨度超过n，不便于显示
        if(data[i][0]-data[i][1]>=n){
            data.splice(i,1)
        }else{
            i++
        }
    }
}
export function handleData(data1){
    let data = topicData
    // console.log("exampleData",exampleData)
    // console.log("topicData",topicData)
    let labelData=[]
    let label2topics=data.label2topics
    let topicPos = data.topic2sentence_positions
    let pmiNode = data.pmi_node
    for(let i in label2topics){
        if(label2topics[i].length>0){
            labelData = labelData.concat(label2topics[i])
        }
        // else{
        //     labelData.push(i)
        // }
    }
    let mapTopicToIndex = new Map()
    //花瓣滑块默认数据
    let fData = new Array(labelData.length).fill(0.5)
    let cData= labelData.map((v,i)=>{
        fData[i] = {
            topic:v,
            value:0.5
        }
        mapTopicToIndex[v]=i
        if(topicPos[v]){
            let values =  Object.values(topicPos[v])
            let keys = Object.keys(topicPos[v])
            return  values.map((v,i)=>{
                return {
                    distance:v,
                    value:v,
                    discription:keys[i]
                }
            })
        }else{
            return []
        }
        
    })
    let relationData = []

    for(let i in pmiNode){
        let node = pmiNode[i]
        for(let j in node){
            if(node[j]!=0&&mapTopicToIndex[i]>mapTopicToIndex[j]){
                let value = node[j]>0?1:-1
                relationData.push([mapTopicToIndex[i],mapTopicToIndex[j],value])
            }
        }
    }
    return {labelData,cData,relationData,fData}
}

export function scaleFactory(width,height,data,startColor,endColor){
  
  const numcols = data.length;
  
  let maxValue = d3.max(data, function(layer) { return d3.max(layer, function(d) { return d.value; }); });
  let minValue = d3.min(data, function(layer) { return d3.min(layer, function(d) { return d.value; }); });
  
  let maxDistance = d3.max(data, function(layer) { return d3.max(layer, function(d) { return d.distance; }); });
   let minDistance = d3.min(data, function(layer) { return d3.min(layer, function(d) { return d.distance; }); });
  
  var xScale = d3.scaleLinear()
  .domain([minDistance,maxDistance])
  .range([0,width])

  var xScaleR = d3.scaleLinear()
  .domain([0,width])
  .range([minDistance,maxDistance])
  

  var yScale = d3.scaleLinear()
  .domain([0,numcols])
  .range([0,height])

  var yScaleR =  d3.scaleLinear()
  .domain([0,height])
  .range([0,numcols])

//   var colorMap = d3.scaleLinear()
//   .domain([minValue,minValue/2,0,maxValue/2,maxValue])
//   .range(["black","white", "black","white","black"]);

  var colorMap = d3.scaleLinear()
  .domain([minValue,maxValue])
  .range(["gray","gray"]);
//   .range([startColor,"white", endColor,"white",startColor]);

  let n = 30;
  let value = []

  let vScale = d3.scaleLinear()
  .domain([0,n-1])
  .range([0,height])
  for(let i=0;i<n;i++){
      value.push("60")
  }

  return { yScale,xScale,colorMap,value,vScale,yScaleR,xScaleR}
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


