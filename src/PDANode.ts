import { findNextQStateNum, Nodes, EdgeList, nodeNums } from './utils';

export class PDANode {
    public id: number;
    public data: string;
    public type: string;
    public epsilon: boolean;
    public parent;
    public children: PDANode[];

    constructor(type?: string, data?: string, epsilon?: boolean) {
        this.children = [];
        this.id = findNextQStateNum();
        nodeNums.push(this.id);

        this.type = type;
        if (data === undefined || data === '') {
            this.data = type;
        }
        else {
            this.data = data;
        }
        this.epsilon = epsilon;
        parent = undefined;
        Nodes.push(this);
    }

    public getChild(index: number) {
        if (this.children.length < index) {
            return undefined;
        }
        else {
            return this.children[index];
        }
    }

    public countNodes(root: PDANode, count: number) {
        let parent: PDANode = root;
        let child: PDANode = undefined;

        for (let i = 0; i < parent.children.length; i++) {
            child = parent.getChild(i);
            count++;
            if (child.children.length > 0) {
                this.countNodes(child, count);
            }
        }

        return count;
    }

    public addChild(child: PDANode) {
        child.parent = this;
        // Was push_back, verify this.
        this.children.push(child);
        EdgeList.push({from: this.id, to: child.id, label: ''});
    }

    public RemoveChild(index: number) {
        let edgeIndex = (<Array<{from: number, to: number, label?: string}>>EdgeList).indexOf({from: this.id, to: this.children[index].id});
        EdgeList.splice(edgeIndex, 1);
        if (index !== undefined && index > -1) {
            this.children.splice(index, 1);
        }
        else {
            this.children.pop();
        }
    }

    public hasChildren() {
        if (this.children.length > 0)
            return true;
        else
            return false;
    }

    public hasParent() {
        if (parent !== undefined)
            return true;
        else
            return false;
    }

    public getNumChildren() {
        return this.children.length;
    }

}