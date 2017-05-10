/* 
The MIT License (MIT)

Copyright (c) 2015 Alexandre Dubé

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

 */



(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define([], function () {
      return (factory());
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    factory();
  }
}(this, function () {
        ol.control.panZoomBar = function(opt_options) {
		
		var options = opt_options || {};
                

                this.className_ = options.className ? options.className : 'ol-panzoom';
                
                this.pixelDelta_ = options.pixelDelta !== undefined ? options.pixelDelta : 128;

                this.imgPath_ = options.imgPath ? options.imgPath : null;
                
                this.left_ = options.left ? options.left : 0;
                this.top_ = options.top ? options.top : 50;
                if(this.top_<50){
                    this.top_ =50;
                }
                var element = this.createEl_();
                
                ol.control.Control.call(this, {
			element: element,
			target: options.target
		});
                
                this.panNorthEl_ = this.createButtonEl_('pan-north');
                this.panEastEl_ = this.createButtonEl_('pan-east');
                this.panSouthEl_ = this.createButtonEl_('pan-south');
                this.panWestEl_ = this.createButtonEl_('pan-west');
                
                this.zoomInEl_ = this.createButtonEl_('zoom-in');
                this.zoomOutEl_ = this.createButtonEl_('zoom-out');
                
                this.zoomMaxEl_ = this.createButtonEl_('zoom-max')
                
                this.slider_ = options.slider !== undefined ? options.slider : false;
                
                this.duration_ = options.duration !== undefined ? options.duration : 100;
                
                this.zoomSliderCtrl_ = (this.slider_) ? new ol.control.ZoomSlider() : null;
                
                element.appendChild(this.panNorthEl_);
                element.appendChild(this.panEastEl_);
                element.appendChild(this.panSouthEl_);
                element.appendChild(this.panWestEl_);
                
                element.appendChild(this.zoomInEl_);
                element.appendChild(this.zoomOutEl_);
                
                element.appendChild(this.zoomMaxEl_);
                
                this.element_ = element;
	  };

	ol.inherits(ol.control.panZoomBar, ol.control.Control);
         
          
          
        ol.control.panZoomBar.prototype.createEl_ = function() {
            var path = this.imgPath_;
            var className = this.className_;
            var cssClasses = [
                className,
                'ol-unselectable'
            ];
            
            if (!path) {
                cssClasses.push('ol-control');
            }

            var element = document.createElement('div');
            element.className = className;

            if (path) {
                element.style.left = this.left_+'px';
                element.style.position = 'absolute';
                element.style.top = this.top_+'px';
            }

            return element;  
        };  
          
    
    
    ol.control.panZoomBar.prototype.createButtonEl_ = function(action) {
        var divEl = document.createElement('div');
        var path = this.imgPath_;
        var maxExtent = this.maxExtent_;
        var slider = this.slider_;
 
        if (path) {
            divEl.style.width = '18px';
            divEl.style.height = '18px';
            divEl.style.position = 'absolute';
            divEl.style.cursor = 'pointer';

            var imgEl = document.createElement('img');
            imgEl.style.width = '18px';
            imgEl.style.height = '18px';
            imgEl.style['vertical-align'] = 'top';

            switch (action) {
               case 'pan-north':
                imgEl.id = 'north';
                imgEl.src = '/viewer/resources/images/openlayers_img/north-mini.png';
                divEl.id = 'north';
                divEl.style.top = '4px';
                divEl.style.left = '18px';
                break; 
               case 'pan-east':
                imgEl.id = 'east';
                imgEl.src = '/viewer/resources/images/openlayers_img/east-mini.png';
                divEl.id = 'east';
                divEl.style.top = '22px';
                divEl.style.left = '36px';
                break;
               case'pan-south':
                imgEl.id = 'south';
                imgEl.src = '/viewer/resources/images/openlayers_img/south-mini.png';
                divEl.id = 'south';
                divEl.style.top = '40px';
                divEl.style.left = '18px';
                break;
               case'pan-west':
                imgEl.id = 'west';
                imgEl.src = '/viewer/resources/images/openlayers_img/west-mini.png';
                divEl.id = 'west';
                divEl.style.top = '22px';
                divEl.style.left = '0px';
                break;
               case 'zoom-in':
                imgEl.id = 'zoomIn';
                imgEl.src = '/viewer/resources/images/openlayers_img/zoom-plus-mini.png';
                divEl.id = 'zoomIn';
                divEl.style.top = '58px';
                divEl.style.left = '18px';
                break;
              case 'zoom-out':
                imgEl.id = 'zoomOut';
                imgEl.src = '/viewer/resources/images/openlayers_img/zoom-minus-mini.png';
                divEl.id = 'zoomOut';
                divEl.style.top = '276px';
                divEl.style.left = '18px';
                break;
                case 'zoom-max':
                imgEl.id = 'zoomMax';
                imgEl.src = '/viewer/resources/images/openlayers_img/zoom-world-mini.png';
                divEl.id = 'zoomMax';
                divEl.style.top = '22px';
                divEl.style.left = '18px';
                break;
            }
            divEl.appendChild(imgEl);
        }
        
        return divEl;
    };
    
    ol.control.panZoomBar.prototype.adjustZoomSlider_ = function() {
        var zoomSlider = this.zoomSliderCtrl_;
        var path = this.imgPath_;

        if (!zoomSlider || !path) {
            return;
        }
        
        var height = [this.getSliderSize_(), 'px'].join('');

        
        var zoomSliderEl = zoomSlider.element;
        zoomSliderEl.style.background = "url('/viewer/resources/images/openlayers_img/zoombar.png')";
        zoomSliderEl.style.border = '0';
        zoomSliderEl.style['border-radius'] = '0';
        zoomSliderEl.style.height = height;
        zoomSliderEl.style.left = '18px';
        zoomSliderEl.style.padding = '0';
        zoomSliderEl.style.top = '76px';
        zoomSliderEl.style.width = '18px';
        
        var sliderEl = zoomSliderEl.children[0];
        sliderEl.style.background = "url('/viewer/resources/images/openlayers_img/slider.png')";
        sliderEl.style.height = '9px';
        sliderEl.style.margin = '0 -1px';
        sliderEl.style.width = '20px';
        sliderEl.style.position = 'absolute';
        
        
    };
    
    ol.control.panZoomBar.prototype.setMap = function(map) {
        
        var zoomSlider = this.zoomSliderCtrl_;
        
        if (this.zoomSliderCtrl_) {
            this.zoomSliderCtrl_.setTarget(null);
            window.setTimeout(function() {
                map.removeControl(zoomSlider);
            }, 0);
        }
        
        ol.control.Control.prototype.setMap.call(this, map);
        
        if (this.slider_) {
            zoomSlider.setTarget(this.element_);
            window.setTimeout(function() {
                map.addControl(zoomSlider);
            }, 0);
            this.adjustZoomSlider_();
        }
        var me = this;
        
        this.element_.addEventListener('click',function(e){me.pan(e.target.id,e);},false);
    };
    
    ol.control.panZoomBar.prototype.pan = function(direction, evt){
        var map = this.getMap();
        var view = map.getView();
        var mapUnitsDelta = view.getResolution() * this.pixelDelta_;
        var deltaX = 0, deltaY = 0;
        if (direction == 'south') {
            deltaY = -mapUnitsDelta;
        }else if (direction == 'west') {
            deltaX = -mapUnitsDelta;
        }else if (direction == 'east') {
            deltaX = mapUnitsDelta;
        }else if(direction == 'north') {
            deltaY = mapUnitsDelta;
        }else if(direction == 'zoomMax'){
            var extent = map.getView().getProjection().getExtent();
            map.getView().fit(extent,map.getSize());
            return;
        }else if(direction == 'zoomIn'){
            map.getView().setZoom(view.getZoom()+1);
            return;
        }else if(direction == 'zoomOut'){
            view.setZoom(view.getZoom()-1);
            return;
        }
        var delta = [deltaX, deltaY];
        ol.coordinate.rotate(delta, view.getRotation());
      
        var currentCenter = view.getCenter();
        if (currentCenter) {
            var center = view.constrainCenter(
            [currentCenter[0] + delta[0], currentCenter[1] + delta[1]]);
            if (this.duration_) {
                view.animate({
                duration: this.duration_,
                easing: ol.easing.linear,
                center: center
            });
            } else {
                view.setCenter(center);
            }
        }  
    };
    
    ol.control.panZoomBar.prototype.getSliderSize_ = function() {
        return (this.maxZoom_ - this.minZoom_ + 1) * 11;
    };
}));