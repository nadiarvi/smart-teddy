from imu import MPU6050 
from bmp085 import BMP180
from vl6180x import Sensor
import time, math, utime
import json
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


while True:

    flex_val = flex_sensor.read_u16()
    ax=round(imu.accel.x,2)
    ay=round(imu.accel.y,2)
    az=round(imu.accel.z,2)
    gx=round(imu.gyro.x)
    gy=round(imu.gyro.y)
    gz=round(imu.gyro.z)
    tem=round(imu.temperature,2)
    dist = tof_sensor.range()
    pres_hPa = bmp.pressure - basis
    altitude = bmp.altitude
    tempC = bmp.temperature

    #print("ax",ax,"\tay",ay,"\taz",az,"\tpressure",pres_hPa,"\tbeats", beats, "\tflex",flex_val,"\ttouch",touch_val,"\t",end="\r")
    #print("pressure", pres_hPa, "\taccel_x", ax, "\tflex",flex_val,"\ttouch", dist)
    print(pres_hPa, ax, ay, ax, flex_val, dist)

    # for debugging purposes
    # features = {
    #     "pressure": pres_hPa,
    #     "accel": {
    #         "x": ax,
    #         "y": ay,
    #         "z": az
    #     },
    #     "flex_val": flex_val,
    #     "touch_val": dist
    # }

    # print(json.dumps(features))
    
    #print("pressure",pres_hPa,"\t", "beats", beats, raw_value, "\t",end="\r")
    #print("pressure",pres_hPa)

    time.sleep(.1)
