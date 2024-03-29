import * as d3 from 'd3';
import exampleData from '../../assets/geojson/b.json';
import topicData from '../../assets/geojson/a.json';
// import * as WordCloudGenerator from './wordCloud';
// import louvain from 'louvain' 


export function dealCompare(topicDataA,topicDataB,topicDataAB){
    // 辨别该叙述是属于A还是属于B,或者属于共同的
    let discription2Part = {}
    topicDataA.forEach(topic=>{
        topic.cData.forEach(leaf=>{
            if(discription2Part[leaf.id]==undefined){
                discription2Part[leaf.id] = 'A'
            }
        })
    })
    topicDataB.forEach(topic=>{
        topic.cData.forEach(leaf=>{
            if(discription2Part[leaf.id]==undefined){
                discription2Part[leaf.id] = 'B'
            }else if(discription2Part[leaf.id]=='A'){
                discription2Part[leaf.id]='AB'
            }
        })
    })
    // topicDataAB的每个叶子打上类别标签，分为3类
    topicDataAB.forEach(topic=>{
        topic.cData.forEach(leaf=>{
            if(discription2Part[leaf.id]==undefined){
                leaf.part = 3
            }else if(discription2Part[leaf.id] =='A'){
                leaf.part = 0
            }else if(discription2Part[leaf.id] =='B'){
                leaf.part = 1
            }else{
                leaf.part = 2
            }
        })
    })
    return topicDataAB
}

