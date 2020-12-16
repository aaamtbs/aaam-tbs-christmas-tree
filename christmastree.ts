// 在這裡添加你的程式
/**
* Use this file to define custom functions and blocks.
* Read more at https://makecode.microbit.org/blocks/custom
*/

enum LEDMode {
        //% block="Rainbow Mode"
        Rainbow = 0,
        //% block="Equalizer Mode"
        Equalizer = 1,
        //% block="Breath Mode"
        Breath = 2,
        //% block="Ring Mode"
        Ring = 3
}

/**
* Christmas Tree blocks
*/
//% weight=100 color=#0fab11 icon="❄"
namespace ChristmasTree {
    export class ChristmasTree {
        mode:LEDMode;
        strip: neopixel.Strip;
        numOfLEDs:number;
        totalNumLeds:number;
        numOfLEDPerPillar:number;
        
        private _colorStep:number;

        private _lastMicVal:number;
        private _colorOffset:number;

        rainbowSpeed:number;
        private _isSetupRainbow:boolean;
        
        
        private _breathT:number;
        private _breathDir:number;
        private _breathColorOffset:number;

        private _ringState:number[];
        private _ringColor:number[];
        

        //_isSetupRainbow = false;

        public updateVars():void{
            this._colorStep = 360/this.numOfLEDPerPillar;
            this._colorOffset = 0;
            this._lastMicVal = -1;
            this._breathT = 0;
            this._breathDir = 1;
            this._breathColorOffset = 0;

            this._ringState = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            this._ringColor = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]

        }

        /**
         * Control tree to play specfic mode
         */
        //% blockId="christmastree_changeMode" block="Play mode(%mode) animation"
        //% weight=90 blockGap=8
        //% parts="christmastree"
        public changeMode(m:LEDMode):void{
            this._isSetupRainbow = false;
            this.mode = m;
        }

        /**
         * Control tree to play next preset animation
         */
        //% blockId="christmastree_nextMode" block="%tree Play next animation"
        //% weight=90 blockGap=8
        //% parts="christmastree"
        public nextMode():void{
            this._isSetupRainbow = false;
            this.mode += 1;
            if(this.mode>=4){
                this.mode = 0;
            }
        }
        /**
         * Control tree to play previous preset animation
         */
        //% blockId="christmastree_previousMode" block="%tree Play previous animation"
        //% weight=90 blockGap=8
        //% parts="christmastree"
        public previousMode():void{
            this._isSetupRainbow = false;
            this.mode -= 1;
            if(this.mode<=0){
                this.mode = 3;
            }
        }

        public update():void{
            if(this.mode==0){
                this.rainbowAnimation();
            }else if(this.mode==1){
                this.equalizerAnimation(input.soundLevel());
            }else if(this.mode==2){
                this.breathAnimation();
            }else if(this.mode==3){
                this.ringAnimation(input.soundLevel(), 100)
            }
            this._colorOffset+=1;
            this._breathColorOffset+=1;
            this._breathT+=1;

            if(this._colorOffset>360){
                this._colorOffset = 0;
            }
            if(this._breathT>100){
                this._breathT = 1;
            }
        }

        /**
         * Play Rainbow animation
         */
        //% blockId="christmastree_rainbowAnimation" block="Play Rainbow animation"
        //% weight=90 blockGap=8
        //% parts="christmastree"
        public rainbowAnimation():void{
            if(this._isSetupRainbow == false || this._isSetupRainbow == null){
                this._isSetupRainbow = true;
                this.strip.clear()
                this.strip.showRainbow(1, 360)
            }
            this.strip.rotate(this.rainbowSpeed)
            this.strip.show()
            basic.pause(100);
        }

        /**
         * Play Equalize animation with Mic level
         */
        //% blockId="christmastree_equalizerAnimation" block="Play Equalize animation with Mic level (%micLevel)"
        //% weight=90 blockGap=8
        //% parts="christmastree"
        public equalizerAnimation(micVal:number):void{
            if(this._lastMicVal!=-1){
                if(micVal < this._lastMicVal){
                    micVal = micVal + ((this._lastMicVal - micVal) * 0.2)
                }else{
                    micVal = this._lastMicVal + ((micVal - this._lastMicVal) * 0.95)
                }
            }
            this._lastMicVal = micVal;
            let anchor:number = micVal / 100 * this.numOfLEDPerPillar
            
            this.strip.clear()
            for (let idx = 0; idx <= this.numOfLEDPerPillar; idx++) {
                let _color = idx * this._colorStep + this._colorOffset % 360
                console.log(_color + ", " + idx + ", " + this._colorStep + ", " + this._colorOffset )
                if (idx <= anchor) {
                    this.setLevelColor(idx, this.makeColor(_color, 100, 50))
                } else {
                    let _saturation:number = (45 - 5) * ((this.numOfLEDPerPillar - idx) / (this.numOfLEDPerPillar - anchor)) * 0.6
                    let _brightness:number = (100 - 40) * ((this.numOfLEDPerPillar - idx) / (this.numOfLEDPerPillar - anchor)) * 1
                    if (_saturation < 5) {
                        _saturation = 5
                    }
                    this.setLevelColor(idx, this.makeColor(_color, _saturation, _brightness))
                }
            }
            this.strip.show();
            basic.pause(1);
        }


