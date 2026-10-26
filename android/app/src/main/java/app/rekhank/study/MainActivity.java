package app.rekhank.study;

import android.Manifest;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;

import com.google.androidbrowserhelper.trusted.LauncherActivity;

/** Opens the website full screen (Trusted Web Activity), after setting up the daily study reminder.
 *  On Android 13 and later it first asks once for permission to show notifications. */
public class MainActivity extends LauncherActivity {
    private static final int ASK_NOTIFICATIONS = 7;

    @Override
    protected boolean shouldLaunchImmediately() {
        Reminders.schedule(this);
        if (Build.VERSION.SDK_INT >= 33
                && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            SharedPreferences prefs = getSharedPreferences(Reminders.PREFS, MODE_PRIVATE);
            if (!prefs.getBoolean("askedNotifications", false)) {
                prefs.edit().putBoolean("askedNotifications", true).apply();
                requestPermissions(new String[] {Manifest.permission.POST_NOTIFICATIONS}, ASK_NOTIFICATIONS);
                return false;
            }
        }
        return true;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] results) {
        super.onRequestPermissionsResult(requestCode, permissions, results);
        if (requestCode == ASK_NOTIFICATIONS) launchTwa();
    }
}
