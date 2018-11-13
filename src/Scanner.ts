import { Token } from './utils';

export class Scanner {
    public input_file: string;
    public prev_token_image: string;
    public token_image: string;
    public index;

    constructor(input: string) {
        this.input_file = input;
        this.index = 0;
    }

    scan(): Token {
        this.token_image = '';

        /* skip white space */
        while (this.input_file.charAt(this.index) === ' ') {
            this.index++;
        }
        if (this.input_file.charAt(this.index) === '')
            return Token.EOF;
        if (this.input_file.charAt(this.index).match(/[a-z]/i)) {
            do {
                this.token_image += this.input_file.charAt(this.index);
                this.index++;
            } while (this.input_file.charAt(this.index).match(/[a-z]/i) || !(isNaN(parseInt(this.input_file.charAt(this.index)))) || this.input_file.charAt(this.index) === '_');

            if (this.token_image === 'read') {
                return Token.READ;
            }
            else if (this.token_image === 'write') {
                return Token.WRITE;
            }
            else if (this.token_image === 'while') {
                return Token.WHILE;
            }
            else if (this.token_image === 'if') {
                return Token.IF;
            }
            else {
                return Token.ID;
            }
        }
        else if (!(isNaN(parseInt(this.input_file.charAt(this.index))))) {
            do {
                this.token_image += this.input_file.charAt(this.index);
                this.index++;
            } while (!(isNaN(parseInt(this.input_file.charAt(this.index)))));

            return Token.LITERAL;
        }
        else
            switch (this.input_file.charAt(this.index)) {
                case ':':
                    this.index++;
                    if (this.input_file.charAt(this.index) !== '=') {
                        console.log('No match for : found (expected "=") in scanner');
                        return;
                    }
                    else {
                        this.index++;
                        return Token.GETS;
                    }
                    break;
                case '+':
                    this.index++;
                    return Token.ADD;
                case '-':
                    this.index++;
                    if (isNaN(parseInt(this.input_file.charAt(this.index)))) {
                        return Token.SUB;
                    }
                    // Add in ability to use negative numbers
                    else {
                        do {
                            this.token_image += this.input_file.charAt(this.index);
                            this.index++;
                        } while (!(isNaN(parseInt(this.input_file.charAt(this.index)))));
                        return Token.LITERAL;
                    }
                case '*':
                    this.index++;
                    return Token.MUL;
                case '/':
                    this.index++;
                    return Token.DIV;
                case '!':
                    this.index++;
                    if (this.input_file.charAt(this.index) === '!') {
                        this.index++;
                        return Token.NOT_EQUAL;
                    }
                    else console.log('No match found for ! in scanner');
                case '<':
                    this.index++;
                    if (this.input_file.charAt(this.index) === '>') {
                        this.index++;
                        return Token.NOT_EQUAL;
                    }
                    else if (this.input_file.charAt(this.index) === '=') {
                        this.index++;
                        return Token.LESS_THAN_EQUAL_TO;
                    }
                    else if (this.input_file.charAt(this.index) === ' ') {
                        this.index++;
                        return Token.LESS_THAN;
                    }
                    else console.log('No match found for < in scanner');
                case '>':
                    this.index++;
                    if (this.input_file.charAt(this.index) === '=') {
                        this.index++;
                        return Token.GREATER_THAN_EQUAL_TO;
                    }
                    else if (this.input_file.charAt(this.index) === ' ') {
                        this.index++;
                        return Token.GREATER_THAN;
                    }
                    else console.log('No match found for < in scanner');
                case '=':
                    this.index++;
                    if (this.input_file.charAt(this.index) === '=') {
                        this.index++;
                        return Token.EQUAL;
                    }
                    else console.log('No match found for < in scanner');
                case '(':
                    this.index++;
                    return Token.LPAREN;
                case ')':
                    this.index++;
                    return Token.RPAREN;
                case '{':
                    this.index++;
                    return Token.LBRACKET;
                case '}':
                    this.index++;
                    return Token.RBRACKET;
                case '$':
                    this.index++;
                    if (this.input_file.charAt(this.index) === '$') {
                        return Token.EOF;
                    }
                    else console.log('No match found for $ (expected match with $) in scanner');
                default:
                    return;
            }
    }

}