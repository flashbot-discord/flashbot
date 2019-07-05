class Command {
    /**
     * @param {string} name
     * @param {string} desc
     * @param {boolean} dev
     * @param {string[]} callSign
     * @param {args[]} args
     */
    constructor() {
        /**
         * 명령어의 원래 이름
         * @type {string}
         */
        this.name = '';

        /**
         * 명령어의 설명
         * @type {string}
         */
        this.desc = '';

        /**
         * 개발자 모드 전용 명령어 여부
         * @type {boolean}
         * @default false
         */
        this.dev = false;

        /**
         * 명령어의 별칭
         * @type {string[]}
         */
        this.callSign = [];

        /**
         * 명령어의 인수 모음
         * @type {args[]}
         */
        this.args = [];
    }
}

class Args {
    /**
     * @param {string} name 
     * @param {boolean} must 
     */
    constructor(name, must) {
        /**
         * 명령어 인수의 이름
         * @type {string}
         */
        this.name = name || '';

        /**
         * 명령어 인수 필수 사용 여부
         * @type {boolean}
         * @default false
         */
        this.must = must || false;
    }
}

exports.Command = Command;
exports.Args = Args;