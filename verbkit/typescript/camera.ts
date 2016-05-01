/// <reference path="PixiTS/pixi.d.ts" />
/// <reference path="GameObject.ts" />

enum CameraOption {
    Centered,
    Leashed,
    VerticallyLocked,
    HorizontallyLocked
}

class Camera {   
    viewPort:PIXI.Container;
    focus:GameObject;
    
    freedom:[number, number] = [0, 0];
    currentLeashPull:[number, number] = [0, 0];
    
    cameraOptions:boolean[] = [false, false, false, false];
    
    focusOn(gameObject:GameObject) { 
        this.focus = gameObject;
        return this;
    }
    
    zoomIn(zoom:number) {
        this.viewPort.scale.x += zoom;
        this.viewPort.scale.y += zoom;
        return this;
    }
    
    zoomOut(zoom:number) {
        this.viewPort.scale.x -= zoom;
        this.viewPort.scale.y -= zoom;
        return this;
    }
        
    centerCamera() { 
        this.cameraOptions[CameraOption.Centered] = true;
        return this;
    }
    
    leashCamera(width, height) { 
        this.cameraOptions[CameraOption.Leashed] = true;
        this.freedom = [width, height];
        return this;
    }
    
    verticallyLocked():Camera { 
        this.cameraOptions[CameraOption.VerticallyLocked] = true;
        return this; 
    }
    
    horizontallyLocked() { 
        this.cameraOptions[CameraOption.HorizontallyLocked] = true;
        return this; 
    }
    
    update() {
        if(this.cameraOptions[CameraOption.Centered]) {
            if(this.focus.graphic.x > 0) { this.viewPort.x = -this.focus.graphic.x + this.viewPort.width / 2; }
            if(this.focus.graphic.y > 0) { this.viewPort.y = -this.focus.graphic.y + this.viewPort.height / 2; }
        } else if(this.cameraOptions[CameraOption.VerticallyLocked]) {
            if(this.focus.graphic.x > 0) { this.viewPort.x = -this.focus.graphic.x + this.viewPort.width / 2; }
        } else if(this.cameraOptions[CameraOption.HorizontallyLocked]) {
            if(this.focus.graphic.y > 0) { this.viewPort.y = -this.focus.graphic.y + this.viewPort.height / 2; }    
        }
        //this.viewPort.y = this.focus.graphic.y - this.viewPort.height / 2;
    }
}