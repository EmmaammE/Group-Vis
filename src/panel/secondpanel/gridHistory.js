export class GridHistory {
    constructor() {
        this.past = [];
        this.present = [];
        this.future = [];
    }

    undo(step) {
        while(step > 0 && this.past.length!==0) {
            let _ele = this.past.pop();
            if(this.present.length!==0) {
                this.future.unshift(this.present.slice(0));
            }
            this.present = [..._ele];
            step--;
        }
    }

    redo(step) {
        while(step > 0 && this.future.length!==0) {
            let _ele = this.future.shift();
            this.past.push(this.present.slice(0));
            this.present = [..._ele];
            step--;
        }
    }

    add(grid) {
        this.past.push([...this.present]);
        this.present = [...grid];
        this.future = [];
    }
}