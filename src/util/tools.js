export function debounce(func, wait) {
    var timeout;
    return function () {
        var context = this;
        var args = arguments;
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(function () {
            func.apply(context, args)
        }, wait);
    }
}

// 深拷贝函数
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

export function genderTemplate(vKey,tempDict,nodeDict){
    let words = vKey.split(" ").map(vk=>tempDict[vk])
    if(words.length>3){
        return  `${words[0]}的${words[1]}${words[2]}`
    }else{
        return  words.join("-")
    }
}

export function familyTemplate(vKey,tempDict,nodeDict){
    let words = vKey.split(" ").map(vk=>tempDict[vk])
    if(words.length==4){
        return  `${words[0]}的${words[1]}是${words[2]}`
    }else{
        return  words.join("-")
    }
}

export function socialDisTemplate(vKey,tempDict,nodeDict){
    let words = vKey.split(" ").map(vk=>tempDict[vk])
    if(words.length==4){
        return  `${words[0]}的${words[1]}${words[2]}`
    }else{
        return  words.join("-")
    }
}
// 官职类型
export function titleTemplate(vKey,tempDict,nodeDict){
    let result 
    let yearIndex = -1
    let nianHaoIndex = []
    let officeBelongIndex =-1
    let postWayIndex =-1
    let addressIndex =-1

    let words = vKey.split(" ").map((vk,i)=>{
        if(nodeDict[vk].label=="Year"&&yearIndex==-1){
            yearIndex = i
        }
        if(nodeDict[vk].label=="Nianhao"){
            nianHaoIndex.push(i)
        }
        if(nodeDict[vk].label=="OfficeBelong"&&officeBelongIndex==-1){
            officeBelongIndex = i 
        }
        if(nodeDict[vk].label=="PostIs"&&postWayIndex==-1){
            postWayIndex = i
        }
        //地点
        if(nodeDict[vk].label=="Where"){
            addressIndex = i 
        }
        return  tempDict[vk]
    })
    
    if(officeBelongIndex!=-1){
        result = `${words[0]}于`
        nianHaoIndex.forEach(v=>{
            result+=`${(v-2)?words[v-2]:"xxxx"}年(年号:${nianHaoIndex?words[v]:"xx"})，`
        })
        result+= `被授予${words[officeBelongIndex+1]}的${words[officeBelongIndex-1]}官职，`
        result+= `${postWayIndex?words[postWayIndex]:""}${postWayIndex?words[postWayIndex+1]:""},`
        result+= `${addressIndex?words[addressIndex]:""} ${(addressIndex+1)?words[addressIndex+1]:""},`
        result+= `${(words[addressIndex+2])?words[addressIndex+2]:""} ${(words[addressIndex+3])?words[addressIndex+3]:""}`
        return result 
    }
    return  words.join("-")
}

export function relationTemplate(vKey,tempDict,nodeDict){
    let yearIndex = -1
    let occasionIndex = -1
    let result
    let words = vKey.split(" ").map((vk,i)=>{
        if(nodeDict[vk].label=="Year"&&yearIndex==-1){
            yearIndex = i
        }
        if(nodeDict[vk].label=="Occasion"&&occasionIndex==-1){
            occasionIndex =i
        }
        return  tempDict[vk]
    })
     
    if(words.length>13){
        result =  `${words[0]}和${words[12]}的关系是${words[6]}中的"${words[4]}", 属于${words[8]}`
        if(yearIndex!=-1){
            result+=`,时间是: ${yearIndex?words[yearIndex]:""}年,${words[yearIndex+1]?words[yearIndex+1]:""}是${words[yearIndex+2]?words[yearIndex+2]:""}`
        }
        return result
    }
    return  words.join("-")
}

export function locationTemplate(vKey,tempDict,nodeDict){
    let words = vKey.split(" ").map(vk=>tempDict[vk])
    let result
    if(words.length>8){
        result = `${words[0]}的${words[2]}是${words[4]}、${words[6]}、${words[8]}。`
        if(words.length>10){
            result = `${result} ${words[10]}属于${words[12]}`
        }
    }else{
        result =   words.join("-")
    }
    return result
}

export function beOfficeTemplate(vKey,tempDict,nodeDict){
    let words = vKey.split(" ").map(vk=>tempDict[vk])
    if(words.length === 10){
        return `${words[0]}的${words[3]}${words[4]}`
    }else{
        return  words.join("-")
    }
    
}