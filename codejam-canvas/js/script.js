class PixelCanvas {

    constructor(canvas, colorMenu) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.setAmountPixels(4);
        this.colorMenu = colorMenu;

        this.canvas.addEventListener("mousemove", event => {
            localStorage.setItem("canvasData", JSON.stringify(this.createData()));
        });
        if (localStorage.getItem("canvasData")) {
            this.drawByData(JSON.parse(localStorage.getItem("canvasData")));
        }
    }

    setAmountPixels(amountPixels) {
        this.clearCanvas();
        this.amountPixels = amountPixels;
        this.pixelSize = Math.floor(this.canvas.width / this.amountPixels);
    }

    drawPixel(event) {
        let pos = this.createPositionByMousedown(event);
        this.context.fillStyle = this.colorMenu.curColor;
        this.context.fillRect(pos.x, pos.y, this.pixelSize, this.pixelSize);
    }

    fillCanvas() {
        this.context.fillStyle = this.colorMenu.curColor;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.width);
    }

    clearCanvas() {
        this.context.fillStyle = "#FFFFFF";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.width);
    }

    getColorByPoint(x, y) {
        let d = this.context.getImageData(x, y, 1, 1).data;
        return rgbToHex(`rgb(${d[0]}, ${d[1]}, ${d[2]})`);
    }

    createPositionByRowAndCol(row, col) {
        return {x: row * this.pixelSize, y: col * this.pixelSize};
    }

    createPositionByMousedown(e) {
        let row = Math.floor(e.offsetX / this.pixelSize);
        let col = Math.floor(e.offsetY / this.pixelSize);
        return this.createPositionByRowAndCol(row, col);
    }

    createData() {
        let size = this.amountPixels;
        let data = new Array(size);
        for (let i = 0, y = 0; i < size; i++) {
            data[i] = new Array(size);
            for (let j = 0, x = 0; j < size; j++) {
                data[i][j] = this.getColorByPoint(x, y);
                x += this.pixelSize;
            }
            y += this.pixelSize;
        }
        return data;
    }

    drawByData(data) {
        for (let i = 0, y = 0; i < data.length; i++) {
            for (let j = 0, x = 0; j < data[i].length; j++) {
                this.context.fillStyle = data[i][j];
                this.context.fillRect(x, y, this.pixelSize, this.pixelSize);
                x += this.pixelSize;
            }
            y += this.pixelSize;
        }
    }
}

class ColorMenu {
    constructor(cp) {
        this.cp = cp;
        this.curColor = this.prevColor = "#000000";
        this.colorPicker = document.getElementById("color-picker");
        this.picker = document.getElementById("picker");
        this.pcr = document.getElementById('pcr');
        this.btnCurColor = document.getElementById("btnCurColor");
        this.svgCurColor = document.getElementById("svgCurColor");
        this.btnPrevColor = document.getElementById("btnPrevColor");
        this.svgPrevColor = document.getElementById("svgPrevColor");
        this.btnRedColor = document.getElementById("btnRedColor");
        this.svgRedColor = document.getElementById("svgRedColor");
        this.btnBlueColor = document.getElementById("btnBlueColor");
        this.svgBlueColor = document.getElementById("svgBlueColor");
        this.canvasSection = document.getElementById("canvas-section");

        this.colorPicker.style.display = "none";
        this.svgCurColor.style.fill = this.svgPrevColor.style.fill = this.curColor;
        this.svgRedColor.style.fill = "#ff0000";
        this.svgBlueColor.style.fill = "#0000ff";
        this.cp.setHex(this.curColor);

        canvas.addEventListener('mouseover', ev => this.removeColorPicker());
        this.canvasSection.addEventListener('mouseover', ev => this.removeColorPicker());
        this.btnCurColor.addEventListener("click", ev => this.showColorPicker());
        this.picker.addEventListener("click", ev => this.pickColor());
        this.pcr.addEventListener("click", ev => this.pickColor());
        this.btnPrevColor.addEventListener("click", ev => this.choosePreviousColor());
        this.btnRedColor.addEventListener("click", ev => this.chooseExampleColor(ev));
        this.btnBlueColor.addEventListener("click", ev => this.chooseExampleColor(ev));
    }

    showColorPicker() {
        if (this.colorPicker.style.display === "none") {
            this.colorPicker.style.display = "block";
        } else {
            this.removeColorPicker();
        }
    }

    removeColorPicker() {
        if (this.colorPicker.style.display === "block") {
            this.colorPicker.style.display = "none";
            this.setCurrentColor(this.svgCurColor.style.fill);
        }
    }

    setCurrentColor(color) {
        this.prevColor = this.curColor;
        this.curColor = color;
        this.svgCurColor.style.fill = this.curColor;
        this.svgPrevColor.style.fill = this.prevColor;
    }

