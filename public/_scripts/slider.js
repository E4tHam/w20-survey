
/* slider.js */


hasSlider                   = true;
const Slider                = document.getElementById("Slider");

Actions[ "SliderRecord" ]   = new Object();

let SLIDER_recent           = NaN;

function handle_Slider() {

    let SLIDER_current = parseFloat( Slider.value );

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
