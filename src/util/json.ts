import Handlebars from 'handlebars';

export function getObjectAtPath(jsonDataObj: Object, pathString: string): any {
  if (!pathString) return jsonDataObj;
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
  return jsonDataObj;
}

export function template(templateStr: string, data: Object): string {
  Handlebars.registerHelper('eq', (a, b) => a == b);
  const template = Handlebars.compile(templateStr);
  return template(data);
}
