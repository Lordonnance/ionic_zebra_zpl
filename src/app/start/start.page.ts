import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../services/global.service';

import { Firestore, collection, collectionSnapshots } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { AlertController } from '@ionic/angular';
import { BootService } from '../services/boot.service';

import { CapacitorZebraPrinter } from "capacitor-zebra-printer";

const printUtils = {
  printZpl: async ({
    zpl,
    ip,
    port,
  }: {
    zpl: string;
    ip: string;
    port: number;
  }) => {
    return await CapacitorZebraPrinter.print({
      ip,
      port,
      zpl,
    }).then((res) => {
      return res && res.value == "success";
    });
  },
};

export default printUtils;

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
})

export class StartPage {
  constructor(
    private router: Router,
    private globalService: GlobalService,
    private bootService: BootService,
    private firestore: Firestore,
    private alertController: AlertController
  ) {
    console.log ("--- StartPage constructor ---")
  }

  // User clicked on "register" button => go to register page
  printZPL() {
    console.info ("--- printZPL ---")

    // 192.168.8.129
    CapacitorZebraPrinter.print({
      ip: "172.20.10.14",
      port: 9100,
      zpl: "~CT~~CD,~CC^~CT~" +
      "^XA" +
      "~TA0" +
      "~JSO" +
      "^LT0" +
      "^MNW" +
      "^MTD" +
      "^PON" +
      "^PMN" +
      "^LH0,0" +
      "^JMA" +
      "^PR4,4" +
      "~SD15" +
      "^JUS" +
      "^LRN" +
      "^CI27" +
      "^PA0,1,1,0" +
      "^XZ" +
      "^XA" +
      "^MMC" +
      "^PW807" +
      "^LL815" +
      "^LS0" +
      "^FT96,305^A0N,45,46^FH\^CI28^FDMathieu Naon^FS^CI27" +
      "^FT522,290^BQN,2,5" +
      "^FH\^CI28^FDLA,ONE:VISITEUR:Mq91T;8Bjn2:€€Qu=5XiEt]<jz\\7EevMWYxv€€€€€€€€€€QMGLIPMR$WE€QMGLIPMR$WE€€€qexlmiyDsri1iziriqirx2gsqZti1;;^FS^CI27" +
      "^FPH,6^FT96,330^ACN,18,10^FH\^CI28^FDEntrée plein tarif^FS^CI27" +
      "^FPH,6^FT96,348^ACN,18,10^FH\^CI28^FD18 € TTC (dont TVA : 2,48 €)^FS^CI27" +
      "^FPH,6^FT96,366^ACN,18,10^FH\^CI28^FDAchetée le 15/06/2023 à 14h58^FS^CI27" +
      "^FPH,6^FT96,384^ACN,18,10^FH\^CI28^FDCommande n° BRE560POO^FS^CI27" +
      "^FPH,6^FT96,402^ACN,18,10^FH\^CI28^FDBillet n° 0015214^FS^CI27" +
      "^FO64,49^GB679,432,4^FS" +
      "^FO96,95^GB312,111,4,,4^FS" +
      "^FT134,170^A0N,56,56^FH\^CI28^FDLOGO IMS^FS^CI27" +
      "^FPH,1^FT96,453^ACN,18,10^FH\^CI28^FDToute sortie entraîne  l'invalidité du billet^FS^CI27" +
      "^PQ1,1,1,Y" +
      "^XZ"
    })
  }
}

