import SwiftUI
import WebKit

/// WKWebView wrapper for the game - loads bundled HTML content offline
struct GameWebView: UIViewRepresentable {
    var onExternalLinkRequested: ((URL) -> Void)?
    var onPurchaseRequested: (() -> Void)?
    var onSettingsRequested: (() -> Void)?

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()

        // Configure for offline, secure, kids-safe operation
        let preferences = WKPreferences()
        preferences.javaScriptCanOpenWindowsAutomatically = false
        configuration.preferences = preferences

        // Disable link previews and other non-essential features
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []

        // Set up message handlers for JS -> Swift communication
        let contentController = WKUserContentController()
        contentController.add(context.coordinator, name: "iosHandler")
        contentController.add(context.coordinator, name: "parentGate")
        contentController.add(context.coordinator, name: "purchase")

        // Inject bridge script for game to communicate with native
        let bridgeScript = WKUserScript(
            source: GameWebView.bridgeJavaScript,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )
        contentController.addUserScript(bridgeScript)

        configuration.userContentController = contentController

        // Create WebView
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.scrollView.isScrollEnabled = false // Game handles its own scrolling
        webView.scrollView.bounces = false
        webView.isOpaque = true
        webView.backgroundColor = UIColor(red: 0.529, green: 0.808, blue: 0.922, alpha: 1.0) // sky-400 color

        // Disable zoom
        webView.scrollView.minimumZoomScale = 1.0
        webView.scrollView.maximumZoomScale = 1.0

        // Load bundled game
        loadBundledGame(webView: webView)

        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {
        // No updates needed for static game content
    }

    private func loadBundledGame(webView: WKWebView) {
        // Look for index.html in the WebContent folder within the bundle
        if let indexPath = Bundle.main.path(forResource: "index", ofType: "html", inDirectory: "WebContent") {
            let indexURL = URL(fileURLWithPath: indexPath)
            let webContentURL = indexURL.deletingLastPathComponent()
            webView.loadFileURL(indexURL, allowingReadAccessTo: webContentURL)
        } else {
            // Fallback: show error message
            let errorHTML = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #87CEEB 0%, #98D8C8 100%);
                        color: #333;
                    }
                    .container { text-align: center; padding: 20px; }
                    h1 { font-size: 48px; margin-bottom: 10px; }
                    p { font-size: 18px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Kid Genius World</h1>
                    <p>Loading game content...</p>
                </div>
            </body>
            </html>
            """
            webView.loadHTMLString(errorHTML, baseURL: nil)
        }
    }

    /// JavaScript bridge for native communication
    static let bridgeJavaScript = """
    // iOS Native Bridge
    window.iOSBridge = {
        // Request parent gate for external action
        requestParentGate: function(action, data) {
            window.webkit.messageHandlers.parentGate.postMessage({
                action: action,
                data: data || null
            });
        },

        // Request in-app purchase
        requestPurchase: function(productId) {
            window.webkit.messageHandlers.purchase.postMessage({
                productId: productId
            });
        },

        // Send analytics event (on-device only, no network)
        logEvent: function(eventName, params) {
            window.webkit.messageHandlers.iosHandler.postMessage({
                type: 'analytics',
                event: eventName,
                params: params || {}
            });
        },

        // Save progress locally
        saveProgress: function(data) {
            window.webkit.messageHandlers.iosHandler.postMessage({
                type: 'saveProgress',
                data: data
            });
        },

        // Load progress
        loadProgress: function() {
            window.webkit.messageHandlers.iosHandler.postMessage({
                type: 'loadProgress'
            });
        },

        // Text-to-speech (native, no network)
        speak: function(text, rate, pitch) {
            window.webkit.messageHandlers.iosHandler.postMessage({
                type: 'speak',
                text: text,
                rate: rate || 0.5,
                pitch: pitch || 1.1
            });
        },

        // Stop speaking
        stopSpeaking: function() {
            window.webkit.messageHandlers.iosHandler.postMessage({
                type: 'stopSpeaking'
            });
        }
    };

    // Notify game that bridge is ready
    window.dispatchEvent(new CustomEvent('iosBridgeReady'));
    """

    // MARK: - Coordinator

    class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
        var parent: GameWebView
        private let speechService = SpeechService()
        private let progressStore = ProgressStore()

        init(_ parent: GameWebView) {
            self.parent = parent
        }

        // MARK: - WKScriptMessageHandler

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard let body = message.body as? [String: Any] else { return }

            switch message.name {
            case "iosHandler":
                handleIOSMessage(body)
            case "parentGate":
                handleParentGateRequest(body)
            case "purchase":
                handlePurchaseRequest(body)
            default:
                break
            }
        }

        private func handleIOSMessage(_ body: [String: Any]) {
            guard let type = body["type"] as? String else { return }

            switch type {
            case "analytics":
                // On-device analytics only - just log locally, no network
                if let event = body["event"] as? String {
                    OnDeviceAnalytics.shared.logEvent(event, params: body["params"] as? [String: Any])
                }

            case "saveProgress":
                if let data = body["data"] {
                    progressStore.save(data)
                }

            case "loadProgress":
                // Progress will be injected back via JS
                break

            case "speak":
                if let text = body["text"] as? String {
                    let rate = body["rate"] as? Float ?? 0.5
                    let pitch = body["pitch"] as? Float ?? 1.1
                    speechService.speak(text, rate: rate, pitch: pitch)
                }

            case "stopSpeaking":
                speechService.stop()

            default:
                break
            }
        }

        private func handleParentGateRequest(_ body: [String: Any]) {
            guard let action = body["action"] as? String else { return }

            if action == "openURL", let urlString = body["data"] as? String, let url = URL(string: urlString) {
                parent.onExternalLinkRequested?(url)
            } else if action == "settings" {
                parent.onSettingsRequested?()
            }
        }

        private func handlePurchaseRequest(_ body: [String: Any]) {
            parent.onPurchaseRequested?()
        }

        // MARK: - WKNavigationDelegate

        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {

            guard let url = navigationAction.request.url else {
                decisionHandler(.allow)
                return
            }

            // Allow file:// URLs (bundled content)
            if url.isFileURL {
                decisionHandler(.allow)
                return
            }

            // Allow about:blank
            if url.absoluteString == "about:blank" {
                decisionHandler(.allow)
                return
            }

            // Block all external navigation - require parent gate
            if url.scheme == "http" || url.scheme == "https" {
                decisionHandler(.cancel)
                parent.onExternalLinkRequested?(url)
                return
            }

            // Block other schemes (mailto:, tel:, etc.)
            decisionHandler(.cancel)
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            // Inject saved progress after page loads
            if let progressData = progressStore.load() {
                let jsonString = progressData.replacingOccurrences(of: "'", with: "\\'")
                webView.evaluateJavaScript("window.loadSavedProgress && window.loadSavedProgress('\(jsonString)');", completionHandler: nil)
            }
        }

        // MARK: - WKUIDelegate

        // Block popups
        func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
            // Block popup windows
            if let url = navigationAction.request.url {
                parent.onExternalLinkRequested?(url)
            }
            return nil
        }

        // Block JavaScript alerts (or customize for kid-friendly)
        func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
            // Could show a kid-friendly alert here
            completionHandler()
        }
    }
}