export function maxItem(data,that){
    let itemSets = []
    let item2Index = {}
    let index = 0
    let nameData = []
    let len = data.length
    let minNum = Number((len*0.3).toFixed(0))
    data.forEach(d=>{
        let singleSet = []
        d.split(", ").forEach(v=>{
            let tempName = that.props.dict[Number(v)]
            // 追加去重功能singleSet.indexOf(tempName)
            if(tempName&&singleSet.indexOf(tempName)===-1&&v!=="-1"&&tempName!=="0"&&tempName!=="None"&&tempName!=="1"&&tempName!=="[未详]"&&tempName!=="AssocEvent"&&tempName!=="EntryEvent"){
                if(item2Index[tempName]==undefined){
                    item2Index[tempName] = index
                    index++
                    itemSets.push({
                        id:v,
                        number:0,
                        name:tempName
                    })
                }
                itemSets[item2Index[tempName]].number++
                singleSet.push(tempName)
            } 
        })
        nameData.push(singleSet)
    })
    // 对item进行排序，依据数量进行
    itemSets.sort((a,b)=>b.number-a.number)
    let i = 0;
    let item2Number = {}
    // 统计前1/2的item数量即可，其余的item会被过滤
    while(i++<itemSets.length/2){
        item2Number[itemSets[i].name] = itemSets[i].number
    }



    //剔除掉序列中数量少的那部分词语,并对序列进行排序
    nameData.forEach(nameSet=>{
        let j = 0
        while(j<nameSet.length){
            if(item2Number[nameSet[j]]==undefined){
                nameSet.splice(j,1)
            }else{
                j++
            }
        }
        nameSet.sort((a,b)=>{
            return item2Number[a]-item2Number[b]
        })
    })
    console.log("FP-GROWTH",itemSets,item2Number,nameData)


    // 建树
    // 树的节点
    function Node(name){
        this.name = name
        this.children = null
        this.number = 1
    }
    let root = new Node("root")
    nameData.forEach(nameSet=>{
        let p = root 
        let j = 0
        while(j++<nameSet.length){
            p.number++
            if(!p.children){
                p.children = {}
                p.children[nameSet[j]] = new Node(nameSet[j])
                p = p.children[nameSet[j]]
            }else{
                if(nameSet[j] in p.children){
                    p = p.children[nameSet[j]]
                    p.number ++
                }else{
                    p.children[nameSet[j]] = new Node(nameSet[j])
                    p = p.children[nameSet[j]]
                }
            }
        }
    })

    let resultSet = {}
    let deepestLevel = 4
    let lastNodeNumber = {}
    // 统计一定深度的序列的路径总和，频度的DFS函数
    function DFS(r,totalNumber,arraySet,level){
        if(!r.children||r.number<minNum){
            if(r.number>len*0.2){
                let itemJoin = arraySet.join("-")
                resultSet[itemJoin] = totalNumber
                lastNodeNumber[itemJoin] = r.number
            }
            return 
        }
        for(let v in r.children){
            let tempChildren = r.children[v]
            arraySet.push(tempChildren.name)
            DFS(tempChildren,totalNumber+tempChildren.number,arraySet,level+1)
            arraySet.pop()
        }
    }
    DFS(root,0,[],0)
    let resultArray = []
    for(let v in resultSet){

        resultArray.push({
            name:v,
            number:resultSet[v],
            minRatio: Number((lastNodeNumber[v]*100/len).toFixed(0))
        })
    }
    resultArray.sort((a,b)=>b.minRatio-a.minRatio)


    // console.log("resultArray",resultArray)
    let output = resultArray.map(v=>{
        let result = `${v.name} \n`
        // result += '   ————   '
        result += `[Ratio] : ${v.minRatio}%`
        return result
    })
    if(output.length>3){
        output = output.slice(0,3)
    }
    return output
}
export function maxLabel(infos){
    let maxSects = []
    let freMap = {}
    let max = 0
    infos.forEach(info=>{
        if(!freMap[info]){
            freMap[info] = 1
        }else{
            freMap[info]++
        }
    })
    for(let i in freMap){
        maxSects.push({
            label:i,
            number:freMap[i]
        })
    }
    maxSects.sort((a,b)=>b.number-a.number)
    return maxSects.map(v=>`${v.label}: ${v.number}`)
}
export function isPointInPolygon(point,vs){

    var x = point[0], y = point[1];
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

export function boolRectToPolygon(addOrMinus,polygons,singleBD,polygonsData,singleFilterData){
    const rectPointData = []
    rectPointData.push([singleBD.brushTransX,singleBD.brushTransY])
    rectPointData.push([singleBD.brushTransX,singleBD.brushTransY+singleBD.brushHeight])
    rectPointData.push([singleBD.brushTransX+singleBD.brushWidth,singleBD.brushTransY+singleBD.brushHeight])
    rectPointData.push([singleBD.brushTransX+singleBD.brushWidth,singleBD.brushTransY])
    let p2 = {"regions":[rectPointData],"inverted":false}

    let pData = []
    // 如果polygons为空的话
    if(polygons.length===0){
        if(addOrMinus){
            pData.push(deepClone(singleFilterData))
            return {"result":p2.regions,pData}
        }else{
            return {"result":[],pData}
        } 
    }
    let p1 = {
        "regions":polygons,
        "inverted":false
    }
    // console.log("p1--p2",p1,p2)
    let PolyBool = require('polybooljs')
    // 加选或减选

    // 将polygonsData的数据先汇总到一个对象中,方便数据的加选和减选
    let originPdata = {}
    polygonsData.forEach(v=>{
        originPdata = {...originPdata,...v}
    })
    polygonsData = originPdata
    let result
    if(addOrMinus){
        result = PolyBool.union(p1,p2).regions
        // 数据进行汇总
        for(let v in singleFilterData){
            if(!polygonsData[v]){
                polygonsData[v] = singleFilterData[v]
            }
        }
    }else{
        result = PolyBool.difference(p1,p2).regions
        for(let v in singleFilterData){
            if(polygonsData[v]!=undefined){
                // 数据减选
                delete polygonsData[v]
            }
        }
    }
    
    let k = 0
    while(k<result.length){
        pData[k] = {}
        k++
    }
    // 将数据分发到各个区域的集合中
    for(let v in polygonsData){
        for(let j=0;j<result.length;j++){
            if(isPointInPolygon([polygonsData[v].tx,polygonsData[v].ty],result[j])){
                pData[j][v] = polygonsData[v]
                break
            }
        }
    }

    return {result,pData}
  }

export function reduceOpacity(that){
    return new Promise((resolve,reject)=>{
        let timeInterval
        if(that.state.opacity>0){
        timeInterval = setInterval(function(){
            that.setState((prevState)=>({
            opacity:prevState.opacity-0.1
            }),()=>{
            // console.log("reduceOpacity.",that.state.opacity)
            })
            if(that.state.opacity<0){
                clearInterval(timeInterval)
                resolve("reduceOpacity")
            }
        },50)
        }
    })
  }

export function addOpacity(that){
    if(that.state.opacity<1){
        setTimeout(function(){
          that.setState((prevState)=>({
            opacity:prevState.opacity+0.1
          }),()=>{
            // console.log("addOpacity.",that.state.opacity)
          })
          addOpacity(that)
        },50)
      }
}

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
/*
export function rectTree2(width,height,topicData){
    // console.log(topicData)

    let all_relation_data
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
    .padding(0)
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
*/

export function rectTree(width,height,topicData){

    // console.error(topicData)

    // all_topics是数组
    let all_topics = topicData.map(elm => elm.id)

    let topic2index = {}, topic2data = {}
    all_topics.forEach((id,index) =>  {
        topic2index[id] = index
        topic2data[id] = topicData[index]
    })

    let hash_id2rel_data = {}
    Object.keys(topicData).forEach(topic_id=>{
        topicData[topic_id].relationData.forEach(rdata=>{
            let t = [topic_id, rdata.id]
            if(!all_topics.includes(rdata.id))
                return
            t.sort()
            let hash_id = t.join('-')
            hash_id2rel_data[hash_id] = {
                source: t[0],
                target: t[1], 
                weight: rdata.pmi
            }
        })
    })
    
    // 先画pmi大的，pmi一样画weight大的
    let edge_data = Object.values(hash_id2rel_data)
    edge_data.sort((a,b)=> b.weight - a.weight)
    // 取前1/4
    edge_data = edge_data.slice(0, Math.ceil(edge_data.length/4))

    let louvain = require('louvain');
    // console.log(louvain)
    let community = louvain.jLouvain()
                    .nodes(all_topics)
                    .edges(edge_data)
                    // .partition_init(init_part);
    let topic2group  = community();
    // console.log("topic2group",topic2group)
    // console.log(result, edge_data.map(elm=> elm.weight))

    // const getMaxWeight = elm => Math.max(...elm.t)
    // all_relation_data.sort((a,b)=> b.pmi!==a.pmi?(b.pmi - a.pmi):(getMaxWeight(b)-getMaxWeight(a)))
    // let imp_all_relation_data = all_relation_data.slice(0, Math.ceil(all_relation_data.length/5))
    // console.log(all_relation_data)

    // topic2group是从topic到group的映射
    let groups = new Set(Object.values(topic2group))

    // 变成数组
    groups = [...groups]
    const data = {
        name:"root",
        children: groups.map(group=>{
            let topics = Object.keys(topic2group).filter(topic => topic2group[topic] == group)
            return {
                name: group,
                children: topics.map(topic => {
                    return {
                        name: topic,
                        value: topic2data[topic].weight
                    }
                })
            }
        })
    }

    // console.log("treeMap - data",data)

    // console.log(data)

    // let weightData = topicData.map(v=>v.weight)

    // let children = weightData.map((v,i)=>({
    //     name:i,
    //     value:v
    // }))
    // const data = {
    //     name:"root",
    //     children
    // }

    //treemap是一个函数
    const treemap = d3.treemap()
    .padding(0)
    .round(true);

    // console.log("treemap",treemap)

    let root = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    treemap.size([width, height]);
    let treemapData = treemap(root)
    const leaves = treemapData.leaves();

    // console.log(leaves)
    let rectTreeData = new Array(all_topics.length)
    // 此为分组的矩形数据
    let rectGroupData = []
    treemapData.children.forEach(v=>{
        let group_rect = {
            "x0":v.x0,
            "y0":v.y0,
            "x1":v.x1,
            "y1":v.y1
        }
        rectGroupData.push(group_rect)
    })
    leaves.forEach(v => {
        let node_data = {
            "x0":v.x0,
            "y0":v.y0,
            "x1":v.x1,
            "y1":v.y1,
        }
        rectTreeData[topic2index[v.data.name]] = node_data
    })



    // let rectTreeData = root['children'].map((v,i)=>({
    //     "x0":v.x0,
    //     "y0":v.y0,
    //     "x1":v.x1,
    //     "y1":v.y1
    // }))
    // console.log(rectTreeData)
    return {rectTreeData,rectGroupData}
}

export function filterTimeLine(data,flag){
    let personIndex = 0;
    let personToIndex = {}
    let tLabelData = []
    let tCircleData=[]
    let tTopicExist = []
    for(let v of data){
        for (let k of v.cData){
            let isChoose = flag||k.isChoose
            if(isChoose&&k.time>0&&k.persons.length>0){
                k.persons.forEach((h,i)=>{
                    if(personToIndex[h]==undefined){
                        personToIndex[h]=personIndex
                        tLabelData[personIndex] = {
                            personId:k.personsId[i],
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
                            distance:k.time,
                            sentenceId:k.id,
                            topicId:v.id,
                            category:k.category?k.category:0
                        })
                    }
                })
            }
        }
    }
    return {tLabelData,tCircleData}
    
}
export function filterMatrixView(that,data,flag){
    let personIndex = 0;
    let personToIndex = {}
    let matrixPerson = []
    let matrixData = []
    let peopleToDiscriptions = {}

    for(let v of data){
        for(let k of v.cData){
            let isChoose = flag||k.isChoose
            if(isChoose&&k.persons.length>1){
                // 该叙述中出现过的人数大于1 
                // for(let p of k.persons){
                k.persons.forEach((p,i)=>{
                    if(personToIndex[p]==undefined){
                        personToIndex[p] = personIndex
                        matrixPerson[personIndex] = {
                            name:p,
                            number:0,
                            preIndex:personIndex,
                            newIndex:0,
                            personId:k.personsId[i]

                        }
                        matrixData[personIndex]=[]
                        personIndex++
                    }
                    matrixPerson[personToIndex[p]].number++
                })
                for(let i=0;i<k.persons.length;i++){
                    for(let j=0;j<k.persons.length;j++){
                        let a = personToIndex[k.persons[i]]
                        let b = personToIndex[k.persons[j]]
                        if(a<b){
                            let name = []
                            name.push(k.persons[i])
                            name.push(k.persons[j])
                            let joinName = name.sort((a,b)=>{
                                return b.localeCompare(a)
                            }).join('-')
                            if(matrixData[a][b]==undefined){
                                matrixData[a][b]=1
                                peopleToDiscriptions[joinName]=[]
                            }else{
                                matrixData[a][b]+=1 
                            }
                            peopleToDiscriptions[joinName].push(k.discription)
                        }
                    }         
                }
            }
        }
    }
    // console.log("peopleToDiscriptions",peopleToDiscriptions)
    that.props.updateMatrix({matrixData,matrixPerson})
    that.props.initPeopleCommon(peopleToDiscriptions)
    return {matrixData,matrixPerson}
}
export function filterSelectList(data,flag){
    let newData = []
    for(let singleData of data){
        for(let k of singleData.cData){
            let isChoose = flag||k.isChoose
            if(isChoose){
                newData.push(k.discription)
            }
             
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

export function filterMapView(data, flag, deleteId){
    // 隐藏的sentenceId
    let hideIds = new Set();

    for(let singleData of data){
        for(let k of singleData.cData){
            let isChoose = flag || k.isChoose 
            if(!isChoose || deleteId === singleData['id']){
                hideIds.add(k.id)
            }
        }
    }

    return hideIds;
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



