package app.ehrenamtskarte

import android.content.Context
import android.content.pm.PackageManager
import android.location.LocationManager
import android.os.Bundle
import android.util.Log
import androidx.annotation.NonNull
import com.baseflow.geolocator.location.LocationServiceListener
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.io.File

class MainActivity : FlutterActivity() {
    private val CHANNEL = "app.ehrenamtskarte/location"

    override fun configureFlutterEngine(@NonNull flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler {
                call, result ->
            if (call.method == "isLocationServiceEnabled") {
                val locationManager = context.getSystemService(LOCATION_SERVICE) as LocationManager
                val gpsEnabled = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)
                val networkEnabled = locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)
                result.success(gpsEnabled || networkEnabled)
            } else {
                result.notImplemented()
            }
        }
    }

    private fun resetApp() {
        val m = packageManager
        try {
            val info = m.getPackageInfo(packageName, 0)
            deleteRecursive(File(info.applicationInfo.dataDir))
        } catch (e: PackageManager.NameNotFoundException) {
            Log.e("WRAPPER", "Failed to get data directory!", e)
        }
    }

    private fun deleteRecursive(fileOrDirectory: File) {
        if (fileOrDirectory.isDirectory) {
            for (child in fileOrDirectory.listFiles()) {
                deleteRecursive(child)
            }
        }
        fileOrDirectory.delete()
    }

    private fun cleanITNRWData() {
        val m = packageManager
        try {
            val info = m.getPackageInfo(packageName, 0)
            val arcgisfile =
                File(info.applicationInfo.dataDir + File.separatorChar + "shared_prefs" + File.separatorChar + "com.esri.arcgisruntime.settings.xml")
            if (arcgisfile.exists()) {
                resetApp()
            }
        } catch (e: PackageManager.NameNotFoundException) {
            Log.e("WRAPPER", "Failed to get data directory!", e)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        cleanITNRWData()
        super.onCreate(savedInstanceState)
    }
}
