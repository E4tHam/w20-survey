
/* slider.js */


hasSlider                   = true;
const BreadthSliderMin =
      (DATA_SET=="independent") ? 3
    : (DATA_SET=="correlated")  ? 1
    : NaN;
const BreadthSliderMax =
      (DATA_SET=="independent") ? 8
    : (DATA_SET=="correlated")  ? 5
    : NaN;
const BreadthSliderStart    = BreadthSliderMin;
const SliderStep            = 0.001;
const SliderDiv             = document.getElementById("SliderDiv");
const BreadthSlider         = document.getElementById("BreadthSlider");
const CostSlider            = document.getElementById("CostSlider");
const SliderCost            = document.getElementById("SliderCost");
const SliderBreadth         = document.getElementById("SliderBreadth");
const SliderTimeUnit        = document.getElementById("SliderTimeUnit");


SliderDiv.setAttribute("style","");
SliderTimeUnit.innerHTML
    = (DATA_SET=="independent") ? "draw"
    : (DATA_SET=="correlated")  ? "second"
    : "";

BreadthSlider.min           = BreadthSliderMin;
BreadthSlider.max           = BreadthSliderMax;
BreadthSlider.value         = BreadthSliderStart;
BreadthSlider.step          = SliderStep;

CostSlider.min              = costOf(BreadthSliderMin);
CostSlider.max              = costOf(BreadthSliderMax);
CostSlider.value            = clamp(costOf(BreadthSliderMin), costOf(BreadthSliderStart), costOf(BreadthSliderMax));
CostSlider.step             = SliderStep;

var BreadthSlider_current = parseFloat( BreadthSlider.value );
var CostSlider_current = parseFloat( CostSlider.value );

SliderBreadth.innerHTML     = BreadthSliderStart.toFixed(2);
SliderCost.innerHTML        = costOf(BreadthSliderStart).toFixed(2);


Actions[ "BreadthSliderRecord" ]    = new Object();
Actions[ "CostSliderRecord" ]       = new Object();

let SLIDER_recent           = NaN;

function enable_Sliders() {
    BreadthSlider.disabled = false;
    BreadthSlider.style.opacity = 1;
    CostSlider.disabled = false;
    CostSlider.style.opacity = 1;
}
function disable_Sliders() {
    BreadthSlider.disabled = false;
    BreadthSlider.style.opacity = 0.5;
    CostSlider.disabled = false;
    CostSlider.style.opacity = 0.5;
}

function handle_BreadthSlider() {
    BreadthSlider_current = parseFloat( BreadthSlider.value );
    let new_cost = costOf( BreadthSlider_current );
    new_cost = clamp( parseFloat(CostSlider.min), new_cost, parseFloat(CostSlider.max) );
    CostSlider_current = new_cost;
    CostSlider.value = CostSlider_current;
    handle_Sliders();
}

function handle_CostSlider() {
    CostSlider_current = parseFloat( CostSlider.value );
    let new_breadth = breadthOf( CostSlider_current );
    new_breadth = clamp( parseFloat(BreadthSlider.min), new_breadth, parseFloat(BreadthSlider.max) );
    BreadthSlider_current = new_breadth;
    BreadthSlider.value = BreadthSlider_current;
    handle_Sliders();
}

let BreadthSlider_recent = NaN;

function handle_Sliders() {

    if ( BreadthSlider_current == BreadthSlider_recent || isNaN(frame) )
        return;

    SliderBreadth.innerHTML = BreadthSlider_current.toFixed(2);
    SliderCost.innerHTML = CostSlider_current.toFixed(2);


    BreadthSlider_recent = BreadthSlider_current;

    console.log(`frame: ${frame}, BreadthSlider_current: ${BreadthSlider_current}, CostSlider_current: ${CostSlider_current}`);
    Actions[ "BreadthSliderRecord" ][ frame ] = BreadthSlider_current;
    Actions[ "CostSliderRecord" ][ frame ] = CostSlider_current;

    if ( DATA_SET == "independent" ) {
        slider_scalar = BreadthSlider_current;
    }
    else if ( DATA_SET == "correlated" ) {
        slider_speed = BreadthSlider_current;
    }
}
