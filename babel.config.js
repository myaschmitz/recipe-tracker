module.exports = {
  presets: [
    ['next/babel'],
    ['@babel/preset-typescript']
  ],
  env: {
    test: {
      presets: [
        ['next/babel'],
        ['@babel/preset-typescript']
      ]
    }
  }
}
