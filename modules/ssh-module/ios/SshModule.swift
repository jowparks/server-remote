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
    Events("exec")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      return "Hello world! 👋"
    }

    AsyncFunction("connect") { (user: String, password: String, addrs: String) async throws -> Void in
      self.session = try connect(user: user, password: password, addrs: addrs)
    }

    AsyncFunction("exec") { (commandId: String, command: String) async throws -> String in
        guard let session = self.session else {
            throw NSError(domain: "app.reflect.serverremote", code: 1, userInfo: [NSLocalizedDescriptionKey: "Session is null"])
        }
        
        let isCompleted = IsCompleted()

        @Sendable func getData() async {
            while let data = await session.readOutput(commandId: commandId) {
                self.sendEvent("exec", ["commandId": commandId, "data": data])
            }
        }

        let task = Task {
            while true {
                let isCompleted = await isCompleted.get()
                if isCompleted {
                    break
                }
                try await Task.sleep(nanoseconds: 100_000_000) // Sleep for 100ms
                await getData()
            }
        }
        
        do {
            let returnCode = try await session.exec(commandId: commandId, command: command)
            await isCompleted.set(true)
            try await task.value
            await getData()
            self.sendEvent("exec", ["commandId": commandId, "data": "eventingComplete"])
            
            return returnCode
        } catch {
            print("exec error: "+String(describing: error))
            throw error
        }
    }
      
      AsyncFunction("cancel") { (commandId: String) async throws -> String in
          guard let session = self.session else {
              throw NSError(domain: "app.reflect.serverremote", code: 1, userInfo: [NSLocalizedDescriptionKey: "Session is null"])
          }
          try await session.cancel(commandId: commandId)
          return "0"
      }

  }
}

actor IsCompleted {
    private var isCompleted = false
    func get() -> Bool {
        return isCompleted
    }
    func set(_ value: Bool) {
        isCompleted = value
    }
}
