import UIKit
import Expo
import React

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
    guard let windowScene = scene as? UIWindowScene else { return }

    let window = UIWindow(windowScene: windowScene)
    self.window = window

    let appDelegate = UIApplication.shared.delegate as? AppDelegate

    if let factory = appDelegate?.reactNativeFactory {
      factory.startReactNative(
        withModuleName: "main",
        in: window,
        launchOptions: nil)
    } else {
      let delegate = ReactNativeDelegate()
      let factory = ExpoReactNativeFactory(delegate: delegate)
      delegate.dependencyProvider = RCTAppDependencyProvider()
      appDelegate?.reactNativeDelegate = delegate
      appDelegate?.reactNativeFactory = factory
      factory.startReactNative(
        withModuleName: "main",
        in: window,
        launchOptions: nil)
    }
  }
}


