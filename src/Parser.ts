import { PDANode } from './PDANode';
import { Token } from './utils';
import { Scanner } from './Scanner';

export class Parser {
    public inputString: string = '';
    public rootNode: PDANode;
    public expected: Token;
    public inputToken: Token;
    public scanner: Scanner;

    constructor() { }

    public match(expected: Token) {
        this.expected = expected;
        if (this.inputToken === expected) {
            if (this.inputToken === Token.ID || this.inputToken === Token.LITERAL) {
                this.scanner.prev_token_image = this.scanner.token_image;
            }
            if (this.inputToken === Token.EOF) {
                return;
            }
            this.inputToken = this.scanner.scan();
        }
        else
            return -1;
    }

    // Create root node, begin scanning
    // Nodes are added recursively as the scanning and parsing is completed
    public program() {
        switch (this.inputToken) {
            case Token.ID:
            case Token.READ:
            case Token.WRITE:
            case Token.IF:
            case Token.WHILE:
            case Token.EOF:
                // Create root node
                this.rootNode = new PDANode('root', '', false);
                this.rootNode.addChild(this.stmt_list());
                this.match(Token.EOF);
                this.rootNode.addChild(new PDANode('root', '', false));
                return this.rootNode;
                break;
            default:
                return -1;
        }
    }

    // S SL | epsilon
    public stmt_list() {
        let stmt_list_node: PDANode = new PDANode('stmt_list', undefined, false);
        switch (this.inputToken) {
            case Token.ID:
            case Token.READ:
            case Token.WRITE:
            case Token.IF:
            case Token.WHILE:
                stmt_list_node.addChild(this.stmt());
                stmt_list_node.addChild(this.stmt_list());
                break;
            case Token.EOF:
            case Token.RBRACKET:
                stmt_list_node = new PDANode('stmt_list', 'epsilon', true);
                break; /*  epsilon production */
            default: {
                this.handle_scanner_exception(this.expected);
                return this.stmt_list();
            }
        }
        return stmt_list_node;
    }

    // For the gets operator, nodes must be reordered so the := operator appears first
    // id := R | read id | write R | if R SL fi | do SL od | check R
    public stmt() {
        let stmt_node: PDANode = new PDANode('stmt', undefined, false);
        let gets_node: PDANode = new PDANode();
        let id_node: PDANode = new PDANode();

        switch (this.inputToken) {
            case Token.ID:
                this.match(Token.ID);
                id_node = new PDANode('id', this.scanner.prev_token_image, false);
                this.match(Token.GETS);
                gets_node = new PDANode('gets', ':= ', false);
                stmt_node.addChild(gets_node);
                stmt_node.addChild(id_node);
                stmt_node.addChild(this.relat());
                break;
            case Token.READ:
                stmt_node.addChild(new PDANode('read', this.scanner.token_image, false));
                this.match(Token.READ);
                stmt_node.addChild(new PDANode('id', this.scanner.token_image, false));
                this.match(Token.ID);
                break;
            case Token.WRITE:
                stmt_node.addChild(new PDANode('write', this.scanner.token_image, false));
                this.match(Token.WRITE);
                stmt_node.addChild(this.relat());
                break;
            case Token.IF:
                stmt_node.addChild(new PDANode('if', this.scanner.token_image, false));
                this.match(Token.IF);
                stmt_node.addChild(this.relat());
                stmt_node.addChild(new PDANode('lbracket', '{', false));
                this.match(Token.LBRACKET);
                stmt_node.addChild(this.stmt_list());
                stmt_node.addChild(new PDANode('rbracket', '}', false));
                this.match(Token.RBRACKET);
                break;
            case Token.WHILE:
                stmt_node.addChild(new PDANode('while', this.scanner.token_image, false));
                this.match(Token.WHILE);
                stmt_node.addChild(this.relat());
                stmt_node.addChild(new PDANode('lbracket', '{', false));
                this.match(Token.LBRACKET);
                stmt_node.addChild(this.stmt_list());
                stmt_node.addChild(new PDANode('rbracket', '}', false));
                this.match(Token.RBRACKET);
                break;
            default:
                {
                    this.handle_scanner_exception(this.expected);
                    return this.stmt();
                }
        }
        return stmt_node;
    }

    // E ET
    public relat() {
        let relat_node: PDANode = new PDANode('relat', undefined, false);
        let expr_node: PDANode;
        let expr_tail_node: PDANode;
        let op_node: PDANode;

        switch (this.inputToken) {
            case Token.ID:
            case Token.LITERAL:
            case Token.LPAREN:
            case Token.WHILE:
            case Token.IF:
                expr_node = this.expr();
                expr_tail_node = this.expr_tail();
                if (expr_tail_node.getNumChildren() > 0) {
                    op_node = expr_tail_node.getChild(0);

                    relat_node.addChild(op_node);
                    relat_node.addChild(expr_node);
                    if (expr_tail_node.getNumChildren() >= 1) {
                        for (let i = 1; i < expr_tail_node.getNumChildren(); i++) {
                            relat_node.addChild(expr_tail_node.getChild(i));
                        }
                    }
                }
                else {
                    relat_node.addChild(expr_node);
                    relat_node.addChild(expr_tail_node);
                }
                break;
            default:
                {
                    this.handle_scanner_exception(this.expected);
                    return this.relat();
                }
        }
        return relat_node;
    }

