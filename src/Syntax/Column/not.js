import { STATEMENTS } from '../../constants'  
export default (function(){
    return {
        name: STATEMENTS.NOT,
        constructor: function(_){
          return [ this._values.length ? 'NOT' :  `${this._fullColName} NOT` ]
        }
    }
})()