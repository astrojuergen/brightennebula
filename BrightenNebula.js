//////////////////////////////////////
// Brighten Nebula
//
// A script to brighten nebulas
//
// Jürgen Ehnes 2021
//////////////////////////////////////

#feature-id Utilities > BrightenNebula
#feature-info An image blending utility.
#feature-icon Blend.xpm

#include <pjsr/Color.jsh>
#include <pjsr/Sizer.jsh>
#include <pjsr/FrameStyle.jsh>
#include <pjsr/TextAlign.jsh>
#include <pjsr/StdButton.jsh>
#include <pjsr/StdIcon.jsh>
#include <pjsr/StdCursor.jsh>
#include <pjsr/UndoFlag.jsh>
#include <pjsr/NumericControl.jsh>
#include <pjsr/StdDialogCode.jsh>

#define VERSION "0.0.1"
#define TITLE "BrightenNebula"

#define DEBUG true

function BrightenNebulaDialog() {
// Add all properties and methods of the core Dialog object to this object.
this.__base__ = Dialog;
this.__base__();

var dlg = this;

//var labelWidth1 = this.font.width( "Overlay Mode:" + 'T' );
var running = false;
this.prvImgW = null;
var sliderMaxValue = 360;
var sliderMinWidth = 256;

// ------------------------------------------------------------------------
// Top help panel
// ------------------------------------------------------------------------

this.helpLabel = new Label( this );
with ( this.helpLabel )
{
frameStyle = FrameStyle_Box;
margin = 4;
readOnly = true;
wordWrapping = true;
useRichText = true;

text = "<p><b>" + TITLE + " v" + VERSION + "</b> &mdash; " +
"Brighten Nebula Utility.</p>" +
"<p>Brightens a nebula in an image by negative multiplication." +
"<p>Author: Juergen Ehnes </p>" +
"<p></p>";
}

this.imageS


this.windowTitle = TITLE + " Script";
}

BrightenNebulaDialog.prototype = new Dialog;

function main() {
Console.writeln(TITLE + " started")
if (!DEBUG)
Console.hide();
var dialog = new BrightenNebulaDialog();
var retVal = dialog.execute();

Console.writeln(TITLE + " ended")

}

main();