    // T TT
    public expr() {
        let expr_node: PDANode = new PDANode('expr', undefined, false);
        let term_node: PDANode;
        let term_tail_node: PDANode;
        let op_node: PDANode;

        switch (this.inputToken) {
            case Token.ID:
            case Token.LITERAL:
            case Token.LPAREN:
            case Token.WHILE:
            case Token.IF:
                term_node = this.term();
                term_tail_node = this.term_tail();
                if (term_tail_node.getNumChildren() > 0) {
                    op_node = term_tail_node.getChild(0);
                    expr_node.addChild(op_node);
                    expr_node.addChild(term_node);
                    if (term_tail_node.getNumChildren() >= 1) {
                        for (let i = 1; i < term_tail_node.getNumChildren(); i++) {
                            expr_node.addChild(term_tail_node.getChild(i));
                        }
                    }
                }
                else {
                    expr_node.addChild(term_node);
                    expr_node.addChild(term_tail_node);
                }
                break;
            default:
                {
                    this.handle_scanner_exception(this.expected);
                    return this.expr();
                }
        }

        return expr_node;
    }

    // F FT
    public term() {
        let term_node: PDANode = new PDANode('term', undefined, false);
        let factor_node: PDANode;
        let factor_tail_node: PDANode;
        let op_node: PDANode;

        switch (this.inputToken) {
            case Token.ID:
            case Token.LITERAL:
            case Token.LPAREN:
                try {
                    factor_node = this.factor();

                    factor_tail_node = this.factor_tail();
                    if (factor_tail_node.getNumChildren() > 0) {
                        op_node = factor_tail_node.getChild(0);
                        term_node.addChild(op_node);
                        term_node.addChild(factor_node);
                        if (factor_tail_node.getNumChildren() >= 1) {
                            for (let i = 1; i < factor_tail_node.getNumChildren(); i++) {
                                term_node.addChild(factor_tail_node.getChild(i));
                            }
                        }
                    }
                    else {
                        term_node.addChild(factor_node);
                        term_node.addChild(factor_tail_node);
                    }

                    return term_node;
                }
                catch (e) {
                    this.handle_scanner_exception(this.expected);
                }
                break;
            default:
                {
                    this.handle_scanner_exception(this.expected);
                    return this.term();
                }
        }
        return term_node;
    }

    // (R) | id | lit
    factor() {
        let factor_node = new PDANode();
        switch (this.inputToken) {
            case Token.ID:
                factor_node = new PDANode('id', this.scanner.token_image, false);
                this.match(Token.ID);
                break;
            case Token.LITERAL:
                factor_node = new PDANode('lit', this.scanner.token_image, false);
                this.match(Token.LITERAL);
                break;
            case Token.LPAREN:
                this.match(Token.LPAREN);
                factor_node = this.relat();
                this.match(Token.RPAREN);
                break;
            default:
                {
                    this.handle_scanner_exception(this.expected);
                    return this.factor();
                }
        }
        return factor_node;
    }

    // ro E | epsilon
    expr_tail() {
        let expr_tail_node = new PDANode('expr_tail', undefined, false);

        switch (this.inputToken) {
            case Token.LESS_THAN:
            case Token.GREATER_THAN:
            case Token.EQUAL:
            case Token.NOT_EQUAL:
            case Token.LESS_THAN_EQUAL_TO:
            case Token.GREATER_THAN_EQUAL_TO:
                expr_tail_node.addChild(this.rel_op());
                expr_tail_node.addChild(this.expr());
                break;
            case Token.LPAREN:
            case Token.RPAREN:
            case Token.LBRACKET:
            case Token.RBRACKET:
            case Token.WHILE:
            case Token.ID:
            case Token.READ:
            case Token.WRITE:
            case Token.EOF:
                return new PDANode('expr_tail', 'epsilon', true);
                break; /*  epsilon production */
            default:
                {
                    this.handle_scanner_exception(this.expected);
                    return this.expr_tail();
                }
        }
        return expr_tail_node;
    }

    // ao T TT | epsilon
    term_tail() {
        let term_tail_node = new PDANode('term_tail', undefined, false);
        switch (this.inputToken) {
            case Token.ADD:
            case Token.SUB:
                // Must be reordered similar to relations
                term_tail_node.addChild(this.add_op());
                term_tail_node.addChild(this.term());
                term_tail_node.addChild(this.term_tail());
                break;
            case Token.LESS_THAN:
            case Token.GREATER_THAN:
            case Token.EQUAL:
            case Token.NOT_EQUAL:
            case Token.LESS_THAN_EQUAL_TO:
            case Token.GREATER_THAN_EQUAL_TO:
            case Token.LPAREN:
            case Token.RPAREN:
            case Token.IF:
            case Token.WHILE:
            case Token.LBRACKET:
            case Token.RBRACKET:
            case Token.ID:
            case Token.READ:
            case Token.WRITE:
            case Token.EOF:
                return new PDANode('term_tail', 'epsilon', true);
            /*  epsilon production */
            default:
                {
                    this.handle_scanner_exception(this.expected);
                    return this.term_tail();
                }
        }
        return term_tail_node;
    }