    pickColor() {
        this.svgCurColor.style.fill = rgbToHex(document.getElementById("pcr_bg").style.backgroundColor);
    }

    choosePreviousColor() {
        this.setCurrentColor(this.prevColor);
    }

    chooseExampleColor(event) {
        this.setCurrentColor(rgbToHex(event.currentTarget.children[0].children[0].style.fill));
    }
}

class ToolsMenu {
    constructor(pixelCanvas) {
        this.pixelCanvas = pixelCanvas;
        this.btnClass = "list-group-item list-group-item-action";
        this.btnActiveClass = "list-group-item list-group-item-action active";

        this.btnPaintBucket = document.getElementById("btnPaintBucket");
        this.btnChooseColor = document.getElementById("btnChooseColor");
        this.btnPencil = document.getElementById("btnPencil");
        this.btnTransform = document.getElementById("btnTransform");

        this.btnPaintBucket.toolAction = function (event) {
            pixelCanvas.fillCanvas();
        };
        this.btnChooseColor.toolAction = function (event) {
            let color = pixelCanvas.getColorByPoint(event.offsetX, event.offsetY);
            pixelCanvas.colorMenu.setCurrentColor(color);
        };
        this.btnPencil.toolAction = function (event) {
            pixelCanvas.drawPixel(event);
        };

        this.btnPaintBucket.addEventListener("click", ev => this.bindAction(this.btnPaintBucket));
        this.btnChooseColor.addEventListener("click", ev => this.bindAction(this.btnChooseColor));
        this.btnPencil.addEventListener("click", ev => this.bindAction(this.btnPencil));

        this.activeToolMenu(this.btnPencil);
        this.bindAction(this.btnPencil);
    }

    bindAction(btn) {
        this.untieAction();
        this.pixelCanvas.canvas.addEventListener("click", btn.toolAction);
        this.activeToolMenu(btn);
    }

    untieAction() {
        this.pixelCanvas.canvas.removeEventListener("click", this.activeTool.toolAction);
    }

    activeToolMenu(btn) {
        if (this.activeTool) {
            this.activeTool.className = this.btnClass;
        }
        btn.className = this.btnActiveClass;
        this.activeTool = btn;
    }
}

function rgbToHex(color) {
    color = "" + color;
    if (!color || color.indexOf("rgb") < 0) {
        return;
    }

    if (color.charAt(0) === "#") {
        return color;
    }

    var nums = /(.*?)rgb\((\d+),\s*(\d+),\s*(\d+)\)/i.exec(color),
        r = parseInt(nums[2], 10).toString(16),
        g = parseInt(nums[3], 10).toString(16),
        b = parseInt(nums[4], 10).toString(16);

    return "#" + (
        (r.length === 1 ? "0" + r : r) +
        (g.length === 1 ? "0" + g : g) +
        (b.length === 1 ? "0" + b : b)
    );
}

const canvas = document.getElementById('canvas');
let cp = ColorPicker(document.getElementById('pcr'), document.getElementById('picker'),
    function (hex, hsv, rgb, mousePicker, mousepcr) {
        currentColor = hex;
        ColorPicker.positionIndicators(
            document.getElementById('pcr-indicator'),
            document.getElementById('picker-indicator'),
            mousepcr, mousePicker);

        document.getElementById('hex').innerHTML = hex;
        document.getElementById('rgb').innerHTML = 'rgb(' + rgb.r.toFixed() + ',' + rgb.g.toFixed() + ',' + rgb.b.toFixed() + ')';
        document.getElementById('hsv').innerHTML = 'hsv(' + hsv.h.toFixed() + ',' + hsv.s.toFixed(2) + ',' + hsv.v.toFixed(2) + ')';

        document.getElementById('pcr_bg').style.backgroundColor = hex;
    });
let colorMenu = new ColorMenu(cp);
let pixelCanvas = new PixelCanvas(canvas, colorMenu);
let toolsMenu = new ToolsMenu(pixelCanvas);

function size4x4() {
    pixelCanvas.setAmountPixels(4);
    activeBtnSize(document.getElementById("size4x4"));
}

function size32x32() {
    pixelCanvas.setAmountPixels(32);
    activeBtnSize(document.getElementById("size32x32"));
}

let activeBtn;

function activeBtnSize(btn) {
    if (activeBtn) {
        activeBtn.className = toolsMenu.btnClass;
    }
    btn.className = toolsMenu.btnActiveClass;
    activeBtn = btn;
}

function fun() {

}

activeBtn = document.getElementById("size4x4");
document.getElementById("size4x4").className = toolsMenu.btnActiveClass;