import { Component, ElementRef, HostListener, OnInit, SimpleChanges, ViewChild } from '@angular/core';

@Component({
    selector: 'color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.scss']
})
export class ColorPickerComponent implements OnInit {

    public hue?: string
    public color?: string
    hexColor: string = ''
    choosenColor?: string = ''

    defaultColors: number[][] = [
        [ 255, 0, 0 ],
        [ 0, 255, 0 ],
        [ 0, 0, 255 ],
        [ 255, 255, 0 ],
        [ 0, 0, 0 ],
        [ 255, 255, 255 ],
    ]

    constructor() { }

    ngOnInit(): void {
    }

    onclick(color: string | undefined) {
        this.choosenColor = color
        console.log(this.choosenColor)

    }

    @ViewChild('canvas') canvas?: ElementRef
    @ViewChild('canvasSlider') canvasSlider?: ElementRef;

    private ctx?: CanvasRenderingContext2D
    private mousedown: boolean = false
    public selectedPosition?: { x: number; y: number }

    private ctxSlider?: CanvasRenderingContext2D;
    private mousedownSlider: boolean = false;
    private selectedHeight: number | undefined;

    ngAfterViewInit() {
        this.draw()
        this.drawSlider()
    }

    draw() {
        if (!this.ctx) {
            this.ctx = this.canvas?.nativeElement.getContext('2d')
        }
        if (this.ctx) {
            const width = this.canvas?.nativeElement.width
            const height = this.canvas?.nativeElement.height

            this.ctx.fillStyle = this.hue || 'rgba(255,255,255,1)'
            this.ctx.fillRect(0, 0, width, height)

            const whiteGrad = this.ctx.createLinearGradient(0, 0, width, 0)
            whiteGrad.addColorStop(0, 'rgba(255,255,255,1)')
            whiteGrad.addColorStop(1, 'rgba(255,255,255,0)')

            this.ctx.fillStyle = whiteGrad
            this.ctx.fillRect(0, 0, width, height)

            const blackGrad = this.ctx.createLinearGradient(0, 0, 0, height)
            blackGrad.addColorStop(0, 'rgba(0,0,0,0)')
            blackGrad.addColorStop(1, 'rgba(0,0,0,1)')

            this.ctx.fillStyle = blackGrad
            this.ctx.fillRect(0, 0, width, height)

            if (this.selectedPosition) {
                this.ctx.strokeStyle = 'white'
                this.ctx.fillStyle = 'white'
                this.ctx.beginPath()
                this.ctx.arc(
                    this.selectedPosition.x,
                    this.selectedPosition.y,
                    10,
                    0,
                    2 * Math.PI
                )
                this.ctx.lineWidth = 5
                this.ctx.stroke()
            }
        }
    }

    // ngOnChanges(changes: SimpleChanges) {
    //   if (changes['hue']) {
    //     this.draw()
    //     this.drawSlider()
    //     console.log('lol')
    //     const pos = this.selectedPosition
    //     if (pos) {
    //       this.color = this.getColorAtPosition(pos.x, pos.y)
    //     }
    //   }
    // }

    drawNewPallete(string: string) {
        this.hue = string
        this.draw()

    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(evt: MouseEvent) {
        this.mousedown = false
    }

    onMouseDown(evt: MouseEvent) {
        this.mousedown = true
        this.selectedPosition = { x: evt.offsetX, y: evt.offsetY }
        this.draw()
        this.color = this.getColorAtPosition(evt.offsetX, evt.offsetY)
    }

    onMouseMove(evt: MouseEvent) {
        if (this.mousedown) {
            this.selectedPosition = { x: evt.offsetX, y: evt.offsetY }
            this.draw()
            this.emitColor(evt.offsetX, evt.offsetY)
        }
    }

    emitColor(x: number, y: number) {
        const rgbaColor = this.getColorAtPosition(x, y)
        this.color = rgbaColor


    }

    getColorAtPosition(x: number, y: number) {
        if (this.ctx) {
            const imageData = this.ctx?.getImageData(x, y, 1, 1).data
            this.hexColor = this.rgbToHex(imageData[0], imageData[1], imageData[2])
            // console.log('rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ')')
            return (
                'rgb(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ')'
            )
        }
        return
    }

    //slider

    drawSlider() {
        if (!this.ctxSlider) {
            this.ctxSlider = this.canvasSlider?.nativeElement.getContext('2d');
        }
        if (this.ctxSlider) {

            const width = this.canvasSlider?.nativeElement.width;
            const height = this.canvasSlider?.nativeElement.height;
            this.ctxSlider?.clearRect(0, 0, width, height);
            const gradient = this.ctxSlider?.createLinearGradient(0, 0, 0, height);

            gradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
            gradient.addColorStop(0.17, 'rgba(255, 255, 0, 1)');
            gradient.addColorStop(0.34, 'rgba(0, 255, 0, 1)');
            gradient.addColorStop(0.51, 'rgba(0, 255, 255, 1)');
            gradient.addColorStop(0.68, 'rgba(0, 0, 255, 1)');
            gradient.addColorStop(0.85, 'rgba(255, 0, 255, 1)');
            gradient.addColorStop(1, 'rgba(255, 0, 0, 1)');

            this.ctxSlider.beginPath();
            this.ctxSlider.rect(0, 0, width, height);
            this.ctxSlider.fillStyle = gradient;
            this.ctxSlider.fill();
            this.ctxSlider.closePath();

            if (this.selectedHeight) {
                this.ctxSlider.beginPath();
                this.ctxSlider.strokeStyle = 'white';
                this.ctxSlider.lineWidth = 5;
                this.ctxSlider.rect(0, this.selectedHeight - 5, width, 10);
                this.ctxSlider.stroke();
                this.ctxSlider.closePath();
            }

        }
    }

    onMouseDownInSlider(evt: MouseEvent) {
        this.mousedownSlider = true;
        this.selectedHeight = evt.offsetY;
        this.drawSlider();
        this.draw();
        this.emitColorSlider(evt.offsetX, evt.offsetY);
    }

    onMouseMoveInSlider(evt: MouseEvent) {
        if (this.mousedownSlider) {
            this.selectedHeight = evt.offsetY;
            this.drawSlider();
            this.draw()
            this.emitColorSlider(evt.offsetX, evt.offsetY);
        }
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUpInSlider(evt: MouseEvent) {
        this.mousedownSlider = false;
        this.mousedown = false
        this.draw()
    }

    emitColorSlider(x: number, y: number) {
        const rgbaColor = this.getColorAtPositioninSlider(x, y);
        this.hue = (rgbaColor);
        this.color = this.hue
    }

    getColorAtPositioninSlider(x: number, y: number) {
        if (this.ctxSlider) {
            const imageData = this.ctxSlider.getImageData(x, y, 1, 1).data;
            this.hexColor = this.rgbToHex(imageData[0], imageData[1], imageData[2])
            // console.log('rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ')')
            return 'rgb(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ')';
        }
        return
    }


    rgbToHex(r: number, g: number, b: number) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    hexToRgb(hex: string) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    selectDefaultColor(color:number[]) {

        this.hue = ('rgb(' + color[0]+ ',' +color[1] +','+ color[2]+')' )
        this.color = ('rgb(' + color[0]+ ',' +color[1] +','+ color[2]+')' )
        this.hexColor = (this.rgbToHex(color[0], color[1], color[2] ))

        this.draw()
        this.drawSlider()

    }



    cookColor(color:number[]) {
        return `rgb(${color[0]},${color[1]},${color[2]})`
    }
}
