export function getObjectAtPath(jsonDataObj: Object, pathString: string): any {
  if (pathString === '') return jsonDataObj;
  const pathKeys = pathString.split('.');
  let currentObject = jsonDataObj;

  for (const key of pathKeys) {
    if (key in currentObject) {
      currentObject = currentObject[key];
    } else {
      // Key not found, return undefined or handle as needed
      return undefined;
    }
  }

  return currentObject;
}

export function updateObjectAtPath(
  jsonDataObj: Object,
  pathString: string,
  value: any,
): Object {
  if (pathString === '') {
    throw new Error('Path cannot be empty');
  }
  const pathKeys = pathString.split('.');
  let currentObject = jsonDataObj;

  for (let i = 0; i < pathKeys.length; i++) {
    const key = pathKeys[i];
    if (i === pathKeys.length - 1) {
      let parsedValue = value;
      try {
        parsedValue = JSON.parse(value);
      } catch (e) {
        // Do nothing
      }
      currentObject[key] = parsedValue;
    } else {
      // Navigate deeper into the object
      if (key in currentObject) {
        currentObject = currentObject[key];
      } else {
        throw new Error('Path not found in the object');
      }
    }
  }
  return currentObject;
}

export function replaceTemplateStringWithJsonPath(
  templateString: string,
  jsonDataObj: Object,
): string {
  // Regular expression to find all {{ }} patterns
  const regex = /{{\s*([^}]+)\s*}}/g;
  let match;

  // Loop over all matches of the regex in the templateString
  while ((match = regex.exec(templateString)) !== null) {
    // Extract the path from the current match
    const path = match[1].trim();

    // Use the provided getObjectAtPath function to get the value at the path
    const valueAtPath = getObjectAtPath(jsonDataObj, path);

    // Replace the current {{ path }} in the templateString with the value
    templateString = templateString.replace(match[0], valueAtPath);
  }

  return templateString;
}
