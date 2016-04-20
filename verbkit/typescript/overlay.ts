/// <reference path="PixiTS/pixi.d.ts" />
/// <reference path="utils.ts" />

class UI {
    represents:Pointer<number | boolean | string>;
    background:PIXI.Sprite;
    update():void {};
}

class BarUI extends UI {

}

class TextUI extends UI {
    text:PIXI.Text;

    style:PIXI.TextStyle;

    constructor(display:(string | Pointer<number | boolean | string>), style:PIXI.TextStyle, position:Vector2, background:string = undefined) {
        super();

        style = style || {
            font: "15px Arial",
            fill: "white"
        };

        if(display instanceof Pointer) {
            this.represents = <Pointer<number | boolean | string>>display;
            this.text = new PIXI.Text(display.toString(), style);
        } else {
            this.text = new PIXI.Text(<string>display, style);
        }

        this.background = PIXI.Sprite.fromImage(background);
        this.background.scale.x = 64;
        this.background.scale.y = 24;
        this.background.x = position.x;
        this.background.y = position.y;
        this.background.tint = 0xa0a0a0;

        this.text.x = position.x;
        this.text.y = position.y;
    }

    update() {
        super.update();

        if(this.represents !== undefined) {
            if(typeof this.represents.get() === "number") {
                this.text.text = Math.round(<number>this.represents.get()).toString();
            } else {
                this.text.text = this.represents.toString();
            }
        }
    }
}

class Overlay {
    userInterfaces:UI[] = [];
}
