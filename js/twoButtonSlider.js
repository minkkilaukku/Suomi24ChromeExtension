var Slider = function() {
    this.element = document.createElement("div");
    this.element.classList.add("twoButtonSlider");
    this.element.setAttribute("tabindex", 1);
    this.lowButt = document.createElement("div");
    this.lowButt.classList.add("lowButton");
    this.element.appendChild(this.lowButt);
    this.upButt = document.createElement("div");
    this.upButt.classList.add("upButton");
    this.element.appendChild(this.upButt);
    
    for (let b of [this.lowButt, this.upButt]) {
        b.onmousedown = _=>this.draggedButt = b;
    }
    
    var self = this;
    document.addEventListener("mousemove", function(evt) {
        if (self.draggedButt) {
            evt.preventDefault();
            var bdd = self.element.getBoundingClientRect();
            var x = -self.element.offsetLeft + evt.clientX;
            var per = x/bdd.width;
            per = Math.max(0, Math.min(1, per)); //limit to [0, 1]
            //TODO snap to steps
            
            if (self.draggedButt===self.lowButt) {
                self.setLowValueFromPer(per); //Math.min(per, self.getUpValuePer())
                if (self.getLowValue()>self.getUpValue()) {
                    self.setUpValue(self.getLowValue()); //allow drag bound with the other
                }
            } else if (self.draggedButt===self.upButt) {
                self.setUpValueFromPer(per);
                if (self.getLowValue()>self.getUpValue()) {
                    self.setLowValue(self.getUpValue());
                }
            }
            if (typeof self.oninput === "function") {
                self.oninput();
            }
            
            self.updateButts();
        }
    });
    
    document.addEventListener("mouseup", function(evt) {
        self.draggedButt = null;
    });
    
    this.element.addEventListener("keydown", function(evt) {
        console.log(evt.keyCode);
        if (evt.keyCode===37) { //left
            evt.preventDefault();
            self.stepValue(-1, 0);
        } else if (evt.keyCode===39) { //right
            evt.preventDefault();
            self.stepValue(1, 0);
        } else if (evt.keyCode===40) { //up
            evt.preventDefault();
            self.stepValue(0, -1);
        } else if (evt.keyCode===38) { //down
            evt.preventDefault();
            self.stepValue(0, 1);
        }
        self.updateButts();
    });
    
    /*
    this.element.onmouseup = function(evt) {
        self.draggedButt = null;
    };
    
    
    this.element.onblur = function(evt) {
        self.draggedButt = null;
        console.log("blurred!!!");
    };
    */
    
    this.minValue = 0;
    this.maxValue = 100;
    this.lowValue = 0;
    this.upValue = 100;
    this.stepSize = 1;
    
    this.draggedButt = null;
    this.oninput = null;
    //this.focusedButt = null;
};


Slider.prototype.getElement = function() {
    return this.element;
};

/** Move the buttons to correct positions according to values */
Slider.prototype.updateButts = function() {
    var bdd = this.element.getBoundingClientRect();
    var moveButt = function(butt, per) {
        //console.log("Updating buttons, bdd=",bdd);
        var buttBdd = butt.getBoundingClientRect();
        var x = per*bdd.width;
        var perForStyleLeft = (x - 0.5*buttBdd.width)/bdd.width; //center of button to indicate the value
        butt.style.left = (perForStyleLeft*100)+"%";
    };
    
    moveButt(this.lowButt, this.getLowValuePer());
    moveButt(this.upButt, this.getUpValuePer());
    //console.log("lowVal: "+this.lowValue+", lowButt: "+this.lowButt.style.left);
    //console.log("upVal: "+this.upValue+", upButt: "+this.upButt.style.left);
};


Slider.prototype.getLowValue = function() {
    return this.lowValue;
    //NONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONO
    ///return this.minValue + this.lowValue*(this.maxValue-this.minValue);
    //NONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONO
};


Slider.prototype.getUpValue = function() {
    return this.upValue;
    //NONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONO
    //return this.minValue + this.upValue*(this.maxValue-this.minValue);
    //NONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONO
};

Slider.prototype.setLowValue = function(val) {
    this.lowValue = Math.max(this.minValue, Math.min(this.maxValue, val)); //limit to [min, max]
    //NONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONO
    //this.lowValue = (val-this.minValue)/(this.maxValue-this.minValue);
    //NONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONO
    this.updateButts();
};

Slider.prototype.setUpValue = function(val) {
    this.upValue = Math.max(this.minValue, Math.min(this.maxValue, val)); //limit to [min, max]
    //NONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONO
    //this.upValue = (val-this.minValue)/(this.maxValue-this.minValue);
    //NONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONO
    this.updateButts();
};








Slider.prototype.setLowValueFromPer = function(per) {
    this.lowValue = this.minValue + per*(this.maxValue-this.minValue);
};

Slider.prototype.setUpValueFromPer = function(per) {
    this.upValue = this.minValue + per*(this.maxValue-this.minValue);
};









/** the low value as a fraction of percentage between min value and max value */
Slider.prototype.getLowValuePer = function() {
    return (this.lowValue-this.minValue)/(this.maxValue-this.minValue);
};

/** the up value as a fraction of percentage between min value and max value */
Slider.prototype.getUpValuePer = function() {
    return (this.upValue-this.minValue)/(this.maxValue-this.minValue);
};



Slider.prototype.setMaxValue = function(val) {
    this.maxValue = val;
    if (this.getUpValue()>this.maxValue) this.setUpValue(this.maxValue);
    if (this.getLowValue()>this.maxValue) this.setLowValue(this.maxValue);
};

Slider.prototype.setMinValue = function(val) {
    this.minValue = val;
    if (this.getUpValue()<this.minValue) this.setUpValue(this.minValue);
    if (this.getLowValue()<this.minValue) this.setLowValue(this.minValue);
};


Slider.prototype.stepValue = function(lowSteps=0, upSteps=0) {
    this.setLowValue(this.lowValue+lowSteps*this.stepSize);
    this.setUpValue(this.upValue+upSteps*this.stepSize);
    
    
    if (this.lowValue>this.upValue) {
        if (lowSteps>0) {
            this.setUpValue(this.lowValue);
        } else {
            this.setLowValue(this.upValue);
        }
    }
};


/** Distance between up value and low value */
Slider.prototype.getIntervalLength = function() {
    return this.getUpValue() - this.getLowValue();
};