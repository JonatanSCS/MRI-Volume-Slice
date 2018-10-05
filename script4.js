
dims = {
    x:240,
    y:280,
    z:240,
};

const theMax = data.reduce((accumulate, item) => {
    accumulate = item > accumulate ? item : accumulate;
    return accumulate;
}, 0);

data = data.map(item => Math.round(item*255/theMax));

const myZViewCanvas = document.createElement("canvas");
myZViewCanvas.width = dims.x;
myZViewCanvas.height = dims.y;
const zViewContext = myZViewCanvas.getContext('2d');
zViewContext.putImageData(getZViewSlice(data, 120, dims) ,0,0);
xDiv = document.getElementById('z-view-wrapper');
xDiv.appendChild(myZViewCanvas);

const myYViewCanvas = document.createElement("canvas");
myYViewCanvas.width = dims.x;
myYViewCanvas.height = dims.z;
const yViewContext = myYViewCanvas.getContext('2d');
yViewContext.putImageData(getYViewSlice(data, 240, dims) ,0,0);
yDiv = document.getElementById('y-view-wrapper');
yDiv.appendChild(myYViewCanvas);

const myXViewCanvas = document.createElement("canvas");
myXViewCanvas.width = dims.y;
myXViewCanvas.height = dims.z;
const xViewContext = myXViewCanvas.getContext('2d');
xViewContext.putImageData(getXViewSlice(data, 170, dims) ,0,0);
zDiv = document.getElementById('x-view-wrapper');
zDiv.appendChild(myXViewCanvas);

function getXViewSlice(data, slice, size) {
    let sliceRGBA = [];
    // The order of these nested loops is important
    for(let zIndex=size.z-1; zIndex >= 0; zIndex--) {
        for(let yIndex=0; yIndex < size.y; yIndex++) {
            sliceRGBA.push(data[get1DIndex(slice,yIndex,zIndex,size)]);
        }
    }
    sliceRGBA = sliceRGBA.reduce(grayScaleToRGB,[]);
    return new ImageData(new Uint8ClampedArray(sliceRGBA),size.y, size.z);
}


function getYViewSlice(data, slice, size) {
    let sliceRGBA = [];
    for(let i=size.z-1; i >= 0; i--) {
        const rowIndex = get1DIndex(0,slice,i,size);
        sliceRGBA.push(...data.slice(rowIndex, rowIndex + size.x));
    }
    sliceRGBA = sliceRGBA.reduce(grayScaleToRGB,[]);
    return new ImageData(new Uint8ClampedArray(sliceRGBA),size.x, size.z);
}

function getZViewSlice(data, slice, size) {
    const sliceIndex = get1DIndex(0,0,slice,size);
    const sliceRGBA = data
        .slice(sliceIndex, sliceIndex + size.x * size.y)
        .reduce(grayScaleToRGB,[]);
    return new ImageData(new Uint8ClampedArray(sliceRGBA),size.x, size.y);
}

myZViewCanvas.addEventListener('click', event => {
    const xCoor = event.x - myZViewCanvas.offsetLeft + document.documentElement.scrollLeft;
    const yCoor = event.y - myZViewCanvas.offsetTop + document.documentElement.scrollTop;
    xViewContext.putImageData(getXViewSlice(data, xCoor, dims) ,0,0);
    yViewContext.putImageData(getYViewSlice(data, yCoor, dims) ,0,0);
});

myYViewCanvas.addEventListener('click', event => {
    const xCoor = event.pageX - myYViewCanvas.offsetLeft;
    const yCoor = dims.z - (event.pageY - myYViewCanvas.offsetTop);
    xViewContext.putImageData(getXViewSlice(data, xCoor, dims) ,0,0);
    zViewContext.putImageData(getZViewSlice(data, yCoor, dims) ,0,0);
});

myXViewCanvas.addEventListener('click', event => {
    const xCoor = event.pageX - myXViewCanvas.offsetLeft;
    const yCoor = dims.z - (event.pageY - myXViewCanvas.offsetTop);
    yViewContext.putImageData(getYViewSlice(data, xCoor, dims) ,0,0);
    zViewContext.putImageData(getZViewSlice(data, yCoor, dims) ,0,0);
});

function grayScaleToRGB(accumulate, RGandB) {
    const alpha = 255;
    accumulate.push(RGandB, RGandB, RGandB, alpha);
    return accumulate;
}

function get1DIndex(x,y,z,size) {
    return  x + y*size.x + z*size.x*size.y;
}