        /**
         * Play breath animation
         */
        //% blockId="christmastree_breathAnimation" block="Play breath animation"
        //% weight=90 blockGap=8
        //% parts="christmastree"
        public breathAnimation () {
            if (this._breathT % 100 == 0) {
                this._breathDir *= -1;
            }
            let breathB = 0;
            if (this._breathDir == 1) {
                breathB = this.easeInOutQuad(this._breathT % 100, 0, 100, 100)
            } else {
                breathB = 100 - this.easeInOutQuad(this._breathT % 100, 0, 100, 100)
            }

            this.strip.clear()
            for (let index = 0; index < this.numOfLEDPerPillar; index++) {
                let color = this.makeColor((this._breathColorOffset / 7 + (60 / this.numOfLEDPerPillar * index)) % 360, 100, breathB * 0.45 + 5)
                this.setLevelColor(index, color)
            }
            this.strip.show()
        }

        /**
         * Play ring animation
         */
        //% blockId="christmastree_ringAnimation" block="Play ring animation"
        //% weight=90 blockGap=8
        //% parts="christmastree"
        public ringAnimation(micVal:Number, threshold:Number):void{
            let _duration = 3
            if (micVal > threshold) {
                this._ringState[0] = this._ringState[1] = _duration
                this._ringColor[0] = this._ringColor[1] = this.makeColor(Math.random() * 360, 100, 50)
            }
            this.strip.clear()

            for (let level = 0; level < this.numOfLEDPerPillar; level++) {
                if(this._ringState[level] > 0){
                    this.setLevelColor(level, this._ringColor[level])
                    this._ringState[level] -= 1;
                    if(this._ringState[level]==0 && level + 1 < this.numOfLEDPerPillar){
                        this._ringState[level+1] = _duration + 1;
                        this._ringColor[level+1] = this._ringColor[level]
                    }
                }else{
                    this.setLevelColor(level, this.makeColor(30, 25, 10))
                }
            }
            this.strip.show()
        }

        /**
         * Create color number from hue, saturation, brightness
         */
        //% blockId="christmastree_ringAnimation" block="Create color with %hue %saturation %brightness"
        //% weight=90 blockGap=8
        //% parts="christmastree"
        public makeColor(color:number, saturation:number, brightness:number):number{
            return neopixel.hsl(color, saturation, brightness)
        }

        /**
         * Set led color for specfic level from 0 - 18 (0 = level-1, 1 = level-2, etc...)
         */
        //% blockId="christmastree_setLevelColor" block="%tree Set led color for level-%level"
        //% weight=90 blockGap=8
        //% parts="christmastree"
        public setLevelColor(level:number, color:number):void{
            this.strip.setPixelColor(level, color)
            this.strip.setPixelColor(39 - level, color)
            this.strip.setPixelColor(level + 41, color)
            this.strip.setPixelColor(81 - level, color)

            if(level==this.numOfLEDPerPillar-1){
                this.strip.setPixelColor(19, color)
                this.strip.setPixelColor(20, color)
                this.strip.setPixelColor(60, color)
                this.strip.setPixelColor(61, color)
                this.strip.setPixelColor(62, color)
            }
        }


        /**
         * Ease in out quad equation
         */
        //% blockId="christmastree_easeInOutQuad" block="easeInOutQuad(%percent, %elapsed, %start, %end)"
        //% weight=90 blockGap=8
        //% parts="christmastree"
        public easeInOutQuad (_percent: number, _elapsed: number, _start: number, _end: number) {
            _percent /= _end/2;
            
            if (_percent < 1) {
                return _start / 2 * _percent * _percent + _elapsed
            }
            _percent += -1
            return (0 - _start) / 2 * (_percent * (_percent - 2) - 1) + _elapsed
        }
    }   
   /**
     * Create a new Christmas Tree controller.
     * @param mode the default mode where the Christmas tree default setting.
     */
    //% blockId="christmastree_create" block="ChristmasTree with leds as %mode"
    //% weight=90 blockGap=8
    //% parts="christmastree"
    //% trackArgs=0,1
    //% blockSetVariable=strip
    export function create(mode: LEDMode): ChristmasTree {
        let tree = new ChristmasTree();
        tree.mode = mode;
        tree.numOfLEDPerPillar = 19;
        tree.totalNumLeds = 81;
        tree.strip = neopixel.create(DigitalPin.P2, tree.totalNumLeds, NeoPixelMode.RGB);
        tree.rainbowSpeed = 1;

        tree.updateVars();
        return tree;
    }

    
    /**
     * Update christmas tree light animation
     */
    //% blockId="christmastree_update" block="Update %tree light animation"
    //% weight=90 blockGap=8
    //% parts="christmastree"
    export function update(tree:ChristmasTree):void{
        tree.update()
    }


    
}
