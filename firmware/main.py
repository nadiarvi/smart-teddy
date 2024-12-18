import urequests
import time
import json
import sys

#  Sensor Libraries
from imu import MPU6050 
from bmp085 import BMP180
from vl6180x import Sensor

from machine import Pin, I2C, ADC

i2c = I2C(1, scl=Pin(11), sda=Pin(10))
print("I2C devices found:", i2c.scan())
i2c_imu = I2C(0, scl=Pin(21), sda=Pin(20))
print("I2C devices found:", i2c.scan(), i2c_imu.scan())

bmp = BMP180(i2c)
imu = MPU6050(i2c_imu)
tof_sensor = Sensor(i2c_imu)
flex_sensor = ADC(Pin(27))
bmp.sealevel = 101325
basis = bmp.pressure

i=0
while True:
    try:
        # Read sensor values
        flex_val = flex_sensor.read_u16()
        ax=round(imu.accel.x,2)
        ay=round(imu.accel.y,2)
        az=round(imu.accel.z,2)
        dist = tof_sensor.range()

        # Pass sensor values
        data = json.dumps({
            'head': dist,
            'hand': flex_val,
            'body': [ax , ay, az]
        })
        print(data)

        time.sleep(0.1)

    except Exception as e:
        print(f"Error: {e}")
        time.sleep(1)