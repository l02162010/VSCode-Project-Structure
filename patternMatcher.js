const path = require('path')

function matchesPattern(relativePath, listOfPatterns) {
  for (const pattern of listOfPatterns) {
    if (pattern.startsWith('*')) {
      const fileExtension = path.extname(relativePath)
      if (fileExtension === pattern.slice(1)) {
        return true
      }
    } else if (relativePath.includes(pattern)) {
      return true
    }
  }

  return false
}

module.exports = {
  matchesPattern
}
