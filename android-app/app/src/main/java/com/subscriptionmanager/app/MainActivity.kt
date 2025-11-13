package com.subscriptionmanager.app

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.view.KeyEvent
import android.view.View
import android.webkit.*
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.subscriptionmanager.app.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var webView: WebView
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout

    // Website URL - Replace with your actual website URL
    private val websiteUrl = "http://localhost:5174" // Development URL
    // For production, use: "https://your-domain.com"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        initializeViews()
        setupWebView()
        setupSwipeRefresh()
        loadWebsite()
    }

    private fun initializeViews() {
        webView = binding.webView
        swipeRefreshLayout = binding.swipeRefreshLayout
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        webView.apply {
            webViewClient = CustomWebViewClient()
            webChromeClient = CustomWebChromeClient()

            settings.apply {
                // Enable JavaScript
                javaScriptEnabled = true

                // Enable DOM storage
                domStorageEnabled = true

                // Enable local storage
                databaseEnabled = true

                // Enable caching
                cacheMode = WebSettings.LOAD_DEFAULT

                // Enable zoom controls but hide the zoom buttons
                setSupportZoom(true)
                builtInZoomControls = true
                displayZoomControls = false

                // Enable responsive design
                useWideViewPort = true
                loadWithOverviewMode = true

                // Enable mixed content for development
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW

                // Set user agent to include app info
                userAgentString = "$userAgentString SubscriptionManagerApp/1.0"

                // Allow file access
                allowFileAccess = true
                allowContentAccess = true

                // Enable geolocation if needed
                setGeolocationEnabled(true)
            }
        }
    }

    private fun setupSwipeRefresh() {
        swipeRefreshLayout.setOnRefreshListener {
            webView.reload()
        }

        // Set colors for the refresh indicator
        swipeRefreshLayout.setColorSchemeResources(
            android.R.color.holo_blue_bright,
            android.R.color.holo_green_light,
            android.R.color.holo_orange_light,
            android.R.color.holo_red_light
        )
    }

    private fun loadWebsite() {
        showLoading(true)
        webView.loadUrl(websiteUrl)
    }

    private fun showLoading(show: Boolean) {
        binding.progressBar.visibility = if (show) View.VISIBLE else View.GONE
    }

    private fun showError(message: String) {
        binding.errorLayout.visibility = View.VISIBLE
        binding.errorText.text = message
        binding.retryButton.setOnClickListener {
            binding.errorLayout.visibility = View.GONE
            loadWebsite()
        }
    }

    private fun hideError() {
        binding.errorLayout.visibility = View.GONE
    }

    // Custom WebViewClient to handle page loading and navigation
    private inner class CustomWebViewClient : WebViewClient() {

        override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
            super.onPageStarted(view, url, favicon)
            showLoading(true)
            hideError()
        }

        override fun onPageFinished(view: WebView?, url: String?) {
            super.onPageFinished(view, url)
            showLoading(false)
            swipeRefreshLayout.isRefreshing = false
        }

        override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
            val url = request?.url?.toString()

            // Handle external links (open in browser)
            if (url != null && (url.startsWith("mailto:") ||
                url.startsWith("tel:") ||
                url.startsWith("sms:") ||
                url.contains("play.google.com") ||
                url.contains("apps.apple.com"))) {

                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                startActivity(intent)
                return true
            }

            // Handle payment URLs (might need to open in browser for security)
            if (url != null && (url.contains("stripe.com") ||
                url.contains("razorpay.com") ||
                url.contains("checkout"))) {

                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                startActivity(intent)
                return true
            }

            return false
        }

        override fun onReceivedError(
            view: WebView?,
            request: WebResourceRequest?,
            error: WebResourceError?
        ) {
            super.onReceivedError(view, request, error)
            showLoading(false)
            swipeRefreshLayout.isRefreshing = false

            if (error != null && request?.isForMainFrame == true) {
                val errorMessage = when (error.errorCode) {
                    WebViewClient.ERROR_HOST_LOOKUP -> "Unable to connect to server. Please check your internet connection."
                    WebViewClient.ERROR_CONNECT -> "Connection failed. Please try again."
                    WebViewClient.ERROR_TIMEOUT -> "Connection timed out. Please try again."
                    WebViewClient.ERROR_UNKNOWN -> "An unknown error occurred. Please try again."
                    else -> "Error loading page: ${error.description}"
                }
                showError(errorMessage)
            }
        }

        override fun onReceivedHttpError(
            view: WebView?,
            request: WebResourceRequest?,
            errorResponse: WebResourceResponse?
        ) {
            super.onReceivedHttpError(view, request, errorResponse)

            if (request?.isForMainFrame == true) {
                showLoading(false)
                swipeRefreshLayout.isRefreshing = false

                val statusCode = errorResponse?.statusCode ?: 0
                val errorMessage = when (statusCode) {
                    404 -> "Page not found (404). Please check if the website is running."
                    500 -> "Server error (500). Please try again later."
                    503 -> "Service unavailable (503). Please try again later."
                    else -> "HTTP Error: $statusCode"
                }
                showError(errorMessage)
            }
        }
    }

    // Custom WebChromeClient for better UX
    private inner class CustomWebChromeClient : WebChromeClient() {

        override fun onProgressChanged(view: WebView?, newProgress: Int) {
            super.onProgressChanged(view, newProgress)

            // Update progress bar
            if (newProgress < 100) {
                binding.progressBar.visibility = View.VISIBLE
            } else {
                binding.progressBar.visibility = View.GONE
            }
        }

        override fun onReceivedTitle(view: WebView?, title: String?) {
            super.onReceivedTitle(view, title)
            // Update action bar title if needed
            supportActionBar?.title = title ?: "Subscription Manager"
        }

        override fun onJsAlert(view: WebView?, url: String?, message: String?, result: JsResult?): Boolean {
            Toast.makeText(this@MainActivity, message, Toast.LENGTH_LONG).show()
            result?.confirm()
            return true
        }

        override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
            consoleMessage?.let {
                println("WebView Console: ${it.message()} (${it.sourceId()}:${it.lineNumber()})")
            }
            return true
        }
    }

    // Handle back button navigation
    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack()
            return true
        }
        return super.onKeyDown(keyCode, event)
    }

    override fun onDestroy() {
        super.onDestroy()
        webView.destroy()
    }

    override fun onPause() {
        super.onPause()
        webView.onPause()
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
    }
}
