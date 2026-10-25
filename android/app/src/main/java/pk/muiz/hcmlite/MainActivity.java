package pk.muiz.hcmlite;

import android.Manifest;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.core.content.ContextCompat;
import androidx.core.splashscreen.SplashScreen;
import androidx.core.view.WindowCompat;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;
import java.util.ArrayList;
import java.util.List;

/**
 * Shell activity. The WebView loads the live site (see capacitor.config.ts).
 * Check-in uses the normal browser APIs: getUserMedia for the front camera and
 * navigator.geolocation for the office radius. Android does not grant those to a
 * WebView until this activity asks, so both are requested at startup.
 */
public class MainActivity extends BridgeActivity {

    // One prompt per process. A rotation would otherwise ask again.
    private static boolean askedStartupPermissions;
    private static boolean startupFinished;

    // getUserMedia can race the startup dialog. Hold the WebView request until it returns.
    private PermissionRequest pendingVideo;

    private final ActivityResultLauncher<String[]> startupPermissions = registerForActivityResult(
        new ActivityResultContracts.RequestMultiplePermissions(),
        result -> {
            startupFinished = true;
            PermissionRequest pending = pendingVideo;
            pendingVideo = null;
            if (pending == null) {
                return;
            }
            if (Boolean.TRUE.equals(result.get(Manifest.permission.CAMERA))) {
                pending.grant(new String[] { PermissionRequest.RESOURCE_VIDEO_CAPTURE });
            } else {
                pending.deny();
            }
        }
    );

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Keep the dark green splash up until the WebView has something to draw.
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);
        applyDarkStatusBar();
        installCameraGrant();
        requestStartupPermissions();
    }

    /**
     * Dark green bar with light icons, matching the app icon (#0f3d2a).
     * setAppearanceLightStatusBars(false) keeps the icons light on that dark bar.
     */
    private void applyDarkStatusBar() {
        getWindow().setStatusBarColor(Color.parseColor("#0f3d2a"));
        WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView()).setAppearanceLightStatusBars(false);
    }

    /**
     * Capacitor installs its own WebChromeClient, which already allows geolocation
     * once ACCESS_FINE_LOCATION / ACCESS_COARSE_LOCATION are granted. getUserMedia
     * is a separate step: the page asks the WebView for RESOURCE_VIDEO_CAPTURE
     * (the front camera is just the facingMode the page requests). This client
     * grants that video capture when CAMERA is already allowed.
     */
    private void installCameraGrant() {
        Bridge bridge = getBridge();
        if (bridge == null || bridge.getWebView() == null) {
            return;
        }
        bridge.getWebView().setWebChromeClient(new HcmWebChromeClient(bridge, this));
    }

    /**
     * @return true when the startup dialog is still open and this request was saved
     */
    boolean deferVideoRequest(PermissionRequest request) {
        if (startupFinished) {
            return false;
        }
        if (pendingVideo != null) {
            pendingVideo.deny();
        }
        pendingVideo = request;
        return true;
    }

    @Override
    public void onDestroy() {
        if (pendingVideo != null) {
            pendingVideo.deny();
            pendingVideo = null;
        }
        super.onDestroy();
    }

    private void requestStartupPermissions() {
        if (askedStartupPermissions) {
            return;
        }
        String[] wanted = new String[] {
            Manifest.permission.CAMERA,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION,
        };
        List<String> missing = new ArrayList<>();
        for (String permission : wanted) {
            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                missing.add(permission);
            }
        }
        if (missing.isEmpty()) {
            startupFinished = true;
            return;
        }
        askedStartupPermissions = true;
        startupPermissions.launch(missing.toArray(new String[0]));
    }

    /**
     * Grants the WebView's video-capture request so getUserMedia can open the camera.
     * Other requests, including geolocation, stay with Capacitor's client.
     */
    static final class HcmWebChromeClient extends BridgeWebChromeClient {

        private final Bridge host;
        private final MainActivity activity;

        HcmWebChromeClient(Bridge bridge, MainActivity activity) {
            super(bridge);
            this.host = bridge;
            this.activity = activity;
        }

        @Override
        public void onPermissionRequest(PermissionRequest request) {
            String[] resources = request.getResources();
            boolean videoOnly = resources != null && resources.length > 0;
            if (videoOnly) {
                for (String resource : resources) {
                    if (!PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)) {
                        videoOnly = false;
                        break;
                    }
                }
            }

            if (!videoOnly) {
                // Geolocation and anything else stay with Capacitor.
                super.onPermissionRequest(request);
                return;
            }

            boolean cameraGranted =
                ContextCompat.checkSelfPermission(host.getActivity(), Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
            if (cameraGranted) {
                // Front-camera getUserMedia. Grant video capture only.
                request.grant(new String[] { PermissionRequest.RESOURCE_VIDEO_CAPTURE });
                return;
            }

            if (activity.deferVideoRequest(request)) {
                return;
            }

            // The startup prompt already finished without camera access. Ask again.
            super.onPermissionRequest(request);
        }
    }
}
