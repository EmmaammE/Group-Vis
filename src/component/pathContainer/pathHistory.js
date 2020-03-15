// 实现Redo和Undo
class PathStatus {
    constructor(rects = [], links = [], rects_links = {}) {
        // 存储现在的矩形和连接的状态
        this.rects = [...rects];
        this.links = [...links];
        this.rects_links = {...rects_links};
    }
}

export class PathHistory {
    constructor() {
        this.past = [];
        this.present = new PathStatus();
        this.future = [];
    }

    undo() {
        if(this.past.length!==0) {
            let _ele = this.past.pop();
            if(this.present!==null) {
                this.future.unshift({...this.present});
            }
            this.present = {..._ele}
        } 
    }

    redo() {
        if(this.future.length!==0) {
            let _ele = this.future.shift();
            this.past.push({...this.present});
            this.present = {..._ele}
        } 
    }

    add(rects, links, rects_links) {
        this.past.push({...this.present});
        this.present = new PathStatus(rects, links, rects_links);
        this.future = [];
    }
}