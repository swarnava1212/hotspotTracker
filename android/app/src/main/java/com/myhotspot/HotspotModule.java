package com.myhotspot;

import android.content.Context;
import android.net.wifi.WifiManager;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.io.BufferedReader;
import java.io.FileReader;
import java.lang.reflect.Method;
import java.net.InetAddress;

public class HotspotModule extends ReactContextBaseJavaModule {

    public HotspotModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "HotspotModule";
    }

   @ReactMethod
public void getConnectedDevices(Callback callback) {
    WritableArray deviceList = Arguments.createArray();

    if (android.os.Build.VERSION.SDK_INT <= android.os.Build.VERSION_CODES.P) {
        // Android 9 and below – Use ARP table
        try (BufferedReader br = new BufferedReader(new FileReader("/proc/net/arp"))) {
            String line;
            while ((line = br.readLine()) != null) {
                String[] parts = line.split(" +");
                if (parts.length >= 6 && !parts[0].equals("IP")) {
                    String ip = parts[0];
                    String mac = parts[3];
                    String flags = parts[2];
                    String device = parts[5];

                    WritableMap deviceMap = Arguments.createMap();
                    deviceMap.putString("ip", ip);
                    deviceMap.putString("mac", mac);
                    deviceMap.putString("deviceName", getDeviceName(ip));
                    deviceMap.putString("flags", flags);
                    deviceMap.putString("interface", device);

                    deviceList.pushMap(deviceMap);
                }
            }
        } catch (Exception e) {
            Log.e("HotspotModule", "Error reading ARP table: " + e.getMessage());
        }
    } else {
        // Android 10+ — Use basic IP ping sweep (no MAC, only IP)
        new Thread(() -> {
            String subnet = "192.168.43"; // Common for hotspot, may vary
            for (int i = 1; i < 255; i++) {
                String host = subnet + "." + i;
                try {
                    InetAddress inet = InetAddress.getByName(host);
                    if (inet.isReachable(300)) {
                        WritableMap deviceMap = Arguments.createMap();
                        deviceMap.putString("ip", host);
                        deviceMap.putString("deviceName", inet.getHostName());
                        deviceList.pushMap(deviceMap);
                    }
                } catch (Exception ignored) {}
            }
            getReactApplicationContext().runOnUiQueueThread(() -> callback.invoke(deviceList));
        }).start();
        return;
    }

    callback.invoke(deviceList);
}

    //  METHOD 2: Get device name via IP
    private String getDeviceName(String ipAddress) {
        try {
            InetAddress inetAddress = InetAddress.getByName(ipAddress);
            return inetAddress.getHostName();
        } catch (Exception e) {
            return "Unknown";
        }
    }

    // METHOD 3: Check if hotspot is enabled
    @ReactMethod
    public void isHotspotEnabled(Callback callback) {
        try {
            WifiManager wifiManager = (WifiManager) getReactApplicationContext().getSystemService(Context.WIFI_SERVICE);
            Method method = wifiManager.getClass().getDeclaredMethod("isWifiApEnabled");
            method.setAccessible(true);
            boolean isEnabled = (boolean) method.invoke(wifiManager);
            callback.invoke(isEnabled);
        } catch (Exception e) {
            Log.e("HotspotModule", "Error checking hotspot status: " + e.getMessage());
            callback.invoke(false);
        }
    }

    // (Optional) METHOD 4: Turn on hotspot (for rooted or system apps)
    @ReactMethod
    public void turnOnHotspot() {
        // Note: This method requires system permissions or root to work
        // Implement only if you have system access
    }
}
