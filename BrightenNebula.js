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

function BrightenNebula(view) {

   var starnet = new StarNet();
   starnet.mask = false;

   var view2 = new copyView(view, view.id + "_copy");


   result = starnet.executeOn(view2);


}

function copyView( view, newName)
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
   if (P.executeOn(view))
      return View.viewById(newName);
   {
      message("CopyView failed", "Error");
      return null;
   }
}
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

   this.targetImage_Sizer = new HorizontalSizer;
   this.targetImage_Sizer.spacing = 4;

   this.targetImage_Label = new Label(this);
   this.targetImage_Label.text = "Target image: ";
   this.targetImage_Label.textAlignment = TextAlign_Right|TextAlign_VertCenter;

   this.targetImage_ViewList = new ViewList(this);
   this.targetImage_ViewList.minWidth = 360;
   this.targetImage_ViewList.getAll(); // include main views as well as previews
   this.targetImage_ViewList.currentView = data.targetView;
   this.targetImage_ViewList.toolTip = this.targetImage_Label.toolTip = "Select the image that will be used to generate the mask.";

   this.targetImage_ViewList.onViewSelected = function(view) {
      data.targetView = view;
   };

   this.targetImage_Sizer.add(this.targetImage_Label);
   this.targetImage_Sizer.add(this.targetImage_ViewList, 100);

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
   this.sizer.add(this.buttons_Sizer);

   this.windowTitle = TITLE + " Script";
   this.adjustToContents();
   this.setFixedSize();

}

BrightenNebulaDialog.prototype = new Dialog;

function main() {
   Console.writeln(TITLE + " started")
   if (!DEBUG) {
      Console.hide();
   }

    if (!data.targetView) {
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
      if (data.targetView.isNull) {
         (new MessageBox("You must select a view to apply this script.",
               TITLE, StdIcon_Error, StdButton_Ok)).execute();
         continue;
      }

      // Must be a color image?
      if (data.targetView.image.numberOfChannels != 3) {
         (new MessageBox("You must supply an RGB color image.",
               TITLE, StdIcon_Error, StdButton_Ok)).execute();
         continue;
      }

      console.abortEnabled = true;
      console.show();

      var start = new Date;

      data.targetView.beginProcess(UndoFlag_NoSwapFile);
      BrightenNebula(data.targetView);
      data.targetView.endProcess();

      var timeNeeded = ((new Date).getTime() - start.getTime() / 1000);

      console.writeln(format("<end><cbr>BrightenNebula: %.2f s", timeNeeded));
      break;
   }
   Console.writeln(TITLE + " ended")

}

main();
