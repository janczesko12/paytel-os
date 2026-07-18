#include "display.h"

void drawBoot() {
  u8g2.clearBuffer();

  u8g2.setFont(u8g2_font_logisoso18_tf);
  u8g2.drawStr(0, 20, "PAYTEL");

  u8g2.drawHLine(0, 26, 128);

  u8g2.setFont(u8g2_font_6x12_tf);
  u8g2.drawStr(24, 40, "Ladowanie...");

  u8g2.drawFrame(14, 48, 100, 10);

  u8g2.sendBuffer();
}

void drawMenu(byte selected) {
  u8g2.clearBuffer();

  u8g2.setFont(u8g2_font_6x12_tf);
  u8g2.drawStr(0,10,"PAYTEL");
  u8g2.drawHLine(0,14,128);

  const char* items[4] = {
    "Platnosc",
    "Historia",
    "Ustawienia",
    "Informacje"
  };

  for(byte i=0;i<4;i++) {
    if(i==selected)
      u8g2.drawStr(0,28+i*10,">");
    u8g2.drawStr(10,28+i*10,items[i]);
  }

  u8g2.sendBuffer();
}

void drawPayment(float amount) {
  u8g2.clearBuffer();

  u8g2.setFont(u8g2_font_6x12_tf);
  u8g2.drawStr(40,10,"PAYTEL");
  u8g2.drawHLine(0,14,128);

  u8g2.drawStr(5,30,"Kwota:");

  u8g2.setFont(u8g2_font_logisoso16_tf);
  u8g2.setCursor(5,58);
  u8g2.print(amount,2);
  u8g2.print(" PLN");

  u8g2.sendBuffer();
}

void drawLoading(const char *text, byte progress) {
  u8g2.clearBuffer();

  u8g2.setFont(u8g2_font_6x12_tf);
  u8g2.drawStr(40,10,"PAYTEL");
  u8g2.drawHLine(0,14,128);

  u8g2.drawStr(10,32,text);

  u8g2.drawFrame(14,48,100,8);
  u8g2.drawBox(15,49,progress,6);

  u8g2.sendBuffer();
}

void drawSuccess() {
  u8g2.clearBuffer();

  u8g2.setFont(u8g2_font_6x12_tf);
  u8g2.drawStr(42,10,"PAYTEL");
  u8g2.drawHLine(0,14,128);

  u8g2.drawCircle(64,32,10);

  u8g2.drawLine(58,32,63,37);
  u8g2.drawLine(63,37,71,27);

  u8g2.drawStr(18,58,"Platnosc OK");

  u8g2.sendBuffer();
}