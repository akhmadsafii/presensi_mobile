package com.presensigps;

import android.provider.Settings;
import android.util.Log;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

public class DeveloperModeModule extends ReactContextBaseJavaModule {
    private static final String TAG = "DeveloperModeModule";

    public DeveloperModeModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "DeveloperMode";
    }

    @ReactMethod
    public void isDeveloperModeEnabled(Callback callback) {
        try {
            int adbEnabled = Settings.Global.getInt(
                getReactApplicationContext().getContentResolver(),
                Settings.Global.ADB_ENABLED, 
                0
            );

            boolean isEnabled = adbEnabled == 1;
            Log.d(TAG, "Developer mode status: " + isEnabled);
            callback.invoke(null, isEnabled);
        } catch (Exception e) {
            Log.e(TAG, "Error checking developer mode", e);
            callback.invoke(e.getMessage(), false);
        }
    }
} 