/**
 * ^CT ~CT => The ^CT and ~CT commands are used to change the control command prefix. The default prefix is the tilde
              (~).
 * ^CD ~CD => The ^CD and ~CD commands are used to change the delimiter character. This character is used to
              separate parameter values associated with several ZPL II commands. The default delimiter is a comma (,).
 * ^CC ~CC => The ^CC command is used to change the format command prefix. The default prefix is the caret (^)

 * ~TAx => The ~TA command lets you adjust the rest position of the media after a label is printed, which changes the
          position at which the label is torn or cut.
          x from -120 to +120
 * ~JS => The ~JS command is used to control the backfeed sequence. This command can be used on printers with
          or without built-in cutters
          A — 100 percent backfeed after printing and cutting
          B — 0 percent backfeed after printing and cutting, and 100 percent before
                printing the next label
          N —normal — 90 percent backfeed after label is printed
          O —off — turn backfeed off completely
 * ^LTx => The ^LT command moves the entire label format a maximum of 120 dot rows up or down from its current
          position, in relation to the top edge of the label. A negative value moves the format towards the top of the
          label; a positive value moves the format away from the top of the label.
          x from -120 to +120
 * ^MN => This command specifies the media type being used and the black mark offset in dots.

          Media Tracking
          This bulleted list shows the types of media associated with this command:
          • Continuous Media – this media has no physical characteristic (such as a web, notch, perforation, black
            mark) to separate labels. Label length is determined by the ^LL command.
          • Continuous Media, variable length – same as Continuous Media, but if portions of the printed label fall
            outside of the defined label length, the label size will automatically be extended to contain them. This
            label length extension applies only to the current label. Note that ^MNV still requires the use of the ^LL
            command to define the initial desired label length.
          • Non-continuous Media – this media has some type of physical characteristic (such as web, notch,
          perforation, black mark) to separate the labels.
          
          N = continuous media
          V = continuous media, variable length (Kiosk)
          Y = non-continuous media web sensing
          W = non-continuous media web sensing
          M,x = non-continuous media mark sensing
                x in dots from -80 to 283 for direct-thermal only printers

 * ^MT => The ^MT command selects the type of media being used in the printer.
          T = thermal transfer media
          D = direct thermal media
 * ^PO => The ^PO command inverts the label format 180 degrees.
 * ^PM => The ^PM command prints the entire printable area of the label as a mirror image. This command flips the
          image from left to right.
 * ^LHx,y =>  The ^LH command sets the label home position.
              Label Home
              The default home position of a label is the upper-left corner (position 0,0 along the x and y axis). This is the
              axis reference point for labels. Any area below and to the right of this point is available for printing. The
              ^LH command changes this reference point. For instance, when working with preprinted labels, use this
              command to move the reference point below the preprinted area.
              This command affects only fields that come after it. It is recommended to use ^LH as one of the first
              commands in the label format.
              Format: ^LHx,y (in dots, 8dots = 1mm for 203 dots / inch (203 dpi))
 * ^JMx =>  The ^JM command lowers the density of the print—24 dots/mm becomes 12, 12 dots/mm becomes 6, 8
            dots/mm becomes 4, and 6 dots/mm becomes 3. ^JM also affects the field origin (^FO) placement on the
            label (see example below).
            A = 24 dots/mm, 12 dots/mm, 8 dots/mm or 6 dots/mm
            B = 12 dots/mm, 6 dots/mm, 4 dots/mm or 3 dots/mm
 * ^PRx,y =>  The ^PR command determines the media and slew speed (feeding a blank label) during printing.
              C or 4  =  101.6 mm/sec. (4 inches/sec.)
 * ~SDx =>  The ~SD command allows you to set the darkness of printing
            From 0 to 30
 * ^JUx =>  The ^JU command sets the active configuration for the printer.
            F = reload factory settings
            N = reload factory network settings
            These values are lost at power-off if not saved with ^JUS.
            R = recall last saved settings
            S = save current settings
            These values are used at power-on.
 * ^LR => The ^LR command reverses the printing of all fields in the label format. It allows a field to appear as white
          over black or black over white. N = no
 * ^CIx =>  The ^CI command enables you to call up the international character set you want to use for printing. You
            can mix character sets on a label.
            • 27 = Zebra Code Page 1252 (see Zebra Code Page 1252— Latin Character Set on page 1511)
            • 28 = Unicode (UTF-8 encoding) - Unicode Character Set
            • 29 = Unicode (UTF-16 Big-Endian encoding) - Unicode Character Set
            • 30 = Unicode (UTF-16 Little-Endian encoding) - Unicode Character Set
 * ^PA a,b,c,d => The ^PA command is used to configure advanced text layout features.
                  a.  This determines whether the default glyph is a space character or the default
                      glyph of the base font, which is typically a hollow box
                      0 = off (space as default glyph)
                  b.  This determines whether the bidirectional text layout is turned on or off
                      1 = ON
                  c.  This determines whether character shaping is turned on or off.
                      1 = ON
                  d.  This determines whether the OpenType support is turned on or off
                      0 = OFF
 * ^MMx =>  The ^MM command determines the action the printer takes after a label or group of labels has printed.
            T = Tear-off
            P = Peel-off (not available on S-300)a
            R = Rewind (depends on printer model)
            A = Applicator (depends on printer model) a
            C = Cutter (depends on printer model)
            D = Delayed cutter a
            F = RFID a
 * ^PW => The ^PW command allows you to set the print width (in dots)
 * ^LLy.x => The ^LL command defines the length of the label. This command is necessary when using continuous
          media (media not divided into separate labels by gaps, spaces, notches, slots, or holes). This command is
          not persistent across a power cycle unless a ^JUS is received.
          y => Defines the label length in dots
          x => Specifies whether the label length applies to all media, including Gap and Mark.
              • N means that the ^LL length applies only to continuous media.
              • Y means that the ^LL length applies to all media, including Gap and Mark.
              Default: N. If no value is present, the current setting is left unchanged.
 * ^LS => The ^LS command allows for compatibility with Z-130 printer formats that are set for less than full label
          width. It is used to shift all field positions to the left so the same commands used on a Z-130 or Z-220
          Printer can be used on other Zebra printers.
 * ^FTx,y,z =>  The ^FT command sets the field position, relative to the home position of the label designated by the ^LH
                command. The typesetting origin of the field is fixed with respect to the contents of the field and does not
                change with rotation.
                x = x-axis location (in dots)
                y = y-axis location (in dots)
                z = justification
                  0 = left justification
                  1 = right justification
                  2 = auto justification (script dependent)
                  Default: last accepted ^FW value or ^FW default
                  f = font name Values: A through Z, and 0 to 9
 * ^Afo,h,w =>  The ^A command specifies the font to use in a text field. ^A designates the font for the current ^FD
                statement or field. The font specified by ^A is used only once for that ^FD entry. If a value for ^A is not
                specified again, the default ^CF font is used for the next ^FD entry.
                  f = Any font in the printer (downloaded, EPROM, stored fonts, fonts A through Z and 0 to 9).
                  o = field orientation Values:
                    N = normal
                    R = rotated 90 degrees (clockwise)
                    I = inverted 180 degrees
                    B = read from bottom up, 270 degrees
                    Default: the last accepted ^FW value or the ^FW default
                  h = Character Height (in dots) Scalable Values: 10 to 32000
                  w = width (in dots) Scalable Values: 10 to 32000
 * ^FH => The ^FH command allows you to enter the hexadecimal value for any character directly into the ^FD
          statement. The ^FH command must precede each ^FD command that uses hexadecimals in its field.
            Values: any character except current format and control prefix (^ and ~ by default)
            Default: _ (underscore)
 * ^FD => The ^FD command defines the data string for a field. The field data can be any printable character except
          those used as command prefixes (^ and ~).
 * ^FS => The ^FS command denotes the end of the field definition. Alternatively, ^FS command can also be issued
          as a single ASCII control code SI (Control-O, hexadecimal 0F).
          Field Separator
          NOTE: It is recommended to place an ^FS after every command that creates a printable line.
 * ^BQa, b, c =>  The ^BQ command produces a matrix symbology consisting of an array of nominally square modules
                  arranged in an overall square pattern. A unique pattern at three of the symbol’s four corners assists in
                  determining bar code size, position, and inclination.
                    a = field orientation Values: normal (^FW has no effect on rotation)
                    b = model Values: 1 (original) and 2 (enhanced – recommended)
                    c = magnification factor Values (1 to 10)
                      Default:
                      1 on 150 dpi printers
                      2 on 200 dpi printers
                      3 on 300 dpi printers
 * ^PQq, p, r, o => The ^PQ command gives control over several printing operations. It controls the number of labels to print,
                    the number of labels printed before printer pauses, and the number of replications of each serial number.
                    q = total quantity of labels to print (1 to 99,999,999)
                    Default: 1
                    p = pause and cut value (labels between pauses) (1 to 99,999,999)
                    Default: 0 (no pause)
                    r = replicates of each serial number (0 to 99,999,999 replicates)
                    Default: : 0 (no replicates)
                    o = override pause count Values:
                      N = no
                      Y = yes
 */
