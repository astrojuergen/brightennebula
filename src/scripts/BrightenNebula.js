//////////////////////////////////////
// Brighten Nebula
//
// A script to brighten nebulas
//
// Jürgen Ehnes, Frank Sackenheim 2021
//////////////////////////////////////

#feature-id Utilities > BrightenNebula
#feature-info A tool to brighten up nebulas
#feature-icon brightenNebula.xpm

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

#define VERSION "0.1.1"
#define TITLE "BrightenNebula"

#define DEBUG false

var closeStarlessImage = true;
var strideNumber = 0;
var strides = new Array();
var targetView = ImageWindow.activeWindow.currentView;

// BrightenNebula
//
// @param view The view to change
function BrightenNebula(view) {


   // To get an really individual name, using an uuid here
   var newImageName = view.id + "_" + uuidv4();

   var view2 = new copyView(view, newImageName);

   var starnet = new StarNet();
   starnet.mask = false;
   console.writeln("StrideNumber = "+ strideNumber);
   starnet.stride = strideNumber;

   var starnetresult = false;

   try {
      starnetresult = starnet.executeOn(view2);
   } catch(err) {

      var mb = new MessageBox("starnet execution failed. Starnet configured properly? Error: " + err.message);
      mb.execute();
      starnetresult = false;
   }

   if (starnetresult) {
      merge(view2, view, "", newImageName + "_px");
   }

   if (closeStarlessImage) {
      view2.window.forceClose();
   }

}

// copyView
//
// Creates a new view with imagedata of the source
//
// @param sourceView the view to copy
// @param newName the name of the new view
// @return the new view
function copyView( sourceView, newName)
{
   var P = new PixelMath;
   P.expression = "$T";
   P.expression1 = "";
   P.expression2 = "";
   P.expression3 = "";
   P.useSingleExpression = true;
   P.symbols = "";
   P.generateOutput = true;
   P.singleThreaded = false;
   P.use64BitWorkingImage = false;
   P.rescale = false;
   P.rescaleLower = 0;
   P.rescaleUpper = 1;
   P.truncate = true;
   P.truncateLower = 0;
   P.truncateUpper = 1;
   P.createNewImage = true;
   P.showNewImage = true;
   P.newImageId = newName;
   P.newImageWidth = 0;
   P.newImageHeight = 0;
   P.newImageAlpha = false;
   P.newImageColorSpace = PixelMath.prototype.SameAsTarget;
   P.newImageSampleFormat = PixelMath.prototype.SameAsTarget;
   if (P.executeOn(sourceView))
      return View.viewById(newName);
   {
      message("CopyView failed", "Error");
      return null;
   }
}

function merge(sourceView, destinationView, mergeFunction, newName) {
 var P = new PixelMath;
   P.expression = "IMG1=" +sourceView.id + ";IMG2=" + destinationView.id + ";~(~IMG1 * ~IMG2)";
   P.expression1 = "";
   P.expression2 = "";
   P.expression3 = "";
   P.useSingleExpression = true;
   P.symbols = "IMG1, IMG2";
   P.generateOutput = true;
   P.singleThreaded = false;
   P.use64BitWorkingImage = false;
   P.rescale = false;
   P.rescaleLower = 0;
   P.rescaleUpper = 1;
   P.truncate = true;
   P.truncateLower = 0;
   P.truncateUpper = 1;
   P.createNewImage = true;
   P.showNewImage = true;
   P.newImageId = newName;
   P.newImageWidth = 0;
   P.newImageHeight = 0;
   P.newImageAlpha = false;
   P.newImageColorSpace = PixelMath.prototype.SameAsTarget;
   P.newImageSampleFormat = PixelMath.prototype.SameAsTarget;
   if (P.executeOn(sourceView))
      return View.viewById(newName);
   {
      message("CopyView failed", "Error");
      return null;
   }
}
// uuidv4
// Creates uuid with _ instead if -
//
// @return a new uuid value
function uuidv4() {
  return 'xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// BrightenNebulaDialog
// Creates a dialog window
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
      wordWrapping = true;
      useRichText = true;

      text = "<p><b>" + TITLE + " v" + VERSION + "</b> &mdash; " +
      "Brighten Nebula Utility.</p>" +
      "<p>Brightens a nebula in an image by star removal and negative multiplication." +
      "<p>Author: Juergen Ehnes, Frank Sackenheim 2021 </p>" +
      "<p></p>";
    }

   this.targetImage_Sizer = new HorizontalSizer;
   this.targetImage_Sizer.spacing = 4;

   this.targetImage_Label = new Label(this);
   this.targetImage_Label.text = "Target image: ";
   this.targetImage_Label.textAlignment = TextAlign_Right|TextAlign_VertCenter;

   this.targetImage_ViewList = new ViewList(this);
   this.targetImage_ViewList.minWidth = 360;
   this.targetImage_ViewList.getAll(); // include main views as well as previews
   this.targetImage_ViewList.currentView = targetView;
   this.targetImage_ViewList.toolTip = this.targetImage_Label.toolTip = "Select the image that will be used to generate the mask.";

   this.targetImage_ViewList.onViewSelected = function(view) {
      targetView = view;
   };

   this.targetImage_Sizer.add(this.targetImage_Label);
   this.targetImage_Sizer.add(this.targetImage_ViewList, 100);

   this.cbCloseStarlessImage = new CheckBox(this)
   with (this.cbCloseStarlessImage) {
      checked = true;
      text = "Close starless image";

      onCheck = function (checked) {
            update();
            closeStarlessImage = !closeStarlessImage;
            console.writeln("closeStarlessImage = " + closeStarlessImage);
      }
   }

   var starnet = new StarNet;
   strides["128"] = starnet.Stride_128;
   strides["64"] = starnet.Stride_64;
   strides["32"] = starnet.Stride_32;
   strides["16"] = starnet.Stride_16;
   strides["8"] = starnet.Stride_8;

   this.stridesCombo = new ComboBox(this);
   with (this.stridesCombo) {
      for (var key in strides) {
         addItem(key);
      }
      currentItem = 4;
      onItemSelected = function(index) {
         strideNumber = strides[itemText(index)];
         console.writeln("StrideNumber = " + strideNumber);
      }
   }


   this.buttons_Sizer = new HorizontalSizer;
   this.buttons_Sizer.spacing = 6;

   this.newInstance_Button = new ToolButton(this);
   this.newInstance_Button.icon = new Bitmap( ":/process-interface/new-instance.png" );
   this.newInstance_Button.toolTip = "New Instance";
   this.newInstance_Button.onMousePress = function()
   {
      this.hasFocus = true;
      exportParameters();
      this.pushed = false;
      this.dialog.newInstance();
   };

   this.ok_Button = new PushButton(this);
   this.ok_Button.text = " OK ";
