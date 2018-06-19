var Slider = function() {
    this.element = document.createElement("div");
    this.element.classList.add("twoButtonSlider");
    this.lowButt = document.createElement("div");
    this.lowButt.classList.add("lowButton");
    this.element.appendChild(this.lowButt);
    this.upButt = document.createElement("div");
    this.upButt.classList.add("upButton");
    this.element.appendChild(this.upButt);
    
    for (let b of [this.lowButt, this.upButt]) {
        b.draggable = true;
        b.ondragstart = evt=>{evt.dataTransfer.setDragImage(new Image(), 0, 0);};
    }
    
    this.minValue = 0;
    this.maxValue = 100;
    this.lowValue = 0;
    this.upValue = 100;
    
    //this.draggedButt = null;
    
};


Slider.prototype.getElement = function() {
    return this.element;
};

Slider.prototype.init = function() {
    
    var self = this;
    this.lowButt.ondrag = function(evt) {
        
    };
}