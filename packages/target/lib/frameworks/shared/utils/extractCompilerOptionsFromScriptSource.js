const path = require( 'path' )
const babel = require( 'babel-core' )
const extractComponentsPlugin = require( '../../../babel-plugins/extract-components' )
const resolveSource = require( '../../../utils/resolveSource' )
const hashify = require( '../../../utils/hashify' )
const removeExtension = require( '../../../utils/removeExtension' )

module.exports = function( source, loaderContext ) {
  const ast = babel.transform( source, {
    extends: path.resolve( process.cwd(), '.babelrc' ),
    plugins: [
      extractComponentsPlugin
    ]
  } )

  const components = ast.metadata.megaloComponents || {}

  const tmp = {}

  return Promise.all(
    Object.keys( components ).map( key => {
      const source = components[ key ]
      return resolveSource.call( loaderContext, source )
        .then( resolved => {
          const hashed = hashify( resolved )
          tmp[ key ] = {
            name: hashed,
            src: hashed
          }
        } )
    } )
  ).then( () => {
    let realResourcePath = removeExtension( loaderContext.resourcePath )
    const compilerOptions = {
      name: hashify( realResourcePath ),
      imports: tmp,
      components: tmp,
    }

    return compilerOptions
  } )
}