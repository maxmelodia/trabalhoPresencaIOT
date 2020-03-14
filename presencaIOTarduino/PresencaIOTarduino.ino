#include <Ethernet.h>
#include <SPI.h>
#include "RestClient.h"

#define pinPIR 7
RestClient client = RestClient("192.168.1.107",3000);
String response;

void setup() {
  pinMode(pinPIR, INPUT);
  Serial.begin(9600);
  Serial.println("Setup: conectando DHCP");
  client.dhcp();
  Serial.println("Sucesso!!!"); 
}

void sendSMS(){
  delay(5000);
  response = "";
  int statusCode = client.get("/function_test", &response);
  Serial.print("Status: ");
  Serial.println(statusCode);
  Serial.print("Resposta do Servidor: ");
  Serial.println(response);  
}

void loop() {
  bool valorPIR = digitalRead(pinPIR);
  if (valorPIR) {
     Serial.println("DETECTADO");
     delay(5000);
     sendSMS();
  } else {
     Serial.println("----------");
  }
}
