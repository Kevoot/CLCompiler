import { PDANode } from './PDANode';

let dynVar: number = 0;
let foundVars: string[];

// P    →   SL $$
export function convertProgram(root: PDANode): string {
    let fnString = '';
    foundVars = [];

    if (root.hasChildren) {
        // Declare all javascript variables
        for (let child of root.children) {
            findVars(child, foundVars);
        }

        for (let element of foundVars) {
            fnString += 'let ' + element + ';\n';
        }

    }
    else {
        fnString += 'alert("Program is empty!");\n';
    }

    for (let child of root.children) {
        fnString += getNodeConversionString(child);
    }

    return fnString;
}

function getNodeConversionString(node: PDANode): string {
    let convString = '';
    if (node === undefined || node.type === undefined) {
        return '';
    }
    if (node.type === 'stmt') {
        convString = convertStmt(node);
    }
    else if (node.type === 'stmt_list') {
        convString = convertStmtList(node);
    }
    else if (node.type === 'relat') {
        convString = convertRelat(node);
    }
    else if (node.type === 'expr') {
        convString = convertExpr(node);
    }
    else if (node.type === 'term') {
        convString = convertTerm(node);
    }
    else if (node.type === 'factor') {
        convString = convertFactor(node);
    }
    else if (node.type === 'expr_tail') {
        convString = convertExprTail(node);
    }
    else if (node.type === 'term_tail') {
        convString = convertTermTail(node);
    }
    else if (node.type === 'factor_tail') {
        convString = convertFactorTail(node);
    }
    else if (node.type === 'add_op') {
        convString = convertAddOp(node);
    }
    else if (node.type === 'mul_op') {
        convString = convertMulOp(node);
    }
    else if (node.type === 'rel_op') {
        convString = convertRelatOp(node);
    }

    /*for (let child of node.children) {
        convString += getNodeConversionString(child);
    }*/

    return convString;
}

// S	→ 	id := R  |  read id  |  write R  |  if R { SL }  |  while R { SL }
function convertStmt(node: PDANode): string {
    if (node.children.length < 1) {
        return '';
    }

    let stmtString: string = '';
    if (node.children[0].type === 'gets') {
        if (node.children[1].type === 'id') {
            if (node.children[2].type === 'relat') {
                stmtString += convertId(node.children[1]);
                stmtString += convertGets(node.children[0]);
                stmtString += convertRelat(node.children[2]);
            }
        }
    }
    else if (node.children[0].type === 'read') {
        if (node.children[1].type === 'id') {
            stmtString += convertRead(node.children[0], node.children[1]);
        }
    }
    else if (node.children[0].type === 'write') {
        if (node.children[1].type === 'relat') {
            stmtString += convertWrite(node.children[1]);
        }
    }
    else if (node.children[0].type === 'if') {
        if (node.children[1].type === 'relat') {
            if (node.children[2].type === 'lbracket') {
                if (node.children[3].type === 'stmt_list') {
                    if (node.children[4].type === 'rbracket') {
                        stmtString += convertIf(node.children[1], node.children[3]);
                    }
                }
            }
        }
    }
    else if (node.children[0].type === 'while') {
        if (node.children[1].type === 'relat') {
            if (node.children[2].type === 'lbracket') {
                if (node.children[3].type === 'stmt_list') {
                    if (node.children[4].type === 'rbracket') {
                        stmtString += convertWhile(node.children[1], node.children[3]);
                    }
                }
            }
        }
    }

    return stmtString + ';\n';
}

// SL	→ 	S SL  |  ε
function convertStmtList(node: PDANode): string {
    if (node.children.length < 1) {
        return '';
    }
    let stmtListString: string = '';

    if (node.children[0].type === 'stmt') {
        stmtListString += convertStmt(node.children[0]);
        if (node.children[1].type === 'stmt_list' && node.children[1].data !== 'epsilon') {
            stmtListString += convertStmtList(node.children[1]);
        }
    }

    return stmtListString;
}

