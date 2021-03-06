import { STATEMENTS } from '../../utils/constants'

export default (function(){
    return {
        name: STATEMENTS.ALL,
        constructor: function(...args){
            const nested = args.some( arg => arg.length === 2 ) 

            switch( nested ){
                case true:
                        var [ statement , params ] = args[0]
                        return [ `ALL(${statement})` , params ]
                    default:
                        var statement = new Array( args.length ).fill('$').join(',')
                        return [ `ALL(${statement})` , args ]
            }          
        }
    }
})()