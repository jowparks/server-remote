import ExpoModulesCore

public class SshModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  var session: Session?

  
  public func definition() -> ModuleDefinition {

    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('SshModule')` in JavaScript.
    Name("SshModule")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    Constants([
      "PI": Double.pi
    ])

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      return "Hello world! 👋"
    }

    AsyncFunction("testRust") { (num1: UInt64, num2: UInt64) throws -> UInt64 in
      return testRust(num1: num1, num2: num2)
    }

    AsyncFunction("connect") { (user: String, password: String, addrs: String) async throws -> Void in
      self.session = try await connect(user: user, password: password, addrs: addrs)
    }
  }
}
