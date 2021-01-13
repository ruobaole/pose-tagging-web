export function getLabelingResult(
  labelingConfig: any,
  keypointGraphList: any[][],
  labelingConfigError?: string,
  imagePath?: string,
  imageLoadError?: string
) {
  return {
    configVersion: labelingConfig['configVersion'],
    configError: labelingConfigError,
    imagePath: imagePath + '',
    imageLoadError: imageLoadError,
    keypointGraphList: keypointGraphList,
  };
}

export function getLabelingResultPath(imagePath?: string) {
  if (imagePath) {
    return imagePath.split('.').slice(0, -1).join('.') + '_LABEL.json';
  }
  return undefined;
}
