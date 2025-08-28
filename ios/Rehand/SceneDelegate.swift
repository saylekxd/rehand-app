import UIKit
import Expo
import React
import ReactAppDependencyProvider

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
    guard let windowScene = scene as? UIWindowScene else { return }

    let window = UIWindow(windowScene: windowScene)
    self.window = window

    let appDelegate = UIApplication.shared.delegate as? AppDelegate

    #if DEBUG
      // In development, let Expo Dev Client/Launcher own the boot process and bundle URL.
      // Just make the window key & visible; Dev Launcher will replace rootViewController.
      window.rootViewController = UIViewController()
      window.makeKeyAndVisible()
    #else
      // In release, start React Native with the pre-bundled JS.
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
    #endif
  }
}


