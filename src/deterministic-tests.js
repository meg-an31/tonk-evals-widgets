

var widgetPaths = [];

export function setWidgetPath(path) {
    widgetPaths.push(path); 
    console.log(path);
}

export function getWidgetPath() {
    return widgetPaths;
}
