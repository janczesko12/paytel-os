#include <Arduino.h>
#include <Wire.h>
#include <U8g2lib.h>
#include "display.h"
#include "config.h"
U8G2_SH1106_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0);



float kwota = 0.00;

//----------------------------------
// DŹWIĘKI
//----------------------------------

void beepBoot() {
  tone(BUZZER, 900, 70);
  delay(90);

  tone(BUZZER, 1300, 70);
  delay(90);

  tone(BUZZER, 1700, 120);
  delay(150);

  noTone(BUZZER);
}

void beepSuccess() {
  tone(BUZZER, 1100, 80);
  delay(100);

  tone(BUZZER, 1700, 140);
  delay(180);

  noTone(BUZZER);
}

void beepError() {
  tone(BUZZER, 450, 400);
  delay(450);

  noTone(BUZZER);
}

//----------------------------------
// BOOT
//----------------------------------

void bootScreen() {

  for (int i = 0; i <= 100; i += 2) {

    u8g2.clearBuffer();

    u8g2.setFont(u8g2_font_logisoso18_tf);
    u8g2.drawStr(0, 20, "PAYTEL");

    u8g2.drawHLine(0, 26, 128);

    u8g2.setFont(u8g2_font_6x12_tf);
    u8g2.drawStr(24, 40, "Ladowanie...");

    u8g2.drawFrame(14, 48, 100, 10);

    int szer = map(i, 0, 100, 0, 98);

    if (szer > 0)
      u8g2.drawBox(15, 49, szer, 8);

    u8g2.sendBuffer();

    delay(35);
  }

  delay(300);

  beepBoot();
}

//----------------------------------
// EKRAN GŁÓWNY
//----------------------------------

void ekranGlowny() {

  u8g2.clearBuffer();

  u8g2.setFont(u8g2_font_6x12_tf);
  u8g2.drawStr(40, 10, "PAYTEL");

  u8g2.drawHLine(0, 14, 128);

  u8g2.drawStr(4, 28, "Kwota:");

  u8g2.setFont(u8g2_font_logisoso16_tf);
  u8g2.setCursor(4, 58);
  u8g2.print(kwota, 2);
  u8g2.print(" PLN");

  u8g2.sendBuffer();
}

//----------------------------------
// ANIMACJA PŁATNOŚCI
//----------------------------------

void paymentAnimation() {

  // Łączenie
  u8g2.clearBuffer();

  u8g2.setFont(u8g2_font_6x12_tf);
  u8g2.drawStr(42, 10, "PAYTEL");
  u8g2.drawHLine(0, 14, 128);

  u8g2.setFont(u8g2_font_logisoso16_tf);
  u8g2.drawStr(8, 38, "Laczenie");

  u8g2.drawFrame(14, 50, 100, 8);

  for (int i = 0; i <= 98; i += 2) {
    u8g2.drawBox(15, 51, i, 6);
    u8g2.sendBuffer();
    delay(20);
  }

  delay(700);

  // Autoryzacja
  u8g2.clearBuffer();

  u8g2.setFont(u8g2_font_6x12_tf);
  u8g2.drawStr(42, 10, "PAYTEL");
  u8g2.drawHLine(0, 14, 128);

  u8g2.setFont(u8g2_font_logisoso16_tf);
  u8g2.drawStr(0, 38, "Autoryzacja");

  u8g2.drawFrame(14, 50, 100, 8);

  for (int i = 0; i <= 98; i += 2) {
    u8g2.drawBox(15, 51, i, 6);
    u8g2.sendBuffer();
    delay(18);
  }

  delay(600);

  // Sukces
  u8g2.clearBuffer();

  u8g2.setFont(u8g2_font_6x12_tf);
  u8g2.drawStr(42, 10, "PAYTEL");
  u8g2.drawHLine(0, 14, 128);

  u8g2.setFont(u8g2_font_logisoso16_tf);
  u8g2.drawStr(18, 34, "PLATNOSC");

  u8g2.setFont(u8g2_font_6x12_tf);
  u8g2.drawStr(18, 52, "zaakceptowana");

  // Ptaszek
  u8g2.drawLine(92, 44, 98, 50);
  u8g2.drawLine(98, 50, 110, 36);
  u8g2.drawLine(92, 45, 98, 51);
  u8g2.drawLine(98, 51, 110, 37);

  u8g2.sendBuffer();

  beepSuccess();

  delay(2000);
}

//----------------------------------
// SETUP
//----------------------------------

void setup() {

  pinMode(BTN_PLUS, INPUT_PULLUP);
  pinMode(BTN_MINUS, INPUT_PULLUP);
  pinMode(BTN_OK, INPUT_PULLUP);

  pinMode(BUZZER, OUTPUT);

  u8g2.begin();

  bootScreen();
}

//----------------------------------
// LOOP
//----------------------------------

void loop() {

  ekranGlowny();

  if (!digitalRead(BTN_PLUS)) {
    kwota += 1.00;
    delay(150);
  }

  if (!digitalRead(BTN_MINUS)) {
    if (kwota >= 1.00)
      kwota -= 1.00;
    delay(150);
  }

  if (!digitalRead(BTN_OK)) {
    paymentAnimation();
  }
}