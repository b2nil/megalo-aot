const path = require( 'path' )
const semver = require( 'semver' )
const { babel } = require( '../../../utils/babel' )
const extractComponentsPlugin = require( '../../../babel-plugins/extract-components' )
const resolveSource = require( '../../../utils/resolveSource' )
const hashify = require( '../../../utils/hashify' )
const removeExtension = require( '../../../utils/removeExtension' )

module.exports = function( source, loaderContext ) {
  const babelOptions = {
    filename: loaderContext.resourcePath,
    plugins: [
      extractComponentsPlugin
    ]
  }

  const { metadata } = babel.transform( source, babelOptions )

  const components = ( metadata && metadata.megaloComponents ) || {}

  const tmp = {}

  return Promise.all(
    Object.keys( components ).map( key => {
      const source = components[ key ]
      return resolveSource.call( loaderContext, source )
        .then( resolved => {
          const hashed = hashify( resolved )
          tmp[ key ] = {
            name: hashed,
            resolved
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