    // mo F FT | epsilon
    // Anything that has an epsilon route can be a follow, otherwise a first
    factor_tail() {
        let factor_tail_node = new PDANode('factor_tail', undefined, false);
        switch (this.inputToken) {
            case Token.MUL:
            case Token.DIV:
                factor_tail_node.addChild(this.mul_op());
                factor_tail_node.addChild(this.factor());
                factor_tail_node.addChild(this.factor_tail());
                break;
            case Token.LESS_THAN:
            case Token.GREATER_THAN:
            case Token.EQUAL:
            case Token.NOT_EQUAL:
            case Token.LESS_THAN_EQUAL_TO:
            case Token.GREATER_THAN_EQUAL_TO:
            case Token.ADD:
            case Token.SUB:
            case Token.LPAREN:
            case Token.RPAREN:
            case Token.ID:
            case Token.READ:
            case Token.WRITE:
            case Token.WHILE:
            case Token.LBRACKET:
            case Token.RBRACKET:
            case Token.IF:
            case Token.EOF:
                return new PDANode('factor_tail', 'epsilon', true);
                break; /*  epsilon production */
            default:
                {
                    this.handle_scanner_exception(this.expected);
                    return this.factor_tail();
                }
        }
        return factor_tail_node;
    }

    // + | -
    add_op() {
        let add_op_node;
        switch (this.inputToken) {
            case Token.ADD:
                add_op_node = new PDANode('add_op', '+', false);
                this.match(Token.ADD);
                break;
            case Token.SUB:
                add_op_node = new PDANode('add_op', '-', false);
                this.match(Token.SUB);
                break;
            default:
                {
                    this.handle_scanner_exception(this.expected);
                    return this.add_op();
                }
        }
        return add_op_node;
    }

    // * | /
    mul_op() {
        let mul_op_node;

        switch (this.inputToken) {
            case Token.MUL:
                mul_op_node = new PDANode('mul_op', '*', false);
                this.match(Token.MUL);
                break;
            case Token.DIV:
                mul_op_node = new PDANode('mul_op', '/', false);
                this.match(Token.DIV);
                break;
            default:
                {
                    this.handle_scanner_exception(this.expected);
                    return this.mul_op();
                }
        }
        return mul_op_node;
    }

    // == | != | < | > | <= | >=
    rel_op() {
        let rel_op_node;

        switch (this.inputToken) {
            case Token.EQUAL:
                rel_op_node = new PDANode('rel_op', '==', false);
                this.match(Token.EQUAL);
                break;
            case Token.NOT_EQUAL:
                rel_op_node = new PDANode('rel_op', '!=', false);
                this.match(Token.NOT_EQUAL);
                break;
            case Token.LESS_THAN:
                rel_op_node = new PDANode('rel_op', '<', false);
                this.match(Token.LESS_THAN);
                break;
            case Token.GREATER_THAN:
                rel_op_node = new PDANode('rel_op', '>', false);
                this.match(Token.GREATER_THAN);
                break;
            case Token.LESS_THAN_EQUAL_TO:
                rel_op_node = new PDANode('rel_op', '<=', false);
                this.match(Token.LESS_THAN_EQUAL_TO);
                break;
            case Token.GREATER_THAN_EQUAL_TO:
                rel_op_node = new PDANode('rel_op', '>=', false);
                this.match(Token.GREATER_THAN_EQUAL_TO);
                break;
            default:
                {
                    this.handle_scanner_exception(this.expected);
                    return this.rel_op();
                }
        }
        return rel_op_node;
    }

    recur_print(node: PDANode) {
        let type = node.type;
        let out = '';
        if (node.data !== 'epsilon' && type !== 'relat' && type !== 'expr' && type !== 'term' &&
            type !== 'stmt' && type !== 'stmt_list' && type !== 'expr_tail' && type !== 'factor_tail' &&
            type !== 'term_tail') {
            out = node.data;
        }

        for (let i = 0; i < node.getNumChildren(); i++) {
            out += this.recur_print(node.getChild(i));
        }

        return out;
    }

    handle_scanner_exception(tok: Token) {
        if (this.inputToken === Token.EOF) {
            console.log('Attempted to delete up to matching character, no matching character found. Exiting');
            return;
        }

        // Scan until an appropriate item is found
        if (this.match(tok) === -1) {
            // Continue scanning until a match is found
            this.inputToken = this.scanner.scan();
            this.handle_scanner_exception(tok);
        }
        console.log('Recovered from exception by deletion up to ' + this.scanner.prev_token_image);
    }

}