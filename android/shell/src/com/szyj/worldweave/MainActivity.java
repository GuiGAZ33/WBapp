package com.szyj.worldweave;

import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.KeyEvent;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class MainActivity extends Activity {

    private static final String HOST = "appassets.androidplatform.net";
    private static final String BASE_URL = "https://" + HOST + "/index.html";
    private static final int REQ_PERMISSIONS = 1001;

    private WebView web;
    private boolean fallbackUsed = false;
    private final Handler ui = new Handler(Looper.getMainLooper());

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        s.setSupportMultipleWindows(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setTextZoom(100);
        if (Build.VERSION.SDK_INT >= 21) {
            s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }
        if (Build.VERSION.SDK_INT >= 19) {
            WebView.setWebContentsDebuggingEnabled(false);
        }

        web.setBackgroundColor(0xFFFFFFFF);
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return handleNavigation(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleNavigation(Uri.parse(url));
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return serveAsset(request);
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
                return serveAsset(url, null);
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                if (!fallbackUsed && failingUrl != null && failingUrl.startsWith("https://" + HOST)) {
                    fallbackUsed = true;
                    view.loadUrl("file:///android_asset/index.html");
                }
            }
        });
        web.setWebChromeClient(new WebChromeClient());
        web.addJavascriptInterface(new ShellBridge(), "WWNative");
        web.setDownloadListener(new android.webkit.DownloadListener() {
            @Override
            public void onDownloadStart(String url, String userAgent, String contentDisposition,
                                        String mimetype, long contentLength) {
                if (url != null && url.startsWith("http")) {
                    openExternal(url);
                }
            }
        });

        web.loadUrl(BASE_URL);
        requestStartupPermissions();
    }

    /* ---------------- 导航：外链一律交给系统浏览器 ---------------- */

    private boolean handleNavigation(Uri u) {
        if (u == null) return false;
        String scheme = u.getScheme() == null ? "" : u.getScheme().toLowerCase();
        if ("http".equals(scheme) || "https".equals(scheme)) {
            if (HOST.equals(u.getHost())) return false;
            openExternal(u.toString());
            return true;
        }
        try {
            Intent i = new Intent(Intent.ACTION_VIEW, u);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(i);
        } catch (Exception ignored) {
        }
        return true;
    }

    private void openExternal(final String url) {
        ui.post(new Runnable() {
            @Override
            public void run() {
                try {
                    Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(i);
                } catch (Exception ignored) {
                }
            }
        });
    }

    /* ---------------- 本地资源服务（https 源，localStorage 可用） ---------------- */

    private WebResourceResponse serveAsset(WebResourceRequest request) {
        Map<String, String> headers = null;
        try {
            if (request != null) headers = request.getRequestHeaders();
        } catch (Exception ignored) {
        }
        return serveAsset(request == null ? null : String.valueOf(request.getUrl()), headers);
    }

    private WebResourceResponse serveAsset(String url, Map<String, String> headers) {
        try {
            Uri u = Uri.parse(url);
            if (!HOST.equals(u.getHost())) return null;
            String path = u.getPath();
            if (path == null || path.isEmpty() || "/".equals(path)) path = "/index.html";
            if (path.startsWith("/")) path = path.substring(1);
            if (path.contains("..")) path = "index.html";

            InputStream in;
            try {
                in = getAssets().open(path);
            } catch (IOException e) {
                return notFound();
            }

            String mime = mimeOf(path);
            Map<String, String> out = new HashMap<String, String>();
            out.put("Access-Control-Allow-Origin", "*");
            out.put("Cache-Control", "no-cache");
            out.put("Accept-Ranges", "bytes");

            long total = -1;
            try {
                total = in.available();
            } catch (Exception ignored) {
            }

            String range = headers == null ? null : headers.get("Range");
            if (range == null && headers != null) range = headers.get("range");
            if (range != null && range.startsWith("bytes=") && total > 0) {
                try {
                    String spec = range.substring(6);
                    int comma = spec.indexOf(',');
                    if (comma >= 0) spec = spec.substring(0, comma);
                    int dash = spec.indexOf('-');
                    long start = Long.parseLong(spec.substring(0, dash).trim());
                    long end = dash + 1 < spec.length() && spec.substring(dash + 1).trim().length() > 0
                            ? Long.parseLong(spec.substring(dash + 1).trim())
                            : total - 1;
                    if (start < 0) start = 0;
                    if (end >= total) end = total - 1;
                    if (end < start) {
                        in.close();
                        return notFound();
                    }
                    long skip = start;
                    while (skip > 0) {
                        long n = in.skip(skip);
                        if (n <= 0) break;
                        skip -= n;
                    }
                    out.put("Content-Range", "bytes " + start + "-" + end + "/" + total);
                    return new WebResourceResponse(mime, "utf-8", 206, "Partial Content", out,
                            new LimitedInputStream(in, end - start + 1));
                } catch (Exception ignored) {
                }
            }

            return new WebResourceResponse(mime, "utf-8", 200, "OK", out, in);
        } catch (Exception e) {
            return notFound();
        }
    }

    private WebResourceResponse notFound() {
        Map<String, String> h = new HashMap<String, String>();
        h.put("Access-Control-Allow-Origin", "*");
        return new WebResourceResponse("application/json", "utf-8", 404, "Not Found", h,
                new ByteArrayInputStream("{\"ok\":false,\"error\":{\"code\":\"not_found\"}}".getBytes()));
    }

    private String mimeOf(String path) {
        String p = path.toLowerCase();
        if (p.endsWith(".html") || p.endsWith(".htm")) return "text/html";
        if (p.endsWith(".js")) return "application/javascript";
        if (p.endsWith(".css")) return "text/css";
        if (p.endsWith(".json")) return "application/json";
        if (p.endsWith(".webmanifest")) return "application/manifest+json";
        if (p.endsWith(".svg")) return "image/svg+xml";
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".jpg") || p.endsWith(".jpeg")) return "image/jpeg";
        if (p.endsWith(".webp")) return "image/webp";
        if (p.endsWith(".gif")) return "image/gif";
        if (p.endsWith(".ico")) return "image/x-icon";
        if (p.endsWith(".mp3")) return "audio/mpeg";
        if (p.endsWith(".wav")) return "audio/wav";
        if (p.endsWith(".m4a")) return "audio/mp4";
        if (p.endsWith(".ogg")) return "audio/ogg";
        if (p.endsWith(".woff")) return "font/woff";
        if (p.endsWith(".woff2")) return "font/woff2";
        if (p.endsWith(".ttf")) return "font/ttf";
        if (p.endsWith(".txt") || p.endsWith(".md")) return "text/plain";
        return "application/octet-stream";
    }

    private static final class LimitedInputStream extends InputStream {
        private final InputStream in;
        private long left;

        LimitedInputStream(InputStream in, long limit) {
            this.in = in;
            this.left = limit;
        }

        @Override
        public int read() throws IOException {
            if (left <= 0) return -1;
            int b = in.read();
            if (b >= 0) left--;
            return b;
        }

        @Override
        public int read(byte[] b, int off, int len) throws IOException {
            if (left <= 0) return -1;
            int n = in.read(b, off, (int) Math.min(len, left));
            if (n > 0) left -= n;
            return n;
        }

        @Override
        public void close() throws IOException {
            in.close();
        }
    }

    /* ---------------- 权限 ---------------- */

    private void requestStartupPermissions() {
        if (Build.VERSION.SDK_INT < 23) return;
        ArrayList<String> need = new ArrayList<String>();
        try {
            if (checkSelfPermission(android.Manifest.permission.READ_EXTERNAL_STORAGE)
                    != PackageManager.PERMISSION_GRANTED) {
                need.add(android.Manifest.permission.READ_EXTERNAL_STORAGE);
            }
            if (Build.VERSION.SDK_INT <= 29
                    && checkSelfPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE)
                    != PackageManager.PERMISSION_GRANTED) {
                need.add(android.Manifest.permission.WRITE_EXTERNAL_STORAGE);
            }
        } catch (Exception ignored) {
        }
        if (!need.isEmpty()) {
            try {
                requestPermissions(need.toArray(new String[0]), REQ_PERMISSIONS);
            } catch (Exception ignored) {
            }
        }
    }

    private boolean storageGranted() {
        if (Build.VERSION.SDK_INT < 23) return true;
        try {
            return checkSelfPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE)
                    == PackageManager.PERMISSION_GRANTED
                    || checkSelfPermission(android.Manifest.permission.READ_EXTERNAL_STORAGE)
                    == PackageManager.PERMISSION_GRANTED;
        } catch (Exception e) {
            return false;
        }
    }

    private String downloadDir() {
        try {
            File f = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
            if (f != null) return f.getAbsolutePath();
        } catch (Exception ignored) {
        }
        return "/storage/emulated/0/Download";
    }

    private String permissionsJson() {
        // 世界织卷不依赖相机 / 麦克风 / 应用列表，统一视为已允许，
        // 否则前端的「权限门」会因未授权项而无法进入 APP。
        return "{\"storage\":true,\"notifications\":true,\"camera\":true,"
                + "\"microphone\":true,\"packages\":true}";
    }

    /* ---------------- JS 桥 ---------------- */

    public class ShellBridge {

        @JavascriptInterface
        public String getDownloadPath() {
            return downloadDir();
        }

        @JavascriptInterface
        public boolean openExternal(String url) {
            if (url == null || url.isEmpty()) return false;
            openExternal(url.trim());
            return true;
        }

        @JavascriptInterface
        public boolean requestStoragePermission() {
            requestStartupPermissions();
            return storageGranted();
        }

        @JavascriptInterface
        public String getPermissionStatus() {
            return permissionsJson();
        }

        @JavascriptInterface
        public String requestAllPermissions() {
            ui.post(new Runnable() {
                @Override
                public void run() {
                    requestStartupPermissions();
                }
            });
            return permissionsJson();
        }

        @JavascriptInterface
        public boolean fileExists(String path) {
            if (path == null) return false;
            try {
                return new File(path).exists();
            } catch (Exception e) {
                return false;
            }
        }

        @JavascriptInterface
        public String listFiles(String path) {
            String dir = path == null || path.trim().isEmpty() ? downloadDir() : path;
            StringBuilder sb = new StringBuilder("[");
            try {
                File d = new File(dir);
                File[] files = d.listFiles();
                boolean first = true;
                if (files != null) {
                    for (File f : files) {
                        if (f.isDirectory()) continue;
                        if (!first) sb.append(',');
                        first = false;
                        sb.append("{\"name\":\"").append(jsEscape(f.getName()))
                                .append("\",\"path\":\"").append(jsEscape(f.getAbsolutePath()))
                                .append("\",\"size\":").append(f.length())
                                .append(",\"modified\":").append(f.lastModified())
                                .append(",\"isDirectory\":false}");
                    }
                }
            } catch (Exception ignored) {
            }
            sb.append(']');
            return sb.toString();
        }

        @JavascriptInterface
        public boolean saveFile(String name, String base64, String mime, String dir) {
            if (name == null || base64 == null) return false;
            String safe = name.replaceAll("[\\\\/:*?\"<>|]", "_").trim();
            if (safe.isEmpty()) safe = "export.bin";
            byte[] data;
            try {
                data = Base64.decode(base64, Base64.DEFAULT);
            } catch (Exception e) {
                return false;
            }
            String m = mime == null || mime.trim().isEmpty() ? "application/octet-stream" : mime.trim();

            if (Build.VERSION.SDK_INT >= 29) {
                if (saveWithMediaStore(safe, data, m)) return true;
            }
            try {
                File targetDir = new File(dir == null || dir.trim().isEmpty() ? downloadDir() : dir.trim());
                if (!targetDir.exists()) targetDir.mkdirs();
                File out = new File(targetDir, safe);
                FileOutputStream fos = new FileOutputStream(out);
                fos.write(data);
                fos.close();
                return true;
            } catch (Exception e) {
                return false;
            }
        }

        private boolean saveWithMediaStore(String name, byte[] data, String mime) {
            try {
                ContentValues cv = new ContentValues();
                cv.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
                cv.put(MediaStore.MediaColumns.MIME_TYPE, mime);
                cv.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                Uri item = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv);
                if (item == null) return false;
                OutputStream os = getContentResolver().openOutputStream(item);
                if (os == null) return false;
                os.write(data);
                os.close();
                return true;
            } catch (Exception e) {
                return false;
            }
        }

        @JavascriptInterface
        public boolean openFile(String path) {
            if (path == null) return false;
            try {
                File f = new File(path);
                if (!f.exists()) return false;
                Intent i = new Intent(Intent.ACTION_VIEW);
                i.setDataAndType(Uri.fromFile(f), mimeOf(f.getName()));
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_GRANT_READ_URI_PERMISSION);
                startActivity(i);
                return true;
            } catch (Exception e) {
                return false;
            }
        }

        @JavascriptInterface
        public boolean installFile(String path) {
            return openFile(path);
        }

        @JavascriptInterface
        public String checkUpdate() {
            return "";
        }

        private String jsEscape(String s) {
            if (s == null) return "";
            StringBuilder b = new StringBuilder();
            for (int i = 0; i < s.length(); i++) {
                char c = s.charAt(i);
                if (c == '"' || c == '\\') b.append('\\').append(c);
                else if (c < 0x20) b.append(' ');
                else b.append(c);
            }
            return b.toString();
        }
    }

    /* ---------------- 生命周期 ---------------- */

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            if (web != null && web.canGoBack()) {
                web.goBack();
                return true;
            }
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onPause() {
        if (web != null) web.onPause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.onResume();
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }
}
