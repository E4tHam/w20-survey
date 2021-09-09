
/* slider.js */


hasSlider                   = true;
const SliderMin             = 1.2;
const SliderMax             = 2.4;
const SLiderStart           = SliderMin;
const Slider                = document.getElementById("Slider");
const SliderCost            = document.getElementById("SliderCost");

Slider.min                  = SliderMin;
Slider.max                  = SliderMax;
Slider.value                = SLiderStart;

SliderCost.innerHTML        = ( b * SLiderStart - a ).toFixed(2);


Actions[ "SliderRecord" ]   = new Object();

let SLIDER_recent           = NaN;

function handle_Slider() {

    let SLIDER_current = parseFloat( Slider.value );
    SliderCost.innerHTML = ( b * SLIDER_current - a ).toFixed(2);


    if ( SLIDER_current == SLIDER_recent )
        return;

    SLIDER_recent = SLIDER_current;

    Actions[ "SliderRecord" ][ frame ] = SLIDER_current;

    if ( DATA_SET == "independent" ) {
        slider_scalar = SLIDER_current;
    }
    else if ( DATA_SET == "correlated" ) {
        slider_speed = SLIDER_current;
    }
}