// R	→ 	E ET
function convertRelat(node: PDANode): string {
    if (node.children.length < 1) {
        return '';
    }
    let relatString: string = '';

    if (node.children[0].type === 'expr') {
        relatString += convertExpr(node.children[0]);
        if (node.children[1].type === 'expr_tail') {
            relatString += convertExprTail(node.children[1]);
        }
    }
    else if (node.children[0].type === 'rel_op') {
        if (node.children[1].type === 'expr' && node.children[2].type === 'expr') {
            relatString += convertExpr(node.children[1]);
            relatString += convertRelatOp(node.children[0]);
            relatString += convertExpr(node.children[2]);
        }
    }

    return relatString;
}

// E	→ 	T TT
function convertExpr(node: PDANode): string {
    if (node.children.length < 1) {
        return '';
    }
    let exprString: string = '';

    if (node.children[0].type === 'add_op') {
        if (node.children[1].type === 'term') {
            if (node.children[2].type === 'term') {
                if (node.children[3].type === 'term_tail' && node.children[1].data !== 'epsilon') {
                    exprString += convertTerm(node.children[1]);
                    exprString += convertAddOp(node.children[0]);
                    exprString += convertTerm(node.children[2]);
                    exprString += convertTermTail(node.children[3]);
                }
            }
        }
    }
    else if (node.children[0].type === 'term') {
        exprString += convertTerm(node.children[0]);
        if (node.children[1].type === 'term_tail') {
            exprString += convertTermTail(node.children[1]);
        }
    }

    return exprString;
}

// T	→ 	F FT
function convertTerm(node: PDANode): string {
    if (node.children.length < 1) {
        return '';
    }
    let termString: string = '';

    if (node.children[0].type === 'mul_op') {
        if (node.children[1].type === 'lit' || node.children[1].type === 'id') {
            if (node.children[2].type === 'lit' || node.children[2].type === 'id') {
                if (node.children[3].type === 'factor_tail') {
                    /*termString += convertFactor(node.children[1]);
                    termString += convertMulOp(node.children[0]);
                    termString += convertFactor(node.children[2]);*/
                    termString += convertFactorTail(node);
                }
            }
        }
    }
    else {
        termString += convertFactor(node.children[0]);
        if (node.children[1] && node.children[1].type === 'factor_tail') {
            termString += convertFactorTail(node.children[1]);
        }
    }

    return termString;
}

// F	→ 	( R )  |  id  |  lit
function convertFactor(node: PDANode): string {
    if (node.type === 'lit' || node.type === 'id') {
        return node.data;
    }
    else if (node.children.length < 1) {
        return '';
    }

    let factorString: string = '';

    if (node.children[0].type === 'lparen') {
        factorString += '(';
        if (node.children[1].type === 'relat') {
            factorString += convertRelat(node.children[1]);
            if (node.children[2].type === 'rparen') {
                factorString += ')';
            }
        }
    }
    else if (node.children[0].type === 'rel_op') {
        if (node.children[1].type === 'expr') {
            if (node.children[2].type === 'expr') {
                factorString += convertExpr(node.children[1]);
                factorString += convertRelatOp(node.children[0]);
                factorString += convertExpr(node.children[2]);
            }
        }
    }
    else if (node.children[0].type === 'lit') {
        factorString += convertLit(node.children[0]);
    }
    else if (node.children[0].type === 'id') {
        factorString += convertId(node.children[0]);
    }

    return factorString;
}

