import { PDANode } from './PDANode';

export let nodeNums: number[];
export let Nodes: PDANode[];
export let EdgeList: any[];

export function initGlobals(): void {
    clearNodeNums();
    clearNodes();
    clearEdgeList();
}

export function clearNodeNums(): void {
    nodeNums = [];
}

export function clearNodes(): void {
    Nodes = [];
}

export function clearEdgeList(): void {
    EdgeList = [];
}

export function findNextQStateNum(): number {
    let max = 0;
    if (nodeNums.length <= 1)
        max;
    for (let val of nodeNums) {
        if (val > max) {
            max = val;
        }
    }
    return max + 1;
}

export enum Token {
    READ = 0, WRITE, ID, LITERAL, GETS,
    ADD, SUB, MUL, DIV, LPAREN, RPAREN, LBRACKET, RBRACKET, EOF,
    IF, WHILE, LESS_THAN, GREATER_THAN, EQUAL, NOT_EQUAL,
    LESS_THAN_EQUAL_TO, GREATER_THAN_EQUAL_TO
}

export enum Order {
    FIRST, FOLLOW, PREDICT
}

export let vals = [ 'read', 'write', 'id', 'literal', 'gets',
 'add', 'sub', 'mul', 'div', 'lparen', 'rparen', 'lbracket', 'rbracket', 'eof', 'if',
 'fi', 'do', 'od', 'check', 'less than', 'greater than', 'not equal to',
 'equal to', 'less than equal to', 'greater than equal to'
];