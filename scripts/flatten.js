module.exports = async function(files, options) {
  const {
    getConfigRoot,
    getRelativeFilePathsFromRoot,
    getDependencyFiles,
    getSourceCodeWithoutPragma,
    getMaxVersion,
    printOrSilent
  } = require('../lib');
  const process = require('process');
  const path = require('path');
  const fs = require('fs');

  try {
    const configRootPath = await getConfigRoot('service.haechi.json');
    const relativeFilePaths = await getRelativeFilePathsFromRoot(
      configRootPath,
      files
    );
    process.chdir(configRootPath);

    const allFilePaths = await getDependencyFiles(relativeFilePaths);

    const version = await getMaxVersion(allFilePaths);
    let sourceCode = `pragma solidity ${version};`;

    for (const filePath of allFilePaths) {
      const content = getSourceCodeWithoutPragma(filePath);
      sourceCode += `\n\n//filename: ${filePath}\n`;
      sourceCode += content;
    }

    if (options.output) {
      const outputPath = path.relative(
        configRootPath,
        path.resolve(options.output)
      );
      fs.writeFileSync(outputPath, sourceCode);
      printOrSilent(`${outputPath} is created`, options);
    } else {
      printOrSilent(`Print the combined source code!\n${sourceCode}`, options);
    }

    printOrSilent('The flatten is finished!', options);
  } catch (e) {
    console.error(e);
  }
};