// FT	→ 	mo F FT  |  ε
function convertFactorTail(node: PDANode): string {
    if (node.children.length < 1) {
        return '';
    }
    let factorTailString: string = '';

    if (node.children[0].type === 'mul_op' && node.children[0].data !== 'epsilon') {
        if (node.children[1].type === 'factor' && node.children[1].data !== 'epsilon') {
            if (node.children[2].type === 'factor_tail' && node.children[2].data !== 'epsilon') {
                factorTailString += convertFactor(node.children[1]);
                factorTailString += convertMulOp(node.children[0]);
                factorTailString += convertFactorTail(node.children[2]);
            }
        }
        else if (node.children[1].type === 'lit') {
            factorTailString += convertLit(node.children[1]);
        }
        else if (node.children[1].type === 'id') {
            factorTailString += convertId(node.children[1]);
        }

        factorTailString += convertMulOp(node.children[0]);

        if (node.children[2].type === 'lit') {
            factorTailString += convertLit(node.children[2]);
        }
        else if (node.children[2].type === 'id') {
            factorTailString += convertId(node.children[2]);
        }
        if (node.children[3].type === 'factor_tail') {
            factorTailString += convertFactorTail(node.children[3]);
        }
    }

    return factorTailString;
}

// TT	→ 	ao T TT  |  ε
function convertTermTail(node: PDANode): string {
    if (node.children.length < 1) {
        return '';
    }
    let termTailString: string = '';

    if (node.children[0].type === 'add_op' && node.children[0].data !== 'epsilon') {
        if (node.children[1].type === 'term' && node.children[1].data !== 'epsilon') {
            if (node.children[2].type === 'term_tail' && node.children[2].data !== 'epsilon') {
                termTailString += convertAddOp(node.children[0]);
                termTailString += convertTerm(node.children[1]);
                termTailString += convertTermTail(node.children[2]);
            }
        }
    }

    return termTailString;
}

// ET	→ 	ro E  |  ε
function convertExprTail(node: PDANode): string {
    if (node.children.length < 1) {
        return '';
    }
    let exprTailString: string = '';

    if (node.children[0].type === 'rel_op' && node.children[0].data !== 'epsilon') {
        if (node.children[1].type === 'expr' && node.children[1].data !== 'epsilon') {
            exprTailString += convertRelatOp(node.children[0]);
            exprTailString += convertExpr(node.children[1]);
        }
    }

    return exprTailString;
}

// ao	→ 	+  |  -
function convertAddOp(node: PDANode): string {
    let addOpString: string = '';

    addOpString += node.data;

    return addOpString;
}

// mo	→ 	*  |  /
function convertMulOp(node: PDANode): string {
    let mulOpString: string = '';

    mulOpString += node.data;

    return mulOpString;
}

// ro	→ 	==  |  !=  |  <  |  >  |  <=  |  >=
function convertRelatOp(node: PDANode): string {
    let relatOpString: string = '';

    relatOpString += node.data;

    return relatOpString;
}

function convertId(node: PDANode): string {
    let idString: string = '';

    idString += node.data;

    return idString;
}

function convertLit(node: PDANode): string {
    let litString: string = '';

    litString += node.data;

    return litString;
}

function convertGets(node: PDANode): string {
    return '=';
}

function convertRead(node: PDANode, targetVar: PDANode): string {
    let readString: string = '';

    readString += targetVar.data + '= parseInt(prompt("input:", ""));\n';

    return readString;
}

function convertWrite(node: PDANode): string {
    let writeString: string = '';

    writeString += 'alert(' + convertRelat(node) + ');\n';

    return writeString;
}

function convertIf(relat: PDANode, stmt_list: PDANode): string {
    let ifString: string = 'if(';
    ifString += convertRelat(relat);
    ifString += ') {';
    ifString += convertStmtList(stmt_list);
    ifString += '}';

    return ifString;
}

function convertWhile(relat: PDANode, stmt_list: PDANode): string {
    let whileString: string = '';

    whileString += 'while (';
    whileString += convertRelat(relat);
    whileString += ')';
    whileString += ' {\n';
    whileString += convertStmtList(stmt_list);
    whileString += '}\n';

    return whileString;
}

function findVars(node: PDANode, foundVars: string[]) {
    if (node.type === 'id') {
        if (foundVars.findIndex(entry => entry === node.data) < 0) {
            foundVars.push(node.data);
        }
    }
    else {
        for (let child of node.children) {
            findVars(child, foundVars);
        }
    }
}