#ifneq __PI_PLATFORM__ MACOSX
    this.ok_Button.icon = new Bitmap( ":/icons/ok.png" );
#endif

   this.ok_Button.onClick = function() {
      this.dialog.ok();
   };

   this.cancel_Button = new PushButton(this);
   this.cancel_Button.text = " Cancel ";
#ifneq __PI_PLATFORM__ MACOSX
    this.cancel_Button.icon = new Bitmap( ":/icons/cancel.png" );
#endif

   this.cancel_Button.onClick = function() {
      this.dialog.cancel();
   };

   /* this.buttons_Sizer.add(this.newInstance_Button); */
   this.buttons_Sizer.add(this.newInstance_Button);
   this.buttons_Sizer.addStretch();
   this.buttons_Sizer.add(this.ok_Button);
   this.buttons_Sizer.add(this.cancel_Button);

   this.sizer = new VerticalSizer;
   this.sizer.margin = 6;
   this.sizer.spacing = 6;
   this.sizer.add(this.helpLabel);
   this.sizer.addSpacing(4);
   this.sizer.add(this.targetImage_Sizer);
   this.sizer.add(this.cbCloseStarlessImage);
   this.sizer.add(this.stridesCombo);
   this.sizer.add(this.buttons_Sizer);

   this.windowTitle = TITLE + " Script";
   this.adjustToContents();
   this.setFixedSize();

}

BrightenNebulaDialog.prototype = new Dialog;

function main() {
   console.writeln(TITLE + " started")
   if (!DEBUG) {
      console.hide();
   }

    if (!targetView) {
      (new MessageBox("There is no active image window!",
         TITLE, StdIcon_Error, StdButton_Ok)).execute();
      return;
   }

   var dialog = new BrightenNebulaDialog();

   for (;;) {
      if (!dialog.execute()) {
         break;
      }

      // A view must be selected.
      if (targetView.isNull) {
         (new MessageBox("You must select a view to apply this script.",
               TITLE, StdIcon_Error, StdButton_Ok)).execute();
         continue;
      }

      // Must be a color image?
      if (targetView.image.numberOfChannels != 3) {
         (new MessageBox("You must supply an RGB color image.",
               TITLE, StdIcon_Error, StdButton_Ok)).execute();
         continue;
      }

      console.abortEnabled = true;
      console.show();

      var startTime = new Date;

      targetView.beginProcess(UndoFlag_NoSwapFile);
      BrightenNebula(targetView);
      targetView.endProcess();

      var endTime = new Date

      var timeNeeded = (endTime.getTime() - startTime.getTime()) / 1000;

      console.writeln(format("<end><cbr>BrightenNebula: %.2f s", timeNeeded));
      break;
   }
   Console.writeln(TITLE + " ended")

}

main